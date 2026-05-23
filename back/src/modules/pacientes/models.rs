use crate::modules::vacunas::models::VacunaAplicada;
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
// Reflejo exacto de la tabla de PostgreSQL para consultas generales (Cards y Listas)
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Paciente {
    pub id: i32,
    pub cedula: String,
    pub nacionalidad: String,
    pub nombre: String,
    pub apellido: String,
    pub telefono: Option<String>,
    pub correo: Option<String>,
    pub fecha_nacimiento: NaiveDate,
    pub sexo: String,
    pub orden_hijo: Option<i32>,
    pub direccion_comunidad: Option<String>,
    pub direccion_calle: Option<String>,
    pub direccion_casa: Option<String>,
    pub etnia: Option<String>,
    pub grupos_especiales: Option<serde_json::Value>,
}

// Estructura que agrupa al paciente con sus vacunas (Reutiliza la estructura Paciente)
#[derive(Debug, Serialize)]
pub struct PacientePerfilPayload {
    pub paciente: Paciente,
    pub historial: Vec<VacunaAplicada>,
    pub alergias: Vec<Alergia>, // <-- Nueva propiedad agregada
}

// Payload para el PUT (Edición de contacto + alergias transaccional)
#[derive(Debug, Deserialize)]
pub struct UpdatePacientePayload {
    pub cedula: String,
    pub nombre: String,
    pub apellido: String,
    pub fecha_nacimiento: chrono::NaiveDate,
    pub sexo: String,
    pub telefono: Option<String>,
    pub correo: Option<String>,
    pub direccion_comunidad: Option<String>,
    pub direccion_calle: Option<String>,
    pub direccion_casa: Option<String>,
    pub etnia: Option<String>,
    pub grupos_especiales: Option<serde_json::Value>,
    pub alergias: Option<Vec<i32>>,
}

// Parámetros limpios separados
#[derive(Deserialize, Debug)]
pub struct AgendaParams {
    pub fecha: String,
}

#[derive(Deserialize, Debug)]
pub struct SearchParams {
    pub q: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Alergia {
    pub id: i32,
    pub biologico_nombre: String,
    pub fecha_registro: NaiveDate,
}
#[derive(Serialize)]
pub struct PaginatedPacientes {
    pub data: Vec<Paciente>,
    pub total: i64,
}
