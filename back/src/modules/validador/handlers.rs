use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use super::models::PerfilPaciente;
use super::reglas::obtener_esquema_disponible;
use crate::AppState;

pub async fn evaluar_esquema(
    State(_state): State<AppState>,
    Json(payload): Json<PerfilPaciente>,
) -> impl IntoResponse {
    let esquema = obtener_esquema_disponible(&payload);
    (StatusCode::OK, Json(esquema))
}
