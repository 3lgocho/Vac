mod handlers;
mod models;

use axum::{
    Router,
    extract::{Json, State},
    http::{Method, StatusCode},
    response::IntoResponse,
    routing::{get, post, put},
};
use dotenvy::dotenv;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::env;
use tower_http::cors::{Any, CorsLayer};

use crate::handlers::{
    get_paciente_perfil, get_pacientes_agenda, get_pacientes_search, update_paciente,
};
use crate::models::{Biologico, CreatePacientePayload, Paciente};

// ... resto de tu código (AppState, main, etc.)

#[derive(Clone)]
struct AppState {
    db: PgPool,
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

    let app = Router::new()
        .route("/pacientes", post(crear_paciente).get(get_pacientes_search))
        .route("/pacientes/agenda", get(get_pacientes_agenda))
        .route(
            "/pacientes/{id}",
            get(get_paciente_perfil).put(update_paciente),
        )
        .route("/biologicos", get(listar_biologicos))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Servidor corriendo en http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

// --- HANDLER POST: Crear Paciente ---
async fn crear_paciente(
    State(state): State<AppState>,
    Json(payload): Json<CreatePacientePayload>,
) -> impl IntoResponse {
    println!("🔍 Auditando Payload recibido:\n{:#?}", payload);

    let etnia_str = payload
        .etnia
        .map(|e| serde_json::to_string(&e).unwrap().replace("\"", ""));
    let grupos_json = serde_json::to_value(&payload.grupos_especiales).unwrap();

    let query = r#"
        INSERT INTO pacientes (
            cedula, nacionalidad, nombre, apellido, fecha_nacimiento, sexo, 
            orden_hijo, direccion_comunidad, direccion_calle, direccion_casa, 
            etnia, grupos_especiales
        ) VALUES (
            $1, $2, $3, $4, $5, $6, 
            $7, $8, $9, $10, 
            $11, $12
        ) RETURNING id
    "#;

    let result = sqlx::query_scalar::<_, i32>(query)
        .bind(&payload.cedula)
        .bind(&payload.nacionalidad)
        .bind(&payload.nombre)
        .bind(&payload.apellido)
        .bind(&payload.fecha_nacimiento)
        .bind(&payload.sexo)
        .bind(&payload.orden_hijo)
        .bind(&payload.direccion_comunidad)
        .bind(&payload.direccion_calle)
        .bind(&payload.direccion_casa)
        .bind(etnia_str)
        .bind(grupos_json)
        .fetch_one(&state.db)
        .await;

    match result {
        Ok(id) => (
            StatusCode::CREATED,
            format!("Paciente creado exitosamente con ID: {}", id),
        ),
        Err(e) => {
            eprintln!("Error insertando paciente: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error al guardar el paciente en la base de datos".to_string(),
            )
        }
    }
}

// --- HANDLER GET: Listar Todos los Pacientes ---
async fn listar_pacientes(State(state): State<AppState>) -> impl IntoResponse {
    let query = r#"
        SELECT id, cedula, nacionalidad, nombre, apellido,telefono,correo,fecha_nacimiento, sexo, 
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

// --- HANDLER GET: Listar Biológicos con sus Dosis ---
async fn listar_biologicos(State(state): State<AppState>) -> impl IntoResponse {
    let query = r#"
        SELECT 
            c.id, 
            c.nombre, 
            c.descripcion,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', e.id,
                        'nombre_dosis', e.nombre_dosis,
                        'orden_aplicacion', e.orden_aplicacion
                    ) ORDER BY e.orden_aplicacion
                ) FILTER (WHERE e.id IS NOT NULL), '[]'
            ) AS dosis
        FROM catalogo_biologicos c
        LEFT JOIN esquema_dosis e ON c.id = e.biologico_id
        WHERE c.activo = TRUE
        GROUP BY c.id, c.nombre, c.descripcion
        ORDER BY c.id;
    "#;

    let result = sqlx::query_as::<_, Biologico>(query)
        .fetch_all(&state.db)
        .await;

    match result {
        Ok(biologicos) => (StatusCode::OK, Json(biologicos)),
        Err(e) => {
            eprintln!("Error listando biológicos: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Vec::<Biologico>::new()),
            )
        }
    }
}
