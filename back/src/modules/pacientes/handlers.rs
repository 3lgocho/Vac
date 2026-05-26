use super::models::*;
use crate::AppState;
use crate::modules::agenda::calculador::calcular_agenda;
use crate::modules::registro::models::GrupoEspecial;
use crate::modules::vacunas::models::VacunaAplicada;
use crate::modules::validador::models::{PerfilPaciente, VacunaAplicadaInput};
use crate::modules::validador::reglas::obtener_esquema_disponible;
use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use chrono::{Local, NaiveDate};
use serde::Deserialize;
use std::collections::HashMap;

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
        SELECT pv.id, pv.biologico_id, b.nombre as biologico_nombre, pv.dosis_id, d.nombre_dosis as dosis_nombre,
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

#[derive(Deserialize)]
pub struct AplicarVacunaPayload {
    pub biologico_id: i32,
    pub dosis_id: i32,
}

pub async fn aplicar_vacunas(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<Vec<AplicarVacunaPayload>>,
) -> Result<(StatusCode, &'static str), (StatusCode, String)> {
    let exists = sqlx::query_scalar::<_, i32>("SELECT 1 FROM pacientes WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error en DB: {e}")))?;

    if exists.is_none() {
        return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string()));
    }

    let mut tx = state.db.begin().await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error al iniciar transacción: {e}")))?;

    for vacuna in &payload {
        sqlx::query(
            "INSERT INTO paciente_vacunas (paciente_id, biologico_id, dosis_id, fecha_aplicacion) VALUES ($1, $2, $3, CURRENT_DATE)"
        )
            .bind(id)
            .bind(vacuna.biologico_id)
            .bind(vacuna.dosis_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error insertando vacuna: {e}")))?;
    }

    tx.commit().await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Error al confirmar transacción: {e}")))?;

    Ok((StatusCode::CREATED, "Vacunas aplicadas exitosamente"))
}

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

pub async fn batch_next_vaccines(
    State(state): State<AppState>,
    Json(payload): Json<NextVaccinesQuery>,
) -> Result<Json<Vec<NextVaccineItem>>, (StatusCode, String)> {
    if payload.ids.is_empty() {
        return Ok(Json(vec![]));
    }

    // 1. Fetch patients (id, fecha_nacimiento, grupos_especiales)
    #[derive(sqlx::FromRow)]
    struct PatientRow {
        id: i32,
        fecha_nacimiento: NaiveDate,
        grupos_especiales: Option<serde_json::Value>,
    }

    let patients = sqlx::query_as::<_, PatientRow>(
        "SELECT id, fecha_nacimiento, grupos_especiales FROM pacientes WHERE id = ANY($1)",
    )
    .bind(&payload.ids)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching patients: {e}");
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    // 2. Fetch all vaccine histories for these patients (with names)
    let historial = sqlx::query_as::<_, HistorialConPacienteRow>(
        r#"SELECT pv.paciente_id, pv.biologico_id, b.nombre as biologico_nombre,
                  pv.dosis_id, d.nombre_dosis as dosis_nombre, pv.fecha_aplicacion
           FROM paciente_vacunas pv
           JOIN catalogo_biologicos b ON pv.biologico_id = b.id
           JOIN esquema_dosis d ON pv.dosis_id = d.id
           WHERE pv.paciente_id = ANY($1)
           ORDER BY pv.paciente_id, pv.fecha_aplicacion DESC"#,
    )
    .bind(&payload.ids)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Error fetching historial: {e}");
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    // Group by paciente_id
    let mut history_map: HashMap<i32, Vec<HistorialConPacienteRow>> = HashMap::new();
    for row in historial {
        history_map.entry(row.paciente_id).or_default().push(row);
    }

    let mut results = Vec::new();
    for patient in &patients {
        let vacunas = history_map.remove(&patient.id).unwrap_or_default();

        let grupos: Vec<GrupoEspecial> = patient
            .grupos_especiales
            .as_ref()
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let perfil = PerfilPaciente {
            fecha_nacimiento: patient.fecha_nacimiento,
            grupos_especiales: grupos,
            vacunas_aplicadas: vacunas
                .iter()
                .map(|v| VacunaAplicadaInput {
                    biologico_id: v.biologico_id,
                    dosis_id: v.dosis_id,
                    fecha_aplicacion: Some(v.fecha_aplicacion),
                })
                .collect(),
        };

        let faltantes = obtener_esquema_disponible(&perfil);
        let ultima = vacunas.first();

        if faltantes.is_empty() {
            if let Some(ult) = ultima {
                results.push(NextVaccineItem {
                    paciente_id: patient.id,
                    nombre_vacuna: ult.biologico_nombre.clone(),
                    dosis_a_aplicar: ult.dosis_nombre.clone(),
                    fecha_sugerida: ult.fecha_aplicacion,
                    estado: "Al día".to_string(),
                });
            } else {
                results.push(NextVaccineItem {
                    paciente_id: patient.id,
                    nombre_vacuna: "Sin vacunas".to_string(),
                    dosis_a_aplicar: String::new(),
                    fecha_sugerida: hoy(),
                    estado: "Sin vacunas".to_string(),
                });
            }
        } else {
            let agenda = calcular_agenda(&perfil, &faltantes);

            if let Some(ult) = ultima {
                // El estado atrasada solo aplica si la SIGUIENTE dosis
                // del mismo biológico está vencida, no si otra vacuna
                // sin relación está pendiente
                let mismo_atrasado = agenda.iter().any(|d| {
                    d.biologico_id == ult.biologico_id && d.estado == "Atrasada"
                });
                results.push(NextVaccineItem {
                    paciente_id: patient.id,
                    nombre_vacuna: ult.biologico_nombre.clone(),
                    dosis_a_aplicar: ult.dosis_nombre.clone(),
                    fecha_sugerida: ult.fecha_aplicacion,
                    estado: if mismo_atrasado {
                        "Atrasada".to_string()
                    } else {
                        "Al día".to_string()
                    },
                });
            } else {
                let mut sorted = agenda;
                sorted.sort_by_key(|d| d.fecha_sugerida);
                if let Some(primera) = sorted.first() {
                    results.push(NextVaccineItem {
                        paciente_id: patient.id,
                        nombre_vacuna: primera.nombre.clone(),
                        dosis_a_aplicar: primera.dosis_a_aplicar.clone(),
                        fecha_sugerida: primera.fecha_sugerida,
                        estado: primera.estado.clone(),
                    });
                }
            }
        }
    }

    Ok(Json(results))
}
