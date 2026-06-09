use axum::{
    Json,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation};
use serde_json::json;

use super::models::*;
use crate::AppState;

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, Json<serde_json::Value>)> {
    let user = sqlx::query_as::<_, (i32, String, String, String)>(
        "SELECT id, nombre_completo, pin_hash, rol FROM personal_salud WHERE cedula = $1 AND activo = true"
    )
    .bind(&payload.cedula)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error interno: {e}")})),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "Cédula no registrada"})),
        )
    })?;

    let (id, nombre, pin_hash, rol) = user;

    let valid = bcrypt::verify(&payload.pin, &pin_hash).unwrap_or(false);
    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "PIN incorrecto"})),
        ));
    }

    let exp = (Utc::now() + Duration::days(30)).timestamp() as usize;
    let claims = Claims {
        sub: id,
        cedula: payload.cedula,
        nombre: nombre.clone(),
        rol: rol.clone(),
        exp,
    };

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "vac_secret_key_default".to_string());
    let token = jsonwebtoken::encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al generar token: {e}")})),
        )
    })?;

    Ok(Json(AuthResponse { token, nombre, rol }))
}

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let token = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or_else(|| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Token no proporcionado"})),
            )
        })?;

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "vac_secret_key_default".to_string());
    let claims = jsonwebtoken::decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "Token inválido o expirado"})),
        )
    })?
    .claims;

    req.extensions_mut().insert(claims);
    Ok(next.run(req).await)
}

pub async fn seed_default_user(State(state): State<AppState>) -> impl IntoResponse {
    let exists = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM personal_salud",
    )
    .fetch_one(&state.db)
    .await
    .unwrap_or(0);

    if exists > 0 {
        return (StatusCode::OK, Json(json!({"msg": "Ya hay usuarios registrados"})));
    }

    let hash = bcrypt::hash("1234", 12).unwrap();
    sqlx::query(
        "INSERT INTO personal_salud (cedula, pin_hash, nombre_completo, rol) VALUES ($1, $2, $3, $4)"
    )
    .bind("admin")
    .bind(&hash)
    .bind("Administrador")
    .bind("coordinador")
    .execute(&state.db)
    .await
    .unwrap();

    (StatusCode::CREATED, Json(json!({"msg": "Usuario admin creado. Cédula: admin, PIN: 1234"})))
}
