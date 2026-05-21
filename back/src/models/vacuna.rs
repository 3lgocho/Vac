use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Dosis {
    pub id: i32,
    pub nombre_dosis: String,
    pub orden_aplicacion: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Biologico {
    pub id: i32,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub dosis: sqlx::types::Json<Vec<Dosis>>,
}

// Estructura para la tarjeta del historial de la pantalla de perfil
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct VacunaAplicada {
    pub id: i32,
    pub biologico_nombre: String,
    pub dosis_nombre: String,
    pub fecha_aplicacion: NaiveDate,
    pub lote: Option<String>,
    pub vacunador: Option<String>,
}
