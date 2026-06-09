use chrono::{Local, NaiveDate};
use sqlx::PgPool;

use super::models::{PerfilPaciente, VacunaDisponible};

fn hoy() -> NaiveDate {
    Local::now().naive_local().date()
}

fn edad_meses(fecha_nacimiento: NaiveDate) -> i64 {
    (hoy() - fecha_nacimiento).num_days() / 30
}

#[derive(sqlx::FromRow)]
struct ReglaDb {
    biologico_id: i32,
    nombre: String,
    dosis_id: i32,
    nombre_dosis: String,
    orden_aplicacion: i32,
    edad_recomendada_meses: i32,
    intervalo_recomendado_meses: i32,
    intervalo_minimo_meses: i32,
    edad_minima_meses: i32,
    edad_maxima_meses: Option<i32>,
}

pub async fn obtener_esquema_disponible(
    pool: &PgPool,
    paciente: &PerfilPaciente,
) -> Result<Vec<VacunaDisponible>, sqlx::Error> {
    let meses = edad_meses(paciente.fecha_nacimiento) as i32;

    let reglas = sqlx::query_as::<_, ReglaDb>(
        r#"SELECT e.biologico_id, b.nombre, e.id as dosis_id, e.nombre_dosis, 
                  e.orden_aplicacion, e.edad_recomendada_meses, 
                  e.intervalo_recomendado_meses, e.intervalo_minimo_meses,
                  e.edad_minima_meses, e.edad_maxima_meses
           FROM esquema_dosis e
           JOIN catalogo_biologicos b ON e.biologico_id = b.id
           ORDER BY e.biologico_id, e.orden_aplicacion"#
    )
    .fetch_all(pool)
    .await?;

    let mut max_orden_por_bio = std::collections::HashMap::new();
    for v in &paciente.vacunas_aplicadas {
        let current_max = max_orden_por_bio.entry(v.biologico_id).or_insert(0);
        if v.orden_aplicacion > *current_max {
            *current_max = v.orden_aplicacion;
        }
    }

    let mut disponibles = vec![];
    let mut current_bio = -1;

    for regla in reglas {
        if regla.biologico_id == current_bio {
            continue;
        }

        let max_orden = max_orden_por_bio.get(&regla.biologico_id).copied().unwrap_or(0);
        if regla.orden_aplicacion <= max_orden {
            continue;
        }

        if meses < regla.edad_minima_meses {
             current_bio = regla.biologico_id;
             continue;
        }
        if let Some(max) = regla.edad_maxima_meses {
             if meses > max {
                  current_bio = regla.biologico_id;
                  continue;
             }
        }

        disponibles.push(VacunaDisponible {
            biologico_id: regla.biologico_id,
            nombre: regla.nombre.clone(),
            dosis_id: regla.dosis_id,
            dosis_a_aplicar: regla.nombre_dosis.clone(),
            advertencia: None,
            orden_aplicacion: regla.orden_aplicacion,
            edad_recomendada_meses: regla.edad_recomendada_meses,
            intervalo_recomendado_meses: regla.intervalo_recomendado_meses,
            intervalo_minimo_meses: regla.intervalo_minimo_meses,
        });

        current_bio = regla.biologico_id;
    }

    Ok(disponibles)
}
