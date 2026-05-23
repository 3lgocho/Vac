use super::models::*;
use crate::AppState;
use crate::modules::vacunas::models::VacunaAplicada;
use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};

pub async fn listar_pacientes(State(state): State<AppState>) -> impl IntoResponse {
    let query = r#"
        SELECT id, cedula, nacionalidad, nombre, apellido,telefono,correo,fecha_nacimiento, genero,
               orden_hijo, direccion_comunidad, etnia, grupos_especiales
        FROM pacientes ORDER BY id DESC
    "#;

    let result = sqlx::query_as::<_, Paciente>(query)
        .fetch_all(&state.db)
        .await;

    match result {
        Ok(pacientes) => (StatusCode::OK, Json(pacientes)),
        Err(e) => {
            eprintln!("Error listando pacientes: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Vec::<Paciente>::new()),
            )
        }
    }
}

pub async fn get_pacientes_agenda(
    State(state): State<AppState>,
    Query(params): Query<AgendaParams>,
) -> Result<Json<Vec<Paciente>>, (StatusCode, String)> {
    let query = "SELECT * FROM pacientes WHERE DATE(creado_en) = DATE($1) ORDER BY id DESC";

    let pacientes = sqlx::query_as::<_, Paciente>(query)
        .bind(&params.fecha)
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(pacientes))
}

pub async fn get_pacientes_search(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<PaginatedPacientes>, (StatusCode, String)> {
    let search_term = format!("%{}%", params.q.unwrap_or_default());
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).min(50);
    let offset = (page - 1) * limit;

    let total_query = r#"
        SELECT COUNT(*) FROM pacientes
        WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR cedula ILIKE $1
    "#;
    let total: (i64,) = sqlx::query_as(total_query)
        .bind(&search_term)
        .fetch_one(&state.db)
        .await
        .unwrap_or((0,));

    let query = r#"
        SELECT * FROM pacientes
        WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR cedula ILIKE $1
        ORDER BY id DESC LIMIT $2 OFFSET $3
    "#;

    let pacientes = sqlx::query_as::<_, Paciente>(query)
        .bind(search_term)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(PaginatedPacientes {
        data: pacientes,
        total: total.0,
    }))
}

pub async fn get_paciente_perfil(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<PacientePerfilPayload>, (StatusCode, String)> {
    let paciente = sqlx::query_as::<_, Paciente>("SELECT * FROM pacientes WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let paciente = match paciente {
        Some(p) => p,
        None => return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string())),
    };

    let query_vacunas = r#"
        SELECT pv.id, b.nombre as biologico_nombre, d.nombre_dosis as dosis_nombre,
               DATE(pv.fecha_aplicacion) as fecha_aplicacion, 'N/A' as lote, 'N/A' as vacunador
        FROM paciente_vacunas pv
        JOIN catalogo_biologicos b ON pv.biologico_id = b.id
        JOIN esquema_dosis d ON pv.dosis_id = d.id
        WHERE pv.paciente_id = $1 ORDER BY pv.fecha_aplicacion DESC
    "#;

    let historial = sqlx::query_as::<_, VacunaAplicada>(query_vacunas)
        .bind(id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]);

    let query_alergias = r#"
        SELECT pa.id, pa.biologico_id, b.nombre as biologico_nombre, DATE(pa.fecha_registro) as fecha_registro
        FROM paciente_alergias pa
        JOIN catalogo_biologicos b ON pa.biologico_id = b.id
        WHERE pa.paciente_id = $1 ORDER BY pa.fecha_registro DESC
    "#;

    let alergias = sqlx::query_as::<_, Alergia>(query_alergias)
        .bind(id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_else(|_| vec![]);

    Ok(Json(PacientePerfilPayload {
        paciente,
        historial,
        alergias,
    }))
}

pub async fn update_paciente(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdatePacientePayload>,
) -> Result<(StatusCode, &'static str), (StatusCode, String)> {
    let mut tx = state.db.begin().await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error al iniciar transacción: {e}")))?;

    let query = r#"
        UPDATE pacientes
        SET cedula = $1, nombre = $2, apellido = $3, fecha_nacimiento = $4,
            genero = $5, telefono = $6, correo = $7, direccion_comunidad = $8,
            direccion_calle = $9, direccion_casa = $10, etnia = $11,
            grupos_especiales = $12
        WHERE id = $13
    "#;

    let result = sqlx::query(query)
        .bind(&payload.cedula)
        .bind(&payload.nombre)
        .bind(&payload.apellido)
        .bind(&payload.fecha_nacimiento)
        .bind(&payload.genero)
        .bind(&payload.telefono)
        .bind(&payload.correo)
        .bind(&payload.direccion_comunidad)
        .bind(&payload.direccion_calle)
        .bind(&payload.direccion_casa)
        .bind(&payload.etnia)
        .bind(&payload.grupos_especiales)
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error actualizando paciente: {e}")))?;

    if result.rows_affected() == 0 {
        return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string()));
    }

    if let Some(alergias) = &payload.alergias {
        sqlx::query("DELETE FROM paciente_alergias WHERE paciente_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error eliminando alergias: {e}")))?;

        for bio_id in alergias {
            sqlx::query("INSERT INTO paciente_alergias (paciente_id, biologico_id) VALUES ($1, $2)")
                .bind(id)
                .bind(bio_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error insertando alergia: {e}")))?;
        }
    }

    tx.commit().await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error al confirmar transacción: {e}")))?;

    Ok((StatusCode::OK, "Paciente actualizado"))
}
