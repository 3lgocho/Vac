use super::models::{Biologico, CreateVacunaAplicadaDto, CreateBiologicoCompletoDto};
use crate::AppState;
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

// --- HANDLER GET: Listar Biológicos con sus Dosis ---
pub async fn listar_biologicos(State(state): State<AppState>) -> impl IntoResponse {
    let query = r#"
        SELECT 
            c.id, c.nombre, c.descripcion,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', e.id,
                        'nombre_dosis', e.nombre_dosis,
                        'orden_aplicacion', e.orden_aplicacion
                    ) ORDER BY e.orden_aplicacion
                ) FILTER (WHERE e.id IS NOT NULL), '[]'
            ) AS dosis
        FROM catalogo_biologicos c
        LEFT JOIN esquema_dosis e ON c.id = e.biologico_id
        WHERE c.activo = TRUE
        GROUP BY c.id, c.nombre, c.descripcion
        ORDER BY c.id;
    "#;

    let result = sqlx::query_as::<_, Biologico>(query)
        .fetch_all(&state.db)
        .await;

    match result {
        Ok(biologicos) => (StatusCode::OK, Json(biologicos)),
        Err(e) => {
            eprintln!("Error listando biológicos: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Vec::<Biologico>::new()),
            )
        }
    }
}

// --- HANDLER POST: Registrar VacunaAplicada ---
pub async fn registrar_vacuna_aplicada(
    State(state): State<AppState>,
    Json(payload): Json<CreateVacunaAplicadaDto>,
) -> impl IntoResponse {
    let query = r#"
        INSERT INTO vacunas_aplicadas (
            paciente_id, dosis_id, biologico_id, via_aplicacion, fecha_aplicacion, 
            lote, fecha_caducidad, fecha_fabricacion, nombre_fabricante, 
            registro_sanitario, dosis_ml, observacion
        ) VALUES (
            $1, $2, $3, $4, $5, 
            $6, $7, $8, $9, 
            $10, $11, $12
        ) RETURNING id
    "#;

    let result = sqlx::query_scalar::<_, i32>(query)
        .bind(&payload.paciente_id)
        .bind(&payload.dosis_id)
        .bind(&payload.biologico_id)
        .bind(&payload.via_aplicacion)
        .bind(&payload.fecha_aplicacion)
        .bind(&payload.lote)
        .bind(&payload.fecha_caducidad)
        .bind(&payload.fecha_fabricacion)
        .bind(&payload.nombre_fabricante)
        .bind(&payload.registro_sanitario)
        .bind(&payload.dosis_ml)
        .bind(&payload.observacion)
        .fetch_one(&state.db)
        .await;

    match result {
        Ok(id) => (
            StatusCode::CREATED,
            format!("Vacuna aplicada con ID: {}", id),
        ),
        Err(e) => {
            eprintln!("Error insertando vacuna: {:?}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Error en DB".to_string())
        }
    }
}

// --- HANDLER POST: Crear Biológico con sus Dosis ---
pub async fn crear_biologico_completo(
    State(state): State<AppState>,
    Json(payload): Json<CreateBiologicoCompletoDto>,
) -> impl IntoResponse {
    let mut tx = match state.db.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            eprintln!("Error iniciando transacción: {:?}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, "Error en DB".to_string());
        }
    };

    let query_biologico = r#"
        INSERT INTO catalogo_biologicos (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING id
    "#;

    let biologico_id = match sqlx::query_scalar::<_, i32>(query_biologico)
        .bind(&payload.nombre)
        .bind(&payload.descripcion)
        .fetch_one(&mut *tx)
        .await
    {
        Ok(id) => id,
        Err(e) => {
            eprintln!("Error insertando biológico: {:?}", e);
            let _ = tx.rollback().await;
            return (StatusCode::INTERNAL_SERVER_ERROR, "Error insertando biológico".to_string());
        }
    };

    let query_dosis = r#"
        INSERT INTO esquema_dosis (
            biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses,
            intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo, es_anual
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    "#;

    for dosis in payload.dosis {
        if let Err(e) = sqlx::query(query_dosis)
            .bind(biologico_id)
            .bind(&dosis.nombre_dosis)
            .bind(dosis.orden_aplicacion)
            .bind(dosis.edad_recomendada_meses)
            .bind(dosis.intervalo_recomendado_meses)
            .bind(dosis.intervalo_minimo_meses)
            .bind(dosis.es_refuerzo)
            .bind(dosis.es_anual)
            .execute(&mut *tx)
            .await
        {
            eprintln!("Error insertando dosis: {:?}", e);
            let _ = tx.rollback().await;
            return (StatusCode::INTERNAL_SERVER_ERROR, "Error insertando dosis".to_string());
        }
    }

    if let Err(e) = tx.commit().await {
        eprintln!("Error confirmando transacción: {:?}", e);
        return (StatusCode::INTERNAL_SERVER_ERROR, "Error en DB al guardar todo".to_string());
    }

    (StatusCode::CREATED, format!("Biológico creado con ID: {}", biologico_id))
}
