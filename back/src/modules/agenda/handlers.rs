use std::collections::HashMap;

use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

use super::calculador::calcular_agenda;
use crate::AppState;
use crate::modules::pacientes::models::{HistorialConPacienteRow, Paciente};
use crate::modules::registro::models::GrupoEspecial;
use crate::modules::validador::models::{PerfilPaciente, VacunaAplicadaInput};
use crate::modules::validador::reglas::obtener_esquema_disponible;

pub async fn calcular_agenda_handler(
    State(_state): State<AppState>,
    Json(payload): Json<PerfilPaciente>,
) -> impl IntoResponse {
    let faltantes = obtener_esquema_disponible(&payload);
    let programadas = calcular_agenda(&payload, &faltantes);
    (StatusCode::OK, Json(programadas))
}

#[derive(Deserialize)]
pub struct FechaQuery {
    pub fecha: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PacienteAgendaItem {
    pub paciente_id: i32,
    pub paciente_nombre: String,
    pub paciente_apellido: String,
    pub cedula: String,
    pub vacuna: String,
    pub dosis: String,
    pub fecha_sugerida: NaiveDate,
    pub estado: String,
}

pub async fn pacientes_por_fecha(
    State(state): State<AppState>,
    Query(params): Query<FechaQuery>,
) -> Result<Json<Vec<PacienteAgendaItem>>, (StatusCode, String)> {
    let target_date: NaiveDate = params
        .fecha
        .parse()
        .map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                "Formato de fecha inválido. Use YYYY-MM-DD".to_string(),
            )
        })?;

    let pacientes = sqlx::query_as::<_, Paciente>("SELECT * FROM pacientes ORDER BY id")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let historial = sqlx::query_as::<_, HistorialConPacienteRow>(
        r#"SELECT pv.paciente_id, pv.biologico_id, b.nombre as biologico_nombre,
                  pv.dosis_id, d.nombre_dosis as dosis_nombre, pv.fecha_aplicacion
           FROM paciente_vacunas pv
           JOIN catalogo_biologicos b ON pv.biologico_id = b.id
           JOIN esquema_dosis d ON pv.dosis_id = d.id
           ORDER BY pv.paciente_id, pv.fecha_aplicacion DESC"#,
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut history_map: HashMap<i32, Vec<HistorialConPacienteRow>> = HashMap::new();
    for row in historial {
        history_map.entry(row.paciente_id).or_default().push(row);
    }

    let mut results = Vec::new();
    for paciente in &pacientes {
        let vacunas = history_map.remove(&paciente.id).unwrap_or_default();

        let grupos: Vec<GrupoEspecial> = paciente
            .grupos_especiales
            .as_ref()
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default();

        let perfil = PerfilPaciente {
            fecha_nacimiento: paciente.fecha_nacimiento,
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
        let agenda = calcular_agenda(&perfil, &faltantes);

        for dosis in agenda {
            if dosis.fecha_sugerida == target_date {
                results.push(PacienteAgendaItem {
                    paciente_id: paciente.id,
                    paciente_nombre: paciente.nombre.clone(),
                    paciente_apellido: paciente.apellido.clone(),
                    cedula: paciente.cedula.clone(),
                    vacuna: dosis.nombre,
                    dosis: dosis.dosis_a_aplicar,
                    fecha_sugerida: dosis.fecha_sugerida,
                    estado: dosis.estado,
                });
            }
        }
    }

    Ok(Json(results))
}
