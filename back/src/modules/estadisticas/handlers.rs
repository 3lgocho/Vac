use super::models::{EstadisticaItem, EstadisticasResponse, QueryEstadisticas};
use crate::AppState;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::Row;

pub async fn obtener_estadisticas(
    State(state): State<AppState>,
    Query(params): Query<QueryEstadisticas>,
) -> impl IntoResponse {
    let query = r#"
        SELECT 
            p.genero,
            EXTRACT(MONTH FROM pv.fecha_aplicacion)::integer as mes_calendario,
            EXTRACT(YEAR FROM age(pv.fecha_aplicacion, p.fecha_nacimiento))::integer as edad_anios
        FROM paciente_vacunas pv
        JOIN pacientes p ON pv.paciente_id = p.id
        WHERE EXTRACT(YEAR FROM pv.fecha_aplicacion) = $1
          AND EXTRACT(MONTH FROM pv.fecha_aplicacion) >= $2
          AND EXTRACT(MONTH FROM pv.fecha_aplicacion) <= $3
    "#;

    let rows_result = sqlx::query(query)
        .bind(params.anio as f64) 
        .bind(params.mes_inicio as f64)
        .bind(params.mes_fin as f64)
        .fetch_all(&state.db)
        .await;

    let rows = match rows_result {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Error al consultar estadísticas: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(EstadisticasResponse { datos: vec![] }),
            );
        }
    };

    let mut items = vec![];
    for m in params.mes_inicio..=params.mes_fin {
        items.push(EstadisticaItem {
            mes: m,
            genero_f: 0, genero_m: 0,
            edad_0_11_meses: 0, edad_1_4_anos: 0, edad_5_19_anos: 0,
            edad_20_59_anos: 0, edad_60_79_anos: 0, edad_80_mas: 0,
        });
    }

    for row in rows {
        let genero: String = row.get("genero");
        let mes_calendario: i32 = row.get("mes_calendario");
        let edad_anios: i32 = row.get("edad_anios");

        let index = (mes_calendario - params.mes_inicio) as i32;
        if index < 0 || index >= items.len() as i32 {
            continue; 
        }
        
        let item = &mut items[index as usize];

        if genero == "Femenino" || genero == "F" {
            item.genero_f += 1;
        } else if genero == "Masculino" || genero == "M" {
            item.genero_m += 1;
        }

        if edad_anios == 0 {
            item.edad_0_11_meses += 1;
        } else if edad_anios >= 1 && edad_anios <= 4 {
            item.edad_1_4_anos += 1;
        } else if edad_anios >= 5 && edad_anios <= 19 {
            item.edad_5_19_anos += 1;
        } else if edad_anios >= 20 && edad_anios <= 59 {
            item.edad_20_59_anos += 1;
        } else if edad_anios >= 60 && edad_anios <= 79 {
            item.edad_60_79_anos += 1;
        } else if edad_anios >= 80 {
            item.edad_80_mas += 1;
        }
    }

    (StatusCode::OK, Json(EstadisticasResponse { datos: items }))
}
