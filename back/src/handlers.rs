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
    // 1. Buscar Paciente
    let paciente = sqlx::query_as::<_, Paciente>("SELECT * FROM pacientes WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let paciente = match paciente {
        Some(p) => p,
        None => return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string())),
    };

    // 2. Buscar Historial (Corregido a la tabla paciente_vacunas)
    let query_vacunas = r#"
        SELECT 
            pv.id, 
            b.nombre as biologico_nombre, 
            d.nombre_dosis as dosis_nombre, 
            DATE(pv.fecha_aplicacion) as fecha_aplicacion, 
            'N/A' as lote, 
            'N/A' as vacunador 
        FROM paciente_vacunas pv
        JOIN catalogo_biologicos b ON pv.biologico_id = b.id
        JOIN esquema_dosis d ON pv.dosis_id = d.id
        WHERE pv.paciente_id = $1
        ORDER BY pv.fecha_aplicacion DESC
    "#;

    let historial = sqlx::query_as::<_, VacunaAplicada>(query_vacunas)
        .bind(id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]);

    // 3. Buscar Alergias
    let query_alergias = r#"
        SELECT 
            pa.id,
            b.nombre as biologico_nombre,
            DATE(pa.fecha_registro) as fecha_registro
        FROM paciente_alergias pa
        JOIN catalogo_biologicos b ON pa.biologico_id = b.id
        WHERE pa.paciente_id = $1
        ORDER BY pa.fecha_registro DESC
    "#;

    let alergias = sqlx::query_as::<_, crate::models::paciente::Alergia>(query_alergias)
        .bind(id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]);

    // 4. Retornar Payload completo
    Ok(Json(PacientePerfilPayload {
        paciente,
        historial,
        alergias,
    }))
}
// =====================================================================
// 4. HANDLER DE EDICIÓN (PUT para actualizar contacto y dirección)
// =====================================================================
// Actualiza la función update_paciente:
pub async fn update_paciente(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdatePacientePayload>,
) -> Result<(StatusCode, &'static str), (StatusCode, String)> {
    let query = r#"
        UPDATE pacientes 
        SET cedula = $1, nombre = $2, apellido = $3, fecha_nacimiento = $4, 
            sexo = $5, telefono = $6, correo = $7, direccion_comunidad = $8, 
            direccion_calle = $9, direccion_casa = $10
        WHERE id = $11
    "#;

    let result = sqlx::query(query)
        .bind(&payload.cedula)
        .bind(&payload.nombre)
        .bind(&payload.apellido)
        .bind(&payload.fecha_nacimiento)
        .bind(&payload.sexo)
        .bind(&payload.telefono)
        .bind(&payload.correo)
        .bind(&payload.direccion_comunidad)
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
