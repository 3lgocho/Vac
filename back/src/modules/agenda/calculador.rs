use chrono::{Duration, Local, NaiveDate};

use super::models::DosisProgramada;
use crate::modules::validador::models::{PerfilPaciente, VacunaDisponible};

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

fn meses(n: i64) -> Duration {
    Duration::days(n * 30)
}

fn semanas(n: i64) -> Duration {
    Duration::days(n * 7)
}

fn anios(n: i64) -> Duration {
    Duration::days(n * 365)
}

fn dosis_id_para_label(biologico_id: i32, label: &str) -> Option<i32> {
    match (biologico_id, label) {
        (1, "DU") => Some(1),
        (2, "1D") => Some(17),
        (2, "2D") => Some(18),
        (2, "3D") => Some(19),
        (3, "1D") => Some(3),
        (3, "2D") => Some(4),
        (4, "1D") => Some(5),
        (4, "2D") => Some(6),
        (4, "3D") => Some(7),
        (4, "1REF") => Some(20),
        (4, "2REF") => Some(21),
        (4, "DA") => Some(22),
        (5, "1D") => Some(23),
        (5, "2D") => Some(24),
        (5, "3D") => Some(25),
        (6, "DU") => Some(15),
        (7, "1D") => Some(13),
        (7, "2D") => Some(26),
        (7, "1REF") => Some(14),
        (7, "DA") => Some(27),
        (8, "1D") => Some(28),
        (8, "2D") => Some(29),
        (8, "3D") => Some(30),
        (8, "1REF") => Some(31),
        (8, "2REF") => Some(32),
        (8, "3REF") => Some(33),
        (8, "DA") => Some(34),
        (9, "1D") => Some(35),
        (9, "2D") => Some(36),
        (9, "3D") => Some(37),
        (9, "1REF") => Some(38),
        (9, "2REF") => Some(39),
        (9, "DA") => Some(40),
        (10, "1D") => Some(41),
        (10, "2D") => Some(42),
        (10, "3D") => Some(43),
        (10, "1REF") => Some(44),
        (10, "2REF") => Some(45),
        (10, "DA") => Some(46),
        (11, "1D") => Some(47),
        (11, "2D") => Some(48),
        (11, "1REF") => Some(49),
        (11, "DA") => Some(50),
        (12, "1D") => Some(51),
        (12, "1REF") => Some(52),
        (13, "1D") => Some(53),
        (13, "2D") => Some(54),
        (14, "1D") => Some(55),
        (14, "2D") => Some(56),
        (14, "3D") => Some(57),
        (15, "1D") => Some(58),
        (15, "2D") => Some(59),
        (15, "3D") => Some(60),
        (15, "4D") => Some(61),
        (15, "5D") => Some(62),
        (15, "6D") => Some(63),
        (15, "7D") => Some(64),
        _ => None,
    }
}

fn fecha_dosis_aplicada(paciente: &PerfilPaciente, bio_id: i32, label: &str) -> Option<NaiveDate> {
    let dosis_id = dosis_id_para_label(bio_id, label)?;
    paciente
        .vacunas_aplicadas
        .iter()
        .find(|v| v.biologico_id == bio_id && v.dosis_id == dosis_id)
        .and_then(|v| v.fecha_aplicacion)
}

fn fecha_nacimiento(paciente: &PerfilPaciente) -> NaiveDate {
    paciente.fecha_nacimiento
}

