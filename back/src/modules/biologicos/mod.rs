use super::handlers::listar_biologicos;
use crate::AppState;
use axum::{Router, routing::get};

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(listar_biologicos))
}
