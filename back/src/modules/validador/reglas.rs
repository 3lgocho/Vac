use chrono::{Local, NaiveDate};

use super::models::{PerfilPaciente, VacunaDisponible};

pub trait ReglaVacunacion {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible>;
}

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

fn edad_dias(fecha_nacimiento: NaiveDate) -> i64 {
    (hoy() - fecha_nacimiento).num_days()
}

fn edad_meses(fecha_nacimiento: NaiveDate) -> i64 {
    edad_dias(fecha_nacimiento) / 30
}

fn edad_anios(fecha_nacimiento: NaiveDate) -> i64 {
    edad_meses(fecha_nacimiento) / 12
}

fn tiene_biologico(paciente: &PerfilPaciente, id: i32) -> bool {
    paciente
        .vacunas_aplicadas
        .iter()
        .any(|v| v.biologico_id == id)
}

fn tiene_dosis(paciente: &PerfilPaciente, biologico_id: i32, dosis_id: i32) -> bool {
    paciente
        .vacunas_aplicadas
        .iter()
        .any(|v| v.biologico_id == biologico_id && v.dosis_id == dosis_id)
}

fn push_si_no_aplicada(
    disponibles: &mut Vec<VacunaDisponible>,
    paciente: &PerfilPaciente,
    bio_id: i32,
    dosis_id: i32,
    nombre: &str,
    dosis_label: &str,
    advertencia: Option<&str>,
) {
    if !tiene_dosis(paciente, bio_id, dosis_id) {
        disponibles.push(VacunaDisponible {
            biologico_id: bio_id,
            nombre: nombre.to_string(),
            dosis_id,
            dosis_a_aplicar: dosis_label.to_string(),
            advertencia: advertencia.map(|s| s.to_string()),
        });
    }
}

// ============================================================
// 1. BCG (id=1) — Dosis Única, 0-7 años
// ============================================================
pub struct ReglaBcg;

impl ReglaVacunacion for ReglaBcg {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        if tiene_biologico(paciente, 1) {
            return vec![];
        }
        if edad_anios(paciente.fecha_nacimiento) <= 7 {
            vec![VacunaDisponible {
                biologico_id: 1,
                nombre: "BCG".to_string(),
                dosis_id: 1,
                dosis_a_aplicar: "DU".to_string(),
                advertencia: None,
            }]
        } else {
            vec![]
        }
    }
}

// ============================================================
// 2. Hepatitis B (id=2) — 1D al nacer, 2D al mes, 3D a los 6m
// ============================================================
pub struct ReglaHepatitisB;

impl ReglaVacunacion for ReglaHepatitisB {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if !tiene_dosis(paciente, 2, 17) && meses >= 0 {
            push_si_no_aplicada(&mut disponibles, paciente, 2, 17, "Hepatitis B", "1D", None);
        }
        if meses >= 1 {
            push_si_no_aplicada(&mut disponibles, paciente, 2, 18, "Hepatitis B", "2D", None);
        }
        if meses >= 6 {
            push_si_no_aplicada(&mut disponibles, paciente, 2, 19, "Hepatitis B", "3D", None);
        }

        disponibles
    }
}

// ============================================================
// 3. Rotavirus (id=3) — 1D ≥2m, 2D ≥4m, máximo 8m
// ============================================================
pub struct ReglaRotavirus;

impl ReglaVacunacion for ReglaRotavirus {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses > 8 {
            return disponibles;
        }

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 3, 3, "Rotavirus", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 3, 4, "Rotavirus", "2D", None);
        }

        disponibles
    }
}

// ============================================================
// 4. Neumococo 13 Valente (id=9) — 1D ≥2m, 2D ≥4m, 3D ≥6m, 1REF ≥12m, 2REF ≥4a
// ============================================================
pub struct ReglaNeumococo13;

