use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct QueryEstadisticas {
    pub anio: i32,
    pub mes_inicio: i32,
    pub mes_fin: i32,
}

#[derive(Serialize, Clone)]
pub struct EstadisticaItem {
    pub mes: i32,
    pub genero_f: i32,
    pub genero_m: i32,
    pub edad_0_11_meses: i32,
    pub edad_1_4_anos: i32,
    pub edad_5_19_anos: i32,
    pub edad_20_59_anos: i32,
    pub edad_60_79_anos: i32,
    pub edad_80_mas: i32,
}

#[derive(Serialize)]
pub struct EstadisticasResponse {
    pub datos: Vec<EstadisticaItem>,
}
