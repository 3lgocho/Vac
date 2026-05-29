mod modules; // 👈 Importas tu nueva estructura

use axum::{
    Router,
    http::Method,
    routing::{get, post},
};
use dotenvy::dotenv;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use tower_http::cors::{Any, CorsLayer};

// Importamos de forma limpia los handlers de cada módulo
use crate::modules::{
    agenda::handlers::{calcular_agenda_handler, pacientes_por_fecha},
    pacientes::handlers::{
        aplicar_vacunas, batch_next_vaccines, get_paciente_perfil, get_pacientes_agenda,
        get_pacientes_search, update_paciente,
    },
    registro::handlers::crear_paciente,
    vacunas::handlers::listar_biologicos,
    validador::handlers::evaluar_esquema,
};

#[derive(Clone)]
pub struct AppState {
    // 👈 Debe ser pub
    pub db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL no encontrada en .env");

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(Any)
        .allow_headers(Any);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Error conectando a la base de datos");

    println!("✅ Conectado a PostgreSQL exitosamente");

    let state = AppState { db: pool };

    // El enrutamiento se mantiene igual pero ahora apunta a los módulos
    let app = Router::new()
        .route("/pacientes", post(crear_paciente).get(get_pacientes_agenda))
        .route("/pacientes/search", get(get_pacientes_search))
        .route(
            "/pacientes/{id}",
            get(get_paciente_perfil).put(update_paciente),
        )
        .route("/biologicos", get(listar_biologicos))
        .route("/pacientes/{id}/vacunas", post(aplicar_vacunas))
        .route("/pacientes/next-vaccines", post(batch_next_vaccines))
        .route("/validador/esquema", post(evaluar_esquema))
        .route("/agenda", post(calcular_agenda_handler))
        .route("/agenda/pacientes-por-fecha", get(pacientes_por_fecha))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Servidor corriendo en http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