impl ReglaVacunacion for ReglaNeumococo13 {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 9, 35, "Neumococo 13 Valente", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 9, 36, "Neumococo 13 Valente", "2D", None);
        }
        if meses >= 6 {
            push_si_no_aplicada(&mut disponibles, paciente, 9, 37, "Neumococo 13 Valente", "3D", None);
        }
        if meses >= 12 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                9,
                38,
                "Neumococo 13 Valente",
                "1REF",
                Some("Refuerzo a los 12 meses"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                9,
                39,
                "Neumococo 13 Valente",
                "2REF",
                Some("Segundo refuerzo a partir de los 4 años"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                9,
                40,
                "Neumococo 13 Valente",
                "DA",
                Some("Dosis Adicional para grupos de riesgo"),
            );
        }

        disponibles
    }
}

// ============================================================
// 5. Pentavalente (id=4) — 1D ≥2m, 2D ≥4m, 3D ≥6m, 1REF ≥15m, 2REF ≥4a
// ============================================================
pub struct ReglaPentavalente;

impl ReglaVacunacion for ReglaPentavalente {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 4, 5, "Pentavalente", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 4, 6, "Pentavalente", "2D", None);
        }
        if meses >= 6 {
            push_si_no_aplicada(&mut disponibles, paciente, 4, 7, "Pentavalente", "3D", None);
        }
        if meses >= 15 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                4,
                20,
                "Pentavalente",
                "1REF",
                Some("Refuerzo a los 15-18 meses"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                4,
                21,
                "Pentavalente",
                "2REF",
                Some("Refuerzo al ingreso escolar (4-6 años)"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                4,
                22,
                "Pentavalente",
                "DA",
                Some("Dosis Adicional para grupos de riesgo"),
            );
        }

        disponibles
    }
}

// ============================================================
// 6. Polio Inyectable (id=5) — 1D ≥2m, 2D ≥4m, 3D ≥6m
// ============================================================
pub struct ReglaPolioInyectable;

impl ReglaVacunacion for ReglaPolioInyectable {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 5, 23, "Polio Inyectable", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 5, 24, "Polio Inyectable", "2D", None);
        }
        if meses >= 6 {
            push_si_no_aplicada(&mut disponibles, paciente, 5, 25, "Polio Inyectable", "3D", None);
        }

        disponibles
    }
}

// ============================================================
// 7. Polio Oral (id=10) — Refuerzos: 1REF ≥18m, 2REF ≥5a
// ============================================================
pub struct ReglaPolioOral;

impl ReglaVacunacion for ReglaPolioOral {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 10, 41, "Polio Oral", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 10, 42, "Polio Oral", "2D", None);
        }
        if meses >= 6 {
            push_si_no_aplicada(&mut disponibles, paciente, 10, 43, "Polio Oral", "3D", None);
        }
        if meses >= 18 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                10,
                44,
                "Polio Oral",
                "1REF",
                Some("Primer refuerzo a los 18 meses"),
            );
        }
        if anios >= 5 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                10,
                45,
                "Polio Oral",
                "2REF",
                Some("Segundo refuerzo a los 5 años"),
            );
        }
        if anios >= 5 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                10,
                46,
                "Polio Oral",
                "DA",
                Some("Dosis Adicional para grupos de riesgo"),
            );
        }

        disponibles
    }
}

// ============================================================
// 8. Influenza Estacional (id=11) — 1D ≥6m, 2D ≥7m, 1REF anual
// ============================================================
pub struct ReglaInfluenza;

impl ReglaVacunacion for ReglaInfluenza {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 6 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                11,
                47,
                "Influenza Estacional",
                "1D",
                Some("Iniciar a partir de los 6 meses"),
            );
        }
        if meses >= 7 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                11,
                48,
                "Influenza Estacional",
                "2D",
                Some("Segunda dosis para menores de 9 años que inician esquema"),
            );
        }
        if anios >= 1 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                11,
                49,
                "Influenza Estacional",
                "1REF",
                Some("Refuerzo anual"),
            );
        }
        if anios >= 1 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                11,
                50,
                "Influenza Estacional",
                "DA",
                Some("Dosis Adicional para grupos de riesgo"),
            );
        }

        disponibles
    }
}

// ============================================================
// 9. Fiebre Amarilla (id=6) — Dosis Única ≥12m
// ============================================================
pub struct ReglaFiebreAmarilla;

