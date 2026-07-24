use super::models::CreatePacientePayload;
use crate::AppState;
use crate::modules::auth::models::Claims;
use crate::modules::logs::handlers::log_action;
use axum::{Json, extract::{Extension, State}, http::{StatusCode, HeaderMap}, response::IntoResponse};
use sqlx::Row;

pub async fn crear_paciente(
    State(state): State<AppState>,
    headers: HeaderMap,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<CreatePacientePayload>,
) -> impl IntoResponse {
    println!("🔍 Auditando Payload recibido:\n{:#?}", payload);

    let etnia_str = payload
        .etnia
        .as_ref()
        .map(|e| serde_json::to_string(e).unwrap().replace("\"", ""));
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
    for vacuna in &payload.vacunas {
        let query_vacuna = r#"
            INSERT INTO paciente_vacunas (paciente_id, biologico_id, dosis_id, fecha_aplicacion, enfermera_id) 
            VALUES ($1, $2, $3, CURRENT_DATE, $4)
        "#;

        if let Err(e) = sqlx::query(query_vacuna)
            .bind(paciente_id)
            .bind(vacuna.biologico_id)
            .bind(vacuna.dosis_id)
            .bind(claims.sub)
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
    for alergia in &payload.alergias {
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

    let telefono = payload.telefono.clone();
    let payload_bg = payload.clone();
    let enfermera_nombre = claims.nombre.clone();
    let enfermera_id = claims.sub;
    let pool = state.db.clone();

    tokio::spawn(async move {
        log_action(
            &pool,
            enfermera_id,
            "REGISTRO",
            "PACIENTE",
            Some(paciente_id),
            &detalles,
            None,
            None,
        )
        .await;

        if let Some(tel) = telefono {
            let msg_bienvenida = format!("Hola {} {}, has sido registrado exitosamente en el Sistema Integrado de Salud PAI. Tu número de historia es {}-{}.", payload_bg.nombre, payload_bg.apellido, payload_bg.nacionalidad, payload_bg.cedula);
            
            if payload_bg.vacunas.is_empty() {
                let _ = crate::modules::notificaciones::client::enviar_notificacion_vacuna(&tel, &msg_bienvenida).await;
            } else {
                let query_historial = r#"
                    SELECT 
                        cb.nombre AS vacuna,
                        ed.nombre AS dosis,
                        pv.fecha_aplicacion
                    FROM paciente_vacunas pv
                    JOIN catalogo_biologicos cb ON pv.biologico_id = cb.id
                    JOIN esquema_dosis ed ON pv.dosis_id = ed.id
                    WHERE pv.paciente_id = $1
                    ORDER BY pv.fecha_aplicacion DESC
                "#;
                
                struct FilaOwned {
                    vacuna: String,
                    dosis: String,
                    fecha: chrono::NaiveDate,
                }
                let mut filas_owned = Vec::new();
                
                if let Ok(records) = sqlx::query(query_historial)
                    .bind(paciente_id)
                    .fetch_all(&pool)
                    .await
                {
                    for row in records {
                        let vacuna: String = row.get("vacuna");
                        let dosis: String = row.get("dosis");
                        let fecha: chrono::NaiveDate = row.get("fecha_aplicacion");
                        filas_owned.push(FilaOwned { vacuna, dosis, fecha });
                    }
                }

                let vacunas_fila: Vec<crate::modules::notificaciones::pdf_generator::VacunaAplicadaFila> = filas_owned.iter().map(|f| {
                    crate::modules::notificaciones::pdf_generator::VacunaAplicadaFila {
                        vacuna: &f.vacuna,
                        dosis: &f.dosis,
                        fecha: f.fecha,
                    }
                }).collect();

                let cedula_full = format!("{}-{}", payload_bg.nacionalidad, payload_bg.cedula);
                let datos = crate::modules::notificaciones::pdf_generator::DatosVacunacion {
                    nombre: &payload_bg.nombre,
                    cedula: &cedula_full,
                    fecha_nacimiento: Some(payload_bg.fecha_nacimiento),
                    sexo: &payload_bg.genero,
                    vacunas: vacunas_fila,
                    enfermera_responsable: enfermera_nombre,
                };

                if let Ok(pdf_base64) = crate::modules::notificaciones::pdf_generator::generar_comprobante_pdf(&datos) {
                    let _ = crate::modules::notificaciones::client::enviar_notificacion_pdf_vacuna(&tel, &msg_bienvenida, &pdf_base64).await;
                } else {
                    let _ = crate::modules::notificaciones::client::enviar_notificacion_vacuna(&tel, &msg_bienvenida).await;
                }
            }
        }
    });

    (
        StatusCode::CREATED,
        format!("Paciente creado exitosamente con ID: {}", paciente_id),
    )
}
