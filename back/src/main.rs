mod modules;

use axum::{
    Router,
    http::Method,
    middleware,
    routing::{get, post},
};
use dotenvy::dotenv;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use tower_http::cors::{Any, CorsLayer};

use crate::modules::{
    agenda::handlers::{calcular_agenda_handler, pacientes_por_fecha},
    auth::handlers::{auth_middleware, login, seed_default_user},
    pacientes::handlers::{
        aplicar_vacunas, batch_next_vaccines, get_paciente_perfil, get_pacientes_agenda,
        get_pacientes_search, update_paciente,
    },
    registro::handlers::crear_paciente,
    vacunas::handlers::{listar_biologicos, crear_biologico_completo},
    validador::handlers::evaluar_esquema,
    personal::handlers::{create_personal, get_personal, soft_delete_personal, update_personal, update_pin},
    notificaciones::handlers::enviar_notificacion_vacunas,
    logs::handlers::get_logs,
    estadisticas::handlers::obtener_estadisticas,
};

#[derive(Clone)]
pub struct AppState {
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

    // Auto-seed: crea usuario admin si no existe ninguno
    let exists = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM personal_salud")
        .fetch_one(&pool)
        .await
        .unwrap_or(0);
    if exists == 0 {
        let hash = bcrypt::hash("1234", 12).unwrap();
        sqlx::query(
            "INSERT INTO personal_salud (cedula, pin_hash, nombre_completo, rol) VALUES ($1, $2, $3, $4)",
        )
        .bind("admin")
        .bind(&hash)
        .bind("Administrador")
        .bind("coordinador")
        .execute(&pool)
        .await
        .unwrap();
        println!("👤 Usuario admin creado — Cédula: admin, PIN: 1234");

        let hash2 = bcrypt::hash("1234", 12).unwrap();
        sqlx::query(
            "INSERT INTO personal_salud (cedula, pin_hash, nombre_completo, rol) VALUES ($1, $2, $3, $4)",
        )
        .bind("30911147")
        .bind(&hash2)
        .bind("Andrés")
        .bind("enfermero")
        .execute(&pool)
        .await
        .unwrap();
        println!("👤 Usuario 30911147 creado — Cédula: 30911147, PIN: 1234");
    }

    let state = AppState { db: pool };

    let app = Router::new()
        .route("/auth/login", post(login))
        .route("/auth/seed", get(seed_default_user))
        .merge(
            Router::new()
                .route("/pacientes", post(crear_paciente).get(get_pacientes_agenda))
                .route("/pacientes/search", get(get_pacientes_search))
                .route(
                    "/pacientes/{id}",
                    get(get_paciente_perfil).put(update_paciente),
                )
                .route("/biologicos", get(listar_biologicos).post(crear_biologico_completo))
                .route("/pacientes/{id}/vacunas", post(aplicar_vacunas))
                .route("/pacientes/next-vaccines", post(batch_next_vaccines))
                .route("/validador/esquema", post(evaluar_esquema))
                .route("/agenda", post(calcular_agenda_handler))
                .route("/agenda/pacientes-por-fecha", get(pacientes_por_fecha))
                .route("/personal", get(get_personal).post(create_personal))
                .route("/personal/{id}", axum::routing::put(update_personal).delete(soft_delete_personal))
                .route("/personal/{id}/pin", axum::routing::patch(update_pin))
                .route("/notificaciones/comprobante", post(enviar_notificacion_vacunas))
                .route("/logs", get(get_logs))
                .route("/estadisticas", get(obtener_estadisticas))
                .layer(middleware::from_fn(auth_middleware)),
        )
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Servidor corriendo en http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}
