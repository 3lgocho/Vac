// src/handlers.rs
use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};

// Importamos exactamente lo que necesitamos del nuevo sistema de módulos
use crate::{
    AppState,
    models::{
        AgendaParams, Paciente, PacientePerfilPayload, SearchParams, UpdatePacientePayload,
        VacunaAplicada,
    },
};

// =====================================================================
// 1. HANDLER DE AGENDA (Para las cards del calendario)
// =====================================================================
pub async fn get_pacientes_agenda(
    State(state): State<AppState>,
    Query(params): Query<AgendaParams>,
) -> Result<Json<Vec<Paciente>>, (StatusCode, String)> {
    // Filtramos estrictamente por el día ignorando las horas
    // NOTA: Si tu columna no es 'creado_en' sino 'fecha_cita', cámbialo aquí
    let query = "SELECT * FROM pacientes WHERE DATE(creado_en) = DATE($1) ORDER BY id DESC";

    let pacientes = sqlx::query_as::<_, Paciente>(query)
        .bind(&params.fecha)
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(pacientes))
}

// =====================================================================
// 2. HANDLER DE BÚSQUEDA (Para la lista principal del tab Pacientes)
// =====================================================================
pub async fn get_pacientes_search(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<Paciente>>, (StatusCode, String)> {
    let search_term = format!("%{}%", params.q.unwrap_or_default());

    let query = r#"
        SELECT * FROM pacientes 
        WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR cedula ILIKE $1 
        ORDER BY id DESC LIMIT 50
    "#;

    let pacientes = sqlx::query_as::<_, Paciente>(query)
        .bind(search_term)
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(pacientes))
}

// =====================================================================
// 3. HANDLER DE PERFIL (Para la vista detallada [id].tsx)
// =====================================================================
pub async fn get_paciente_perfil(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<PacientePerfilPayload>, (StatusCode, String)> {
    // Buscamos los datos básicos del paciente
    let paciente = sqlx::query_as::<_, Paciente>("SELECT * FROM pacientes WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let paciente = match paciente {
        Some(p) => p,
        None => return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string())),
    };

    // Buscamos su historial de vacunas (JOIN entre vacunas_aplicadas, biologicos y dosis)
    let query_vacunas = r#"
        SELECT 
            va.id, 
            b.nombre as biologico_nombre, 
            d.nombre_dosis as dosis_nombre, 
            DATE(va.fecha_aplicacion) as fecha_aplicacion, 
            va.lote, 
            va.vacunador 
        FROM vacunas_aplicadas va
        JOIN catalogo_biologicos b ON va.biologico_id = b.id
        JOIN esquema_dosis d ON va.dosis_id = d.id
        WHERE va.paciente_id = $1
        ORDER BY va.fecha_aplicacion DESC
    "#;

    let historial = sqlx::query_as::<_, VacunaAplicada>(query_vacunas)
        .bind(id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]); // Retorna vacío si falla o no hay vacunas

    // Devolvemos el Payload unificado que definimos en paciente.rs
    Ok(Json(PacientePerfilPayload {
        paciente,
        historial,
    }))
}

// =====================================================================
// 4. HANDLER DE EDICIÓN (PUT para actualizar contacto y dirección)
// =====================================================================
pub async fn update_paciente(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdatePacientePayload>,
) -> Result<(StatusCode, &'static str), (StatusCode, String)> {
    let query = r#"
        UPDATE pacientes 
        SET telefono = $1, correo = $2, direccion_calle = $3, direccion_casa = $4
        WHERE id = $5
    "#;

    let result = sqlx::query(query)
        .bind(&payload.telefono)
        .bind(&payload.correo)
        .bind(&payload.direccion_calle)
        .bind(&payload.direccion_casa)
        .bind(id)
        .execute(&state.db)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => Ok((StatusCode::OK, "Paciente actualizado")),
        Ok(_) => Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string())),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