impl ReglaVacunacion for ReglaFiebreAmarilla {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        if tiene_biologico(paciente, 6) {
            return vec![];
        }
        if edad_meses(paciente.fecha_nacimiento) >= 12 {
            vec![VacunaDisponible {
                biologico_id: 6,
                nombre: "Fiebre Amarilla".to_string(),
                dosis_id: 15,
                dosis_a_aplicar: "DU".to_string(),
                advertencia: Some("Aplicar a partir de los 12 meses".to_string()),
            }]
        } else {
            vec![]
        }
    }
}

// ============================================================
// 10. SRP (id=7) — 1D ≥12m, 2D ≥15m, 1REF ≥4a
// ============================================================
pub struct ReglaSRP;

impl ReglaVacunacion for ReglaSRP {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 12 {
            push_si_no_aplicada(&mut disponibles, paciente, 7, 13, "SRP", "1D", None);
        }
        if meses >= 15 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                7,
                26,
                "SRP",
                "2D",
                Some("Segunda dosis a los 15-23 meses"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                7,
                14,
                "SRP",
                "1REF",
                Some("Refuerzo al ingreso escolar (4-6 años)"),
            );
        }
        if anios >= 4 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                7,
                27,
                "SRP",
                "DA",
                Some("Dosis Adicional para grupos de riesgo"),
            );
        }

        disponibles
    }
}

// ============================================================
// 11. TTD (id=8) — Esquema secuencial por protocolo
// ============================================================
pub struct ReglaToxoideTetanoDifterico;

impl ReglaVacunacion for ReglaToxoideTetanoDifterico {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        // Esquema primario: 1D, 2D, 3D (para cualquier edad)
        if anios >= 0 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                8,
                28,
                "Toxoide Tetánico Diftérico (TTD)",
                "1D",
                Some("Primera dosis del esquema primario"),
            );
        }
        if anios >= 0 && tiene_dosis(paciente, 8, 28) {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                8,
                29,
                "Toxoide Tetánico Diftérico (TTD)",
                "2D",
                Some("Segunda dosis a las 4 semanas de la 1D"),
            );
        }
        if anios >= 0 && tiene_dosis(paciente, 8, 29) {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                8,
                30,
                "Toxoide Tetánico Diftérico (TTD)",
                "3D",
                Some("Tercera dosis a los 6 meses de la 2D"),
            );
        }

        // Refuerzos cada 10 años
        if tiene_dosis(paciente, 8, 30) || tiene_dosis(paciente, 8, 29) {
            if anios >= 10 && !tiene_dosis(paciente, 8, 31) {
                push_si_no_aplicada(
                    &mut disponibles,
                    paciente,
                    8,
                    31,
                    "Toxoide Tetánico Diftérico (TTD)",
                    "1REF",
                    Some("Primer refuerzo (cada 10 años)"),
                );
            }
            if tiene_dosis(paciente, 8, 31) && !tiene_dosis(paciente, 8, 32) && anios >= 10 {
                push_si_no_aplicada(
                    &mut disponibles,
                    paciente,
                    8,
                    32,
                    "Toxoide Tetánico Diftérico (TTD)",
                    "2REF",
                    Some("Segundo refuerzo (cada 10 años)"),
                );
            }
            if tiene_dosis(paciente, 8, 32) && !tiene_dosis(paciente, 8, 33) && anios >= 10 {
                push_si_no_aplicada(
                    &mut disponibles,
                    paciente,
                    8,
                    33,
                    "Toxoide Tetánico Diftérico (TTD)",
                    "3REF",
                    Some("Tercer refuerzo (cada 10 años)"),
                );
            }
        }

        // Dosis Adicional (emergencia / embarazadas)
        if anios >= 0 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                8,
                34,
                "Toxoide Tetánico Diftérico (TTD)",
                "DA",
                Some("Dosis Adicional para embarazadas o emergencia"),
            );
        }

        disponibles
    }
}

// ============================================================
// 12. Neumococo 23 Valente (id=12) — 1D ≥65a, 1REF ≥5a después
// ============================================================
pub struct ReglaNeumococo23;