fn calcular_fecha(paciente: &PerfilPaciente, dosis: &VacunaDisponible) -> NaiveDate {
    let nac = fecha_nacimiento(paciente);
    let hoy_local = hoy();

    match (dosis.biologico_id, dosis.dosis_a_aplicar.as_str()) {
        // BCG
        (1, "DU") => nac,

        // Hepatitis B
        (2, "1D") => nac,
        (2, "2D") => fecha_dosis_aplicada(paciente, 2, "1D").map_or(hoy_local, |d| d + meses(1)),
        (2, "3D") => {
            fecha_dosis_aplicada(paciente, 2, "2D")
                .map_or(fecha_dosis_aplicada(paciente, 2, "1D").map_or(hoy_local, |d| d + meses(6)), |d| d + meses(5))
        }

        // Rotavirus
        (3, "1D") => nac + meses(2),
        (3, "2D") => fecha_dosis_aplicada(paciente, 3, "1D").map_or(nac + meses(4), |d| d + meses(2)),

        // Pentavalente
        (4, "1D") => nac + meses(2),
        (4, "2D") => fecha_dosis_aplicada(paciente, 4, "1D").map_or(nac + meses(4), |d| d + meses(2)),
        (4, "3D") => fecha_dosis_aplicada(paciente, 4, "2D").map_or(nac + meses(6), |d| d + meses(2)),
        (4, "1REF") => fecha_dosis_aplicada(paciente, 4, "3D").map_or(nac + meses(18), |d| d + meses(12)),
        (4, "2REF") => fecha_dosis_aplicada(paciente, 4, "1REF").map_or(nac + anios(5), |d| d + anios(3)),

        // Polio Inyectable
        (5, "1D") => nac + meses(2),
        (5, "2D") => fecha_dosis_aplicada(paciente, 5, "1D").map_or(nac + meses(4), |d| d + meses(2)),
        (5, "3D") => fecha_dosis_aplicada(paciente, 5, "2D").map_or(nac + meses(6), |d| d + meses(2)),

        // Fiebre Amarilla
        (6, "DU") => nac + meses(12),

        // SRP
        (7, "1D") => nac + meses(12),
        (7, "2D") => fecha_dosis_aplicada(paciente, 7, "1D").map_or(nac + meses(15), |d| d + meses(3)),
        (7, "1REF") => {
            fecha_dosis_aplicada(paciente, 7, "2D")
                .or_else(|| fecha_dosis_aplicada(paciente, 7, "1D"))
                .map_or(nac + anios(5), |d| d + anios(4))
        }

        // TTD
        (8, "1D") => hoy_local,
        (8, "2D") => fecha_dosis_aplicada(paciente, 8, "1D").map_or(hoy_local, |d| d + semanas(4)),
        (8, "3D") => fecha_dosis_aplicada(paciente, 8, "2D").map_or(hoy_local, |d| d + meses(6)),
        (8, "1REF") => {
            fecha_dosis_aplicada(paciente, 8, "3D")
                .or_else(|| fecha_dosis_aplicada(paciente, 8, "2D"))
                .map_or(hoy_local, |d| d + anios(10))
        }
        (8, "2REF") => fecha_dosis_aplicada(paciente, 8, "1REF").map_or(hoy_local, |d| d + anios(10)),
        (8, "3REF") => fecha_dosis_aplicada(paciente, 8, "2REF").map_or(hoy_local, |d| d + anios(10)),

        // Neumococo 13
        (9, "1D") => nac + meses(2),
        (9, "2D") => fecha_dosis_aplicada(paciente, 9, "1D").map_or(nac + meses(4), |d| d + meses(2)),
        (9, "3D") => fecha_dosis_aplicada(paciente, 9, "2D").map_or(nac + meses(6), |d| d + meses(2)),
        (9, "1REF") => fecha_dosis_aplicada(paciente, 9, "3D").map_or(nac + meses(12), |d| d + meses(6)),
        (9, "2REF") => fecha_dosis_aplicada(paciente, 9, "1REF").map_or(nac + anios(4), |d| d + anios(3)),

        // Polio Oral
        (10, "1D") => nac + meses(2),
        (10, "2D") => fecha_dosis_aplicada(paciente, 10, "1D").map_or(nac + meses(4), |d| d + meses(2)),
        (10, "3D") => fecha_dosis_aplicada(paciente, 10, "2D").map_or(nac + meses(6), |d| d + meses(2)),
        (10, "1REF") => fecha_dosis_aplicada(paciente, 10, "3D").map_or(nac + meses(18), |d| d + meses(12)),
        (10, "2REF") => fecha_dosis_aplicada(paciente, 10, "1REF").map_or(nac + anios(5), |d| d + anios(3)),

        // Influenza
        (11, "1D") => nac + meses(6),
        (11, "2D") => fecha_dosis_aplicada(paciente, 11, "1D").map_or(nac + meses(7), |d| d + meses(1)),
        (11, "1REF") => {
            fecha_dosis_aplicada(paciente, 11, "2D")
                .or_else(|| fecha_dosis_aplicada(paciente, 11, "1D"))
                .map_or(hoy_local, |d| d + anios(1))
        }

        // Neumococo 23
        (12, "1D") => nac + anios(65),
        (12, "1REF") => fecha_dosis_aplicada(paciente, 12, "1D").map_or(hoy_local, |d| d + anios(5)),

        // Meningococica
        (13, "1D") => nac + meses(2),
        (13, "2D") => fecha_dosis_aplicada(paciente, 13, "1D").map_or(nac + meses(4), |d| d + meses(2)),

        // Rabia Pre
        (14, "1D") => hoy_local,
        (14, "2D") => fecha_dosis_aplicada(paciente, 14, "1D").map_or(hoy_local, |d| d + Duration::days(7)),
        (14, "3D") => fecha_dosis_aplicada(paciente, 14, "2D").map_or(hoy_local, |d| d + Duration::days(21)),

        // Rabia Post
        (15, "1D") => hoy_local,
        (15, "2D") => fecha_dosis_aplicada(paciente, 15, "1D").map_or(hoy_local, |d| d + Duration::days(3)),
        (15, "3D") => fecha_dosis_aplicada(paciente, 15, "2D").map_or(hoy_local, |d| d + Duration::days(4)),
        (15, "4D") => fecha_dosis_aplicada(paciente, 15, "3D").map_or(hoy_local, |d| d + Duration::days(7)),
        (15, "5D") => fecha_dosis_aplicada(paciente, 15, "4D").map_or(hoy_local, |d| d + Duration::days(14)),
        (15, "6D") => fecha_dosis_aplicada(paciente, 15, "5D").map_or(hoy_local, |d| d + Duration::days(62)),
        (15, "7D") => fecha_dosis_aplicada(paciente, 15, "6D").map_or(hoy_local, |d| d + Duration::days(90)),

        // Default
        _ => hoy_local,
    }
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

fn tiene_dosis_biologico(paciente: &PerfilPaciente, bio_id: i32) -> bool {
    paciente.vacunas_aplicadas.iter().any(|v| v.biologico_id == bio_id)
}

pub fn calcular_agenda(
    paciente: &PerfilPaciente,
    faltantes: &[VacunaDisponible],
) -> Vec<DosisProgramada> {
    faltantes
        .iter()
        .map(|d| {
            let mut fecha = calcular_fecha(paciente, d);
            let mut estado = determinar_estado(fecha);

            // Si el paciente nunca ha recibido este biológico en el sistema,
            // la fecha calculada (edad mínima) no indica atraso real:
            // puede que ya se haya vacunado antes sin registro digital.
            if !tiene_dosis_biologico(paciente, d.biologico_id) && fecha < hoy() {
                fecha = hoy();
                estado = "Para Hoy".to_string();
            }

            DosisProgramada {
                biologico_id: d.biologico_id,
                nombre: d.nombre.clone(),
                dosis_id: d.dosis_id,
                dosis_a_aplicar: d.dosis_a_aplicar.clone(),
                fecha_sugerida: fecha,
                estado,
                advertencia: d.advertencia.clone(),
            }
        })
        .collect()
}
