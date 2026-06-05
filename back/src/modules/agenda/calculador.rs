use chrono::{Duration, Local, NaiveDate};

use super::models::DosisProgramada;
use crate::modules::validador::models::{PerfilPaciente, VacunaDisponible};

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

fn meses(n: i64) -> Duration {
    Duration::days(n * 30)
}

fn calcular_fecha(paciente: &PerfilPaciente, dosis: &VacunaDisponible) -> NaiveDate {
    let nac = paciente.fecha_nacimiento;
    let hoy_local = hoy();

    if dosis.orden_aplicacion == 1 {
        let recomendada = nac + meses(dosis.edad_recomendada_meses as i64);
        if recomendada < hoy_local {
            return hoy_local;
        }
        return recomendada;
    }

    let prev_dosis = paciente
        .vacunas_aplicadas
        .iter()
        .find(|v| v.biologico_id == dosis.biologico_id && v.orden_aplicacion == dosis.orden_aplicacion - 1);

    if let Some(prev) = prev_dosis {
        if let Some(fecha_prev) = prev.fecha_aplicacion {
            return fecha_prev + meses(dosis.intervalo_recomendado_meses as i64);
        }
    }

    hoy_local
}

fn determinar_estado(fecha: NaiveDate) -> String {
    let hoy_local = hoy();
    if fecha < hoy_local {
        "Atrasada".to_string()
    } else if fecha == hoy_local {
        "Para Hoy".to_string()
    } else {
        "Futura".to_string()
    }
}

pub fn calcular_agenda(
    paciente: &PerfilPaciente,
    faltantes: &[VacunaDisponible],
) -> Vec<DosisProgramada> {
    faltantes
        .iter()
        .map(|d| {
            let fecha = calcular_fecha(paciente, d);
            let estado = determinar_estado(fecha);

            DosisProgramada {
                biologico_id: d.biologico_id,
                nombre: d.nombre.clone(),
                dosis_id: d.dosis_id,
                dosis_a_aplicar: d.dosis_a_aplicar.clone(),
                fecha_sugerida: fecha,
                estado,
                advertencia: d.advertencia.clone(),
                orden_aplicacion: d.orden_aplicacion,
            }
        })
        .collect()
}
