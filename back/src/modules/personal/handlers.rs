use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
    Extension,
};
use serde_json::json;

use crate::{AppState, modules::auth::models::Claims};
use super::models::{CreatePersonalRequest, PersonalSalud, UpdatePersonalRequest, UpdatePinRequest};
use crate::modules::logs::handlers::log_action;

fn check_coordinador(claims: &Claims) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    if claims.rol != "coordinador" {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({"error": "No tienes permisos de coordinador"})),
        ));
    }
    Ok(())
}

pub async fn get_personal(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    if let Err(err) = check_coordinador(&claims) {
        return err.into_response();
    }

    // Listar solo activos
    let personal = sqlx::query_as!(
        PersonalSalud,
        "SELECT id, cedula, nombre_completo, rol, activo, creado_en FROM personal_salud WHERE activo = true ORDER BY creado_en DESC"
    )
    .fetch_all(&state.db)
    .await;

    match personal {
        Ok(lista) => (StatusCode::OK, Json(json!(lista))).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al obtener personal: {}", e)})),
        ).into_response(),
    }
}

pub async fn create_personal(
    Extension(claims): Extension<Claims>,
    State(state): State<AppState>,
    Json(payload): Json<CreatePersonalRequest>,
) -> impl IntoResponse {
    if let Err(err) = check_coordinador(&claims) {
        return err.into_response();
    }

    let hash = match bcrypt::hash(&payload.pin, 12) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"error": "Error al encriptar PIN"})),
            ).into_response();
        }
    };

    let result = sqlx::query!(
        "INSERT INTO personal_salud (cedula, nombre_completo, rol, pin_hash) VALUES ($1, $2, $3, $4) RETURNING id",
        payload.cedula,
        payload.nombre_completo,
        payload.rol,
        hash
    )
    .fetch_one(&state.db)
    .await;

    match result {
        Ok(row) => {
            let detalles = format!(
                "{} registró a un nuevo {} con cédula {}",
                claims.nombre, payload.rol, payload.cedula
            );
            log_action(
                &state.db,
                claims.sub,
                "REGISTRO",
                "PERSONAL",
                Some(row.id),
                &detalles,
                None,
                Some(serde_json::to_value(&payload).unwrap_or(serde_json::Value::Null)),
            ).await;

            (
                StatusCode::CREATED,
                Json(json!({"msg": "Usuario creado", "id": row.id})),
            ).into_response()
        },
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al crear usuario: {}", e)})),
        ).into_response(),
    }
}

pub async fn update_personal(
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    State(state): State<AppState>,
    Json(payload): Json<UpdatePersonalRequest>,
) -> impl IntoResponse {
    if let Err(err) = check_coordinador(&claims) {
        return err.into_response();
    }

    let result = sqlx::query!(
        "UPDATE personal_salud SET cedula = $1, nombre_completo = $2, rol = $3 WHERE id = $4",
        payload.cedula,
        payload.nombre_completo,
        payload.rol,
        id
    )
    .execute(&state.db)
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            let detalles = format!(
                "{} actualizó la información del personal con ID {} (Nuevos datos: {} - {})",
                claims.nombre, id, payload.nombre_completo, payload.rol
            );
            log_action(
                &state.db,
                claims.sub,
                "EDICION",
                "PERSONAL",
                Some(id),
                &detalles,
                None,
                Some(serde_json::to_value(&payload).unwrap_or(serde_json::Value::Null)),
            ).await;

            (
                StatusCode::OK,
                Json(json!({"msg": "Usuario actualizado"})),
            ).into_response()
        },
        Ok(_) => (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Usuario no encontrado"})),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al actualizar usuario: {}", e)})),
        ).into_response(),
    }
}

pub async fn update_pin(
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    State(state): State<AppState>,
    Json(payload): Json<UpdatePinRequest>,
) -> impl IntoResponse {
    if let Err(err) = check_coordinador(&claims) {
        return err.into_response();
    }

    let hash = match bcrypt::hash(&payload.pin, 12) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"error": "Error al encriptar PIN"})),
            ).into_response();
        }
    };

    let result = sqlx::query!(
        "UPDATE personal_salud SET pin_hash = $1 WHERE id = $2",
        hash,
        id
    )
    .execute(&state.db)
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => (
            StatusCode::OK,
            Json(json!({"msg": "PIN actualizado"})),
        ).into_response(),
        Ok(_) => (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Usuario no encontrado"})),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al actualizar PIN: {}", e)})),
        ).into_response(),
    }
}

pub async fn soft_delete_personal(
    Extension(claims): Extension<Claims>,
    Path(id): Path<i32>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    if let Err(err) = check_coordinador(&claims) {
        return err.into_response();
    }

    let result = sqlx::query!(
        "UPDATE personal_salud SET activo = false WHERE id = $1",
        id
    )
    .execute(&state.db)
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => {
            let detalles = format!(
                "{} inhabilitó al personal con ID {}",
                claims.nombre, id
            );
            log_action(
                &state.db,
                claims.sub,
                "ELIMINACION",
                "PERSONAL",
                Some(id),
                &detalles,
                None,
                None,
            ).await;

            (
                StatusCode::OK,
                Json(json!({"msg": "Usuario eliminado (soft delete)"})),
            ).into_response()
        },
        Ok(_) => (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Usuario no encontrado"})),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Error al eliminar usuario: {}", e)})),
        ).into_response(),
    }
}
