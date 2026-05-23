use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum Etnia {
    Akawaio,
    Anu,
    Arawak,
    Ayaman,
    Baniva,
    Bare,
    Bari,
    Catmensa,
    Chaima,
    Chiriana,
    Cubeo,
    Cumanagoto,
    Enepa,
    Gayon,
    Guanono,
    Hoti,
    Inga,
    Japreira,
    Jiwi,
    Karina,
    Kuiba,
    Kurripaco,
    Mako,
    Mapoyo,
    Pemon,
    Piapoco,
    Piaroa,
    Puinave,
    Pume,
    Putumayo,
    Saliva,
    Sanema,
    Sape,
    TimotoCuicas,
    Tomusa,
    Uruak,
    Warao,
    Warekena,
    Wayuu,
    Yabarana,
    Yanomami,
    Yekuana,
    Yeral,
    Yukpa,
    BlancoOCriollo,
    Afrodescendiente,
    Mestizo,
    Otro,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum GrupoEspecial {
    ContingentesMilitares,
    Embarazadas,
    EnfermosCronicos,
    PersonalDeSalud,
    PacientesEnDialisis,
    PrivadosDeLibertad,
    TrabajadoresAvicolas,
    TrabajadoresSexuales,
    ViajerosInternacionales,
    Otro,
}

#[derive(Debug, Deserialize)]
pub struct CreateVacunaDetalle {
    pub biologico_id: i32,
    pub dosis_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateAlergiaDetalle {
    pub biologico_id: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreatePacientePayload {
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
    pub etnia: Option<Etnia>,
    pub grupos_especiales: Vec<GrupoEspecial>,
    pub vacunas: Vec<CreateVacunaDetalle>,
    pub alergias: Vec<CreateAlergiaDetalle>,
}
