use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use super::calculador::calcular_agenda;
use crate::AppState;
use crate::modules::validador::models::PerfilPaciente;
use crate::modules::validador::reglas::obtener_esquema_disponible;

pub async fn calcular_agenda_handler(
    State(_state): State<AppState>,
    Json(payload): Json<PerfilPaciente>,
) -> impl IntoResponse {
    let faltantes = obtener_esquema_disponible(&payload);
    let programadas = calcular_agenda(&payload, &faltantes);
    (StatusCode::OK, Json(programadas))
}
