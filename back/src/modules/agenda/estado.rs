use chrono::{Local, NaiveDate};

use super::calculador::calcular_agenda;
use crate::modules::validador::models::{PerfilPaciente, VacunaDisponible};

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProximaVacunaInfo {
    pub nombre: String,
    pub dosis: String,
    pub fecha_sugerida: NaiveDate,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct EstadoGeneralPaciente {
    pub estado: String,
    pub proxima_vacuna: Option<ProximaVacunaInfo>,
    pub vacunas_atrasadas: Vec<String>,
}

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

pub fn calcular_estado_paciente(
    paciente: &PerfilPaciente,
    faltantes: &[VacunaDisponible],
) -> EstadoGeneralPaciente {
    let agenda = calcular_agenda(paciente, faltantes);

    let bio_con_dosis: std::collections::HashSet<i32> = paciente
        .vacunas_aplicadas
        .iter()
        .map(|v| v.biologico_id)
        .collect();

    let mut por_bio: std::collections::HashMap<i32, Vec<&super::models::DosisProgramada>> =
        std::collections::HashMap::new();
    for d in &agenda {
        por_bio.entry(d.biologico_id).or_default().push(d);
    }

    let mut atrasadas: Vec<String> = vec![];
    let mut proximas_candidatas: Vec<&super::models::DosisProgramada> = vec![];

    for (bio_id, dosis_programadas) in &por_bio {

        let mut sorted = dosis_programadas.clone();
        sorted.sort_by_key(|d| d.dosis_id);
        let primera = sorted[0];

        if primera.estado == "Atrasada" {
            atrasadas.push(primera.nombre.clone());
        }

        proximas_candidatas.push(primera);
    }

    let hoy_local = hoy();
    proximas_candidatas.sort_by_key(|d| (
        d.orden_aplicacion == 1,
        (d.fecha_sugerida - hoy_local).abs(),
        d.biologico_id
    ));
    let proxima = proximas_candidatas.first().map(|d| ProximaVacunaInfo {
        nombre: d.nombre.clone(),
        dosis: d.dosis_a_aplicar.clone(),
        fecha_sugerida: d.fecha_sugerida,
    });

    let estado = if !atrasadas.is_empty() {
        "Atrasada".to_string()
    } else if proximas_candidatas.iter().any(|d| d.estado == "Para Hoy") {
        "Para Hoy".to_string()
    } else if paciente.vacunas_aplicadas.is_empty() && proximas_candidatas.is_empty() {
        "Sin vacunas".to_string()
    } else {
        "Al día".to_string()
    };

    EstadoGeneralPaciente {
        estado,
        proxima_vacuna: proxima,
        vacunas_atrasadas: atrasadas,
    }
}
