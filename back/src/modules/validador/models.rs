use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

use crate::modules::registro::models::GrupoEspecial;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VacunaAplicadaInput {
    pub biologico_id: i32,
    pub dosis_id: i32,
    #[serde(default)]
    pub fecha_aplicacion: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerfilPaciente {
    pub fecha_nacimiento: NaiveDate,
    pub grupos_especiales: Vec<GrupoEspecial>,
    pub vacunas_aplicadas: Vec<VacunaAplicadaInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VacunaDisponible {
    pub biologico_id: i32,
    pub nombre: String,
    pub dosis_a_aplicar: String,
    pub advertencia: Option<String>,
}
