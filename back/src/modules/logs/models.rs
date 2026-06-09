use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct AuditLog {
    pub id: i32,
    pub personal_id: i32,
    pub nombre_personal: Option<String>,
    pub accion: String,
    pub entidad_tipo: String,
    pub entidad_id: Option<i32>,
    pub detalles: String,
    pub old_data: Option<serde_json::Value>,
    pub new_data: Option<serde_json::Value>,
    pub creado_en: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct LogSearchParams {
    pub q: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Serialize)]
pub struct PaginatedLogs {
    pub data: Vec<AuditLog>,
    pub total: i64,
}
