use chrono::NaiveDate;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct DosisProgramada {
    pub biologico_id: i32,
    pub nombre: String,
    pub dosis_a_aplicar: String,
    pub fecha_sugerida: NaiveDate,
    pub estado: String,
    pub advertencia: Option<String>,
}
