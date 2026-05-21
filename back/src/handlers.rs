use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
};
use sqlx::{PgPool, Postgres, QueryBuilder};
// Importa tu modelo Paciente aquí

pub async fn get_pacientes(
    State(pool): State<PgPool>,
    Query(filtros): Query<FiltrosPaciente>,
) -> Result<Json<Vec<Paciente>>, (StatusCode, String)> {
    // Iniciamos la query base. El "1=1" es un truco para concatenar los AND fácilmente.
    let mut qb: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM pacientes WHERE 1=1");

    // Si enviaron texto de búsqueda
    if let Some(search) = &filtros.search {
        let search_term = format!("%{}%", search);
        qb.push(" AND (nombre ILIKE ");
        qb.push_bind(search_term.clone());
        qb.push(" OR cedula ILIKE ");
        qb.push_bind(search_term);
        qb.push(")");
    }

    // Si enviaron fecha de inicio
    if let Some(inicio) = &filtros.fecha_inicio {
        // Cambia 'creado_en' por tu columna de fecha de cita/vacuna
        qb.push(" AND DATE(creado_en) >= ");
        // SQLx mapeará el String a DATE en Postgres si el formato es correcto
        qb.push_bind(inicio);
    }

    // Si enviaron fecha final
    if let Some(fin) = &filtros.fecha_fin {
        qb.push(" AND DATE(creado_en) <= ");
        qb.push_bind(fin);
    }

    // Ordenamos para que los más recientes/urgentes salgan primero y limitamos
    qb.push(" ORDER BY id DESC LIMIT 50");

    // Construimos y ejecutamos
    let pacientes = qb
        .build_query_as::<Paciente>()
        .fetch_all(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(pacientes))
}
