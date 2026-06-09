use axum::{
    extract::{Extension, Query, State},
    http::StatusCode,
    Json,
};
use serde_json::Value;

use super::models::{AuditLog, LogSearchParams, PaginatedLogs};
use crate::modules::auth::models::Claims;
use crate::AppState;

pub async fn log_action(
    pool: &sqlx::PgPool,
    personal_id: i32,
    accion: &str,
    entidad_tipo: &str,
    entidad_id: Option<i32>,
    detalles: &str,
    old_data: Option<Value>,
    new_data: Option<Value>,
) {
    let query = r#"
        INSERT INTO audit_logs (personal_id, accion, entidad_tipo, entidad_id, detalles, old_data, new_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    "#;

    let res = sqlx::query(query)
        .bind(personal_id)
        .bind(accion)
        .bind(entidad_tipo)
        .bind(entidad_id)
        .bind(detalles)
        .bind(old_data)
        .bind(new_data)
        .execute(pool)
        .await;

    if let Err(e) = res {
        eprintln!("Error registrando audit log: {:?}", e);
    }
}

pub async fn get_logs(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Query(params): Query<LogSearchParams>,
) -> Result<Json<PaginatedLogs>, (StatusCode, String)> {
    let search_term = format!("%{}%", params.q.unwrap_or_default());
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).min(100);
    let offset = (page - 1) * limit;

    let (where_clause, bind_offset) = if claims.rol == "coordinador" {
        ("WHERE (l.detalles ILIKE $1 OR p.nombre_completo ILIKE $1)".to_string(), 0)
    } else {
        ("WHERE (l.detalles ILIKE $1 OR p.nombre_completo ILIKE $1) AND l.personal_id = $2".to_string(), 1)
    };

    let total_query = format!(
        "SELECT COUNT(*) FROM audit_logs l JOIN personal_salud p ON l.personal_id = p.id {}",
        where_clause
    );

    let mut q_total = sqlx::query_scalar::<_, i64>(&total_query).bind(&search_term);
    if claims.rol != "coordinador" {
        q_total = q_total.bind(claims.sub);
    }
    
    let total = q_total.fetch_one(&state.db).await.unwrap_or(0);

    let data_query = format!(
        r#"SELECT l.id, l.personal_id, p.nombre_completo as nombre_personal, l.accion, 
                  l.entidad_tipo, l.entidad_id, l.detalles, l.old_data, l.new_data, l.creado_en
           FROM audit_logs l
           JOIN personal_salud p ON l.personal_id = p.id
           {}
           ORDER BY l.creado_en DESC LIMIT ${} OFFSET ${}"#,
        where_clause,
        2 + bind_offset,
        3 + bind_offset
    );

    let mut q_data = sqlx::query_as::<_, AuditLog>(&data_query).bind(&search_term);
    if claims.rol != "coordinador" {
        q_data = q_data.bind(claims.sub);
    }
    q_data = q_data.bind(limit).bind(offset);

    let logs = q_data.fetch_all(&state.db).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Error obteniendo logs: {}", e))
    })?;

    Ok(Json(PaginatedLogs { data: logs, total }))
}
