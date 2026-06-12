use super::models::CreatePacientePayload;
use crate::AppState;
use crate::modules::auth::models::Claims;
use crate::modules::logs::handlers::log_action;
use axum::{Json, extract::{Extension, State}, http::{StatusCode, HeaderMap}, response::IntoResponse};

pub async fn crear_paciente(
    State(state): State<AppState>,
    headers: HeaderMap,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreatePacientePayload>,
) -> impl IntoResponse {
    println!("🔍 Auditando Payload recibido:\n{:#?}", payload);

    let etnia_str = payload
        .etnia
        .map(|e| serde_json::to_string(&e).unwrap().replace("\"", ""));
    let grupos_json = serde_json::to_value(&payload.grupos_especiales).unwrap();

    // 1. INICIAR TRANSACCIÓN
    // Si algo falla a mitad de camino, cancelamos todo para no tener datos corruptos.
    let mut tx = match state.db.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            eprintln!("Error al iniciar transacción: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error interno de base de datos".to_string(),
            );
        }
    };

    // 1.5 VERIFICAR IDEMPOTENCIA
    if let Some(idempotency_key) = headers.get("Idempotency-Key").and_then(|h| h.to_str().ok()) {
        let query_idempotency = "INSERT INTO idempotency_keys (key) VALUES ($1)";
        if let Err(e) = sqlx::query(query_idempotency)
            .bind(idempotency_key)
            .execute(&mut *tx)
            .await
        {
            let _ = tx.rollback().await;
            eprintln!("Error de idempotencia (duplicado): {:?}", e);
            return (
                StatusCode::CONFLICT,
                "Petición duplicada interceptada".to_string(),
            );
        }
    }

    // 2. INSERTAR PACIENTE
    let query_paciente = r#"
        INSERT INTO pacientes (
            cedula, nacionalidad, nombre, apellido, fecha_nacimiento, genero,
            orden_hijo, direccion_comunidad, direccion_calle, direccion_casa,
            etnia, grupos_especiales, telefono, correo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id
    "#;

    let paciente_id = match sqlx::query_scalar::<_, i32>(query_paciente)
        .bind(&payload.cedula)
        .bind(&payload.nacionalidad)
        .bind(&payload.nombre)
        .bind(&payload.apellido)
        .bind(&payload.fecha_nacimiento)
        .bind(&payload.genero)
        .bind(&payload.orden_hijo)
        .bind(&payload.direccion_comunidad)
        .bind(&payload.direccion_calle)
        .bind(&payload.direccion_casa)
        .bind(etnia_str)
        .bind(grupos_json)
        .bind(&payload.telefono) // <-- Agregado
        .bind(&payload.correo) // <-- Agregado
        .fetch_one(&mut *tx)
        .await
    {
        Ok(id) => id,
        Err(e) => {
            let _ = tx.rollback().await; // Deshacemos la transacción
            eprintln!("Error insertando paciente: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error guardando el paciente".to_string(),
            );
        }
    };

    // 3. INSERTAR VACUNAS (Si hay alguna)
    for vacuna in payload.vacunas {
        let query_vacuna = r#"
            INSERT INTO paciente_vacunas (paciente_id, biologico_id, dosis_id, fecha_aplicacion) 
            VALUES ($1, $2, $3, CURRENT_DATE)
        "#;

        if let Err(e) = sqlx::query(query_vacuna)
            .bind(paciente_id)
            .bind(vacuna.biologico_id)
            .bind(vacuna.dosis_id)
            .execute(&mut *tx)
            .await
        {
            let _ = tx.rollback().await;
            eprintln!("Error insertando vacuna: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error guardando las vacunas".to_string(),
            );
        }
    }

    // 4. INSERTAR ALERGIAS (Si hay alguna)
    for alergia in payload.alergias {
        let query_alergia = r#"
            INSERT INTO paciente_alergias (paciente_id, biologico_id, fecha_registro) 
            VALUES ($1, $2, CURRENT_DATE)
        "#;

        if let Err(e) = sqlx::query(query_alergia)
            .bind(paciente_id)
            .bind(alergia.biologico_id)
            .execute(&mut *tx)
            .await
        {
            let _ = tx.rollback().await;
            eprintln!("Error insertando alergia: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error guardando las alergias".to_string(),
            );
        }
    }

    // 5. CONFIRMAR TRANSACCIÓN
    // Si llegamos hasta aquí, todo salió bien. Guardamos definitivamente en la base de datos.
    if let Err(e) = tx.commit().await {
        eprintln!("Error confirmando la transacción: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error confirmando los datos".to_string(),
        );
    }

    let detalles = format!(
        "{} registró a {} {} cédula {}-{}",
        claims.nombre, payload.nombre, payload.apellido, payload.nacionalidad, payload.cedula
    );

    log_action(
        &state.db,
        claims.sub,
        "REGISTRO",
        "PACIENTE",
        Some(paciente_id),
        &detalles,
        None,
        None,
    )
    .await;

    (
        StatusCode::CREATED,
        format!("Paciente creado exitosamente con ID: {}", paciente_id),
    )
}
