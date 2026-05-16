// back/src/main.rs
mod models;

use axum::{
    extract::{State, Json},
    routing::{get, post}, // 1. Agregamos 'get' aquí
    Router,
    http::StatusCode,
    response::IntoResponse,
};
use dotenvy::dotenv;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;
use tower_http::cors::CorsLayer;

// 2. Traemos también el struct Paciente
use crate::models::{CreatePacientePayload, Paciente}; 

// Estado de la aplicación para compartir la conexión de DB a los handlers
#[derive(Clone)]
struct AppState {
    db: PgPool,
}

#[tokio::main]
async fn main() {
    // 1. Cargar variables de entorno del archivo .env
    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL no encontrada en .env");
    
    // Configuramos CORS
    let cors = CorsLayer::permissive();
    
    // 2. Conectar a PostgreSQL
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Error conectando a la base de datos");

    println!("✅ Conectado a PostgreSQL exitosamente");

    let state = AppState { db: pool };

    // 3. Crear el Router de Axum
    let app = Router::new()
        .route("/pacientes", post(crear_paciente))
        .route("/pacientes", get(listar_pacientes)) // <-- NUEVA RUTA GET
        .layer(cors) // <-- APLICAMOS EL CORS AQUÍ
        .with_state(state);

    // 4. Iniciar el servidor
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Servidor corriendo en http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

// ==========================================
//                 HANDLERS
// ==========================================

// --- HANDLER POST: Crear Paciente ---
async fn crear_paciente(
    State(state): State<AppState>,
    Json(payload): Json<CreatePacientePayload>,
) -> impl IntoResponse {
    
    let etnia_str = payload.etnia.map(|e| serde_json::to_string(&e).unwrap().replace("\"", ""));
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
            StatusCode::CREATED
                .into_response(),
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
// Esta función devuelve el JSON que tu React Native espera
async fn listar_pacientes(
    State(state): State<AppState>,
) -> impl IntoResponse {
    let query = r#"
        SELECT * FROM pacientes ORDER BY created_at DESC
    "#;

    let result = sqlx::query_as::<_, Paciente>(query)
        .fetch_all(&state.db)
        .await;

    match result {
        Ok(pacientes) => {
            // Convertimos el vector de structs a JSON automáticamente
            (StatusCode::OK, Json(pacientes))
        }
        Err(e) => {
            eprintln!("Error listando pacientes: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(Vec::<Paciente>::new()), // Devolvemos array vacío en caso de error
            )
        }
    }
}