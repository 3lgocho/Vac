use super::handlers::{
    crear_paciente, get_paciente_perfil, get_pacientes_agenda, get_pacientes_search,
    update_paciente,
};
use crate::AppState;
use axum::{
    Router,
    routing::{get, post, put},
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", post(crear_paciente).get(get_pacientes_search))
        .route("/agenda", get(get_pacientes_agenda))
        .route("/{id}", get(get_paciente_perfil).put(update_paciente))
}
