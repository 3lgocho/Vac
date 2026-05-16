// back/src/models.rs
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

// Usamos serde(rename_all) para que coincida con lo que manda el Frontend (ej. "wayuu")
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum Etnia {
    // --- PUEBLOS INDÍGENAS (01 - 44) ---
    Akawaio,
    Anu,    // Añu (Paraujano)
    Arawak, // Arawak (Lokono)
    Ayaman, // Ayamán
    Baniva,
    Bare, // Baré
    Bari, // Barí
    Catmensa,
    Chaima,
    Chiriana,
    Cubeo,
    Cumanagoto,
    Enepa, // Eñepa (Panare)
    Gayon, // Gayón
    Guanono,
    Hoti,
    Inga,
    Japreira,
    Jiwi,   // Jiwi (Guajibo, Amorua Sikwani)
    Karina, // Kari´ña
    Kuiba,
    Kurripaco,
    Mako,
    Mapoyo,  // Mapoyo (Wanai)
    Pemon,   // Pemón (Taurepan, Arekuna Kamarakoto)
    Piapoco, // Piapoco (Chase)
    Piaroa,  // Piaroa (Wotjuja)
    Puinave,
    Pume, // Pumé (Yaruro)
    Putumayo,
    Saliva,       // Sáliva
    Sanema,       // Sánema (Sanûma)
    Sape,         // Sapé
    TimotoCuicas, // Se guarda como "timoto_cuicas"
    Tomusa,
    Uruak, // Uruak (Arutani)
    Warao,
    Warekena,
    Wayuu, // Wayúu (Guajiro)
    Yabarana,
    Yanomami, // Yanomami (Shiriana, Guaica o Waika)
    Yekuana,  // Yek´uana (Makiritare)
    Yeral,    // Yeral (Flengatu)
    Yukpa,

    // --- OTRAS CATEGORÍAS ---
    BlancoOCriollo, // Se guarda como "blanco_o_criollo"
    Afrodescendiente,
    Mestizo,
    Otro,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum GrupoEspecial {
    ContingentesMilitares,   // Se guarda en DB como: "contingentes_militares"
    Embarazadas,             // Se guarda en DB como: "embarazadas"
    EnfermosCronicos,        // Se guarda en DB como: "enfermos_cronicos"
    PersonalDeSalud,         // Se guarda en DB como: "personal_de_salud"
    PacientesEnDialisis,     // Se guarda en DB como: "pacientes_en_dialisis"
    PrivadosDeLibertad,      // Se guarda en DB como: "privados_de_libertad"
    TrabajadoresAvicolas,    // Se guarda en DB como: "trabajadores_avicolas"
    TrabajadoresSexuales,    // Se guarda en DB como: "trabajadores_sexuales"
    ViajerosInternacionales, // Se guarda en DB como: "viajeros_internacionales"
    Otro,                    // Se guarda en DB como: "otro"
}

// Este es el modelo de lo que esperamos recibir del Frontend (React Native)
// Agrega sqlx::FromRow para que SQLx mapee las columnas automáticamente
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Paciente {
    pub id: i32,
    pub cedula: String,
    pub nacionalidad: String,
    pub nombre: String,
    pub apellido: String,
    pub fecha_nacimiento: chrono::NaiveDate,
    pub sexo: String,
    pub orden_hijo: Option<i32>,
    pub direccion_comunidad: Option<String>,
    pub etnia: Option<String>,
    pub grupos_especiales: Option<serde_json::Value>,
}
