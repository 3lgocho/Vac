use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

use super::models::PerfilPaciente;
use super::reglas::obtener_esquema_disponible;
use crate::AppState;

pub async fn evaluar_esquema(
    State(state): State<AppState>,
    Json(payload): Json<PerfilPaciente>,
) -> impl IntoResponse {
    let esquema = obtener_esquema_disponible(&state.db, &payload).await.unwrap_or_default();
    eprintln!(
        "🔍 VALIDADOR: fecha_nac={:?}, grupos={:?}, vacunas_aplicadas={:?}, resultado={} items",
        payload.fecha_nacimiento,
        payload.grupos_especiales,
        payload.vacunas_aplicadas,
        esquema.len()
    );
    (StatusCode::OK, Json(esquema))
}
