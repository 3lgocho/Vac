use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct PersonalSalud {
    pub id: i32,
    pub cedula: String,
    pub nombre_completo: String,
    pub rol: Option<String>,
    pub activo: Option<bool>,
    pub creado_en: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreatePersonalRequest {
    pub cedula: String,
    pub nombre_completo: String,
    pub rol: String,
    pub pin: String,
}

#[derive(Deserialize)]
pub struct UpdatePersonalRequest {
    pub cedula: String,
    pub nombre_completo: String,
    pub rol: String,
}

#[derive(Deserialize)]
pub struct UpdatePinRequest {
    pub pin: String,
}