impl ReglaVacunacion for ReglaNeumococo23 {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let anios = edad_anios(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if anios >= 65 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                12,
                51,
                "Neumococo 23 Valente",
                "1D",
                Some("Para adultos de 65 años o más"),
            );
        }

        if tiene_dosis(paciente, 12, 51) && anios >= 65 {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                12,
                52,
                "Neumococo 23 Valente",
                "1REF",
                Some("Refuerzo a los 5 años de la 1D"),
            );
        }

        disponibles
    }
}

// ============================================================
// 13. Meningocócica B-C (id=13) — 1D ≥2m, 2D ≥4m
// ============================================================
pub struct ReglaMeningococica;

impl ReglaVacunacion for ReglaMeningococica {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let meses = edad_meses(paciente.fecha_nacimiento);
        let mut disponibles = vec![];

        if meses >= 2 {
            push_si_no_aplicada(&mut disponibles, paciente, 13, 53, "Meningocócica B-C", "1D", None);
        }
        if meses >= 4 {
            push_si_no_aplicada(&mut disponibles, paciente, 13, 54, "Meningocócica B-C", "2D", None);
        }

        disponibles
    }
}

// ============================================================
// 14. Rabia Humana Pre-exposición (id=14) — 1D, 2D, 3D (días 0, 7, 28)
// ============================================================
pub struct ReglaRabiaPre;

impl ReglaVacunacion for ReglaRabiaPre {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let mut disponibles = vec![];

        if !tiene_biologico(paciente, 14) {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                14,
                55,
                "Rabia Humana (Pre-exposición)",
                "1D",
                Some("Esquema días 0, 7 y 28"),
            );
        } else {
            if !tiene_dosis(paciente, 14, 56) {
                push_si_no_aplicada(
                    &mut disponibles,
                    paciente,
                    14,
                    56,
                    "Rabia Humana (Pre-exposición)",
                    "2D",
                    Some("Segunda dosis a los 7 días de la 1D"),
                );
            }
            if !tiene_dosis(paciente, 14, 57) {
                push_si_no_aplicada(
                    &mut disponibles,
                    paciente,
                    14,
                    57,
                    "Rabia Humana (Pre-exposición)",
                    "3D",
                    Some("Tercera dosis a los 28 días de la 1D"),
                );
            }
        }

        disponibles
    }
}

// ============================================================
// 15. Rabia Humana Post-exposición (id=15) — 1D a 7D
// ============================================================
pub struct ReglaRabiaPost;

impl ReglaVacunacion for ReglaRabiaPost {
    fn evaluar(&self, paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
        let mut disponibles = vec![];

        for (dosis_id, label) in &[(58, "1D"), (59, "2D"), (60, "3D"), (61, "4D"), (62, "5D"), (63, "6D"), (64, "7D")] {
            push_si_no_aplicada(
                &mut disponibles,
                paciente,
                15,
                *dosis_id,
                "Rabia Humana (Post-exposición)",
                label,
                Some("Esquema post-exposición: seguir protocolo"),
            );
        }

        disponibles
    }
}

// ============================================================
// Evaluador principal
// ============================================================
pub fn obtener_esquema_disponible(paciente: &PerfilPaciente) -> Vec<VacunaDisponible> {
    let reglas: Vec<Box<dyn ReglaVacunacion>> = vec![
        Box::new(ReglaBcg),
        Box::new(ReglaHepatitisB),
        Box::new(ReglaRotavirus),
        Box::new(ReglaNeumococo13),
        Box::new(ReglaPentavalente),
        Box::new(ReglaPolioInyectable),
        Box::new(ReglaPolioOral),
        Box::new(ReglaInfluenza),
        Box::new(ReglaFiebreAmarilla),
        Box::new(ReglaSRP),
        Box::new(ReglaToxoideTetanoDifterico),
        Box::new(ReglaNeumococo23),
        Box::new(ReglaMeningococica),
        Box::new(ReglaRabiaPre),
        Box::new(ReglaRabiaPost),
    ];

    reglas
        .iter()
        .flat_map(|regla| regla.evaluar(paciente))
        .collect()
}
