// back/src/models.rs
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

#[derive(Debug, Serialize, Deserialize, Clone)]
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
pub struct CreatePacientePayload {
    pub cedula: String,
    pub nacionalidad: String,
    pub nombre: String,
    pub apellido: String,
    pub fecha_nacimiento: NaiveDate,
    pub sexo: String,
    pub orden_hijo: i32,
    pub direccion_comunidad: Option<String>,
    pub direccion_calle: Option<String>,
    pub direccion_casa: Option<String>,
    pub etnia: Option<Etnia>,
    pub grupos_especiales: Vec<GrupoEspecial>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Paciente {
    pub id: i32,
    pub cedula: String,
    pub nacionalidad: String,
    pub nombre: String,
    pub apellido: String,
    pub fecha_nacimiento: NaiveDate,
    pub sexo: String,
    pub orden_hijo: Option<i32>,
    pub direccion_comunidad: Option<String>,
    pub etnia: Option<String>,
    pub grupos_especiales: Option<serde_json::Value>,
}

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
