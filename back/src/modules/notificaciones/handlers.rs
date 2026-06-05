use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};

use crate::AppState;
use crate::modules::pacientes::models::Paciente;
use crate::modules::validador::models::{PerfilPaciente, VacunaAplicadaInput};
use crate::modules::validador::reglas::obtener_esquema_disponible;
use crate::modules::agenda::estado::calcular_estado_paciente;
use crate::modules::registro::models::GrupoEspecial;

use super::pdf_generator::{generar_comprobante_pdf, DatosVacunacion, VacunaAplicadaFila};
use super::client::enviar_notificacion_pdf_vacuna;

#[derive(Deserialize)]
pub struct EnviarComprobantePayload {
    pub paciente_id: i32,
}

#[derive(Serialize)]
pub struct EnviarComprobanteResponse {
    pub mensaje: String,
}

pub async fn enviar_notificacion_vacunas(
    State(state): State<AppState>,
    Json(payload): Json<EnviarComprobantePayload>,
) -> Result<Json<EnviarComprobanteResponse>, (StatusCode, String)> {
    let paciente_id = payload.paciente_id;

    // 1. Obtener Paciente
    let paciente = match sqlx::query_as::<_, Paciente>("SELECT * FROM pacientes WHERE id = $1")
        .bind(paciente_id)
        .fetch_optional(&state.db)
        .await
    {
        Ok(Some(p)) => p,
        Ok(None) => return Err((StatusCode::NOT_FOUND, "Paciente no encontrado".to_string())),
        Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Error DB: {}", e))),
    };

    // 2. Obtener Historial de Vacunas (todas, para el carnet y para calcular la próxima)
    let query_vacunas = r#"
        SELECT pv.biologico_id, b.nombre as biologico_nombre, pv.dosis_id, d.nombre_dosis as dosis_nombre,
               pv.fecha_aplicacion
        FROM paciente_vacunas pv
        JOIN catalogo_biologicos b ON pv.biologico_id = b.id
        JOIN esquema_dosis d ON pv.dosis_id = d.id
        WHERE pv.paciente_id = $1 ORDER BY pv.fecha_aplicacion ASC
    "#;

    #[derive(sqlx::FromRow)]
    struct VacunaRow {
        biologico_id: i32,
        biologico_nombre: String,
        dosis_id: i32,
        dosis_nombre: String,
        fecha_aplicacion: chrono::NaiveDate,
    }

    let historial = sqlx::query_as::<_, VacunaRow>(query_vacunas)
        .bind(paciente_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    // 3. Calcular Próxima Cita
    let grupos: Vec<GrupoEspecial> = paciente
        .grupos_especiales
        .as_ref()
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    let perfil = PerfilPaciente {
        fecha_nacimiento: paciente.fecha_nacimiento,
        grupos_especiales: grupos,
        vacunas_aplicadas: historial
            .iter()
            .map(|v| VacunaAplicadaInput {
                biologico_id: v.biologico_id,
                dosis_id: v.dosis_id,
                fecha_aplicacion: Some(v.fecha_aplicacion),
            })
            .collect(),
    };

    let faltantes = obtener_esquema_disponible(&perfil);
    let estado_paciente = calcular_estado_paciente(&perfil, &faltantes);

    // 4. Preparar Datos para PDF
    let vacunas_pdf: Vec<VacunaAplicadaFila> = historial.iter().map(|v| VacunaAplicadaFila {
        vacuna: &v.biologico_nombre,
        dosis: &v.dosis_nombre,
        fecha: v.fecha_aplicacion,
    }).collect();

    let datos_vacunacion = DatosVacunacion {
        nombre: &format!("{} {}", paciente.nombre, paciente.apellido),
        cedula: &paciente.cedula,
        fecha_nacimiento: Some(paciente.fecha_nacimiento),
        sexo: &paciente.genero,
        vacunas: vacunas_pdf,
    };

    let pdf_base64 = match generar_comprobante_pdf(&datos_vacunacion) {
        Ok(b64) => b64,
        Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, format!("Error generando PDF: {}", e))),
    };

    // 5. Construir el Texto del Mensaje
    // Filtramos las vacunas aplicadas "hoy" para mostrarlas en el mensaje
    let hoy = chrono::Local::now().naive_local().date();
    let vacunas_hoy: Vec<&VacunaRow> = historial.iter().filter(|v| v.fecha_aplicacion == hoy).collect();

    let mut mensaje = format!(
        "🏥 *Sistema de Registro de Vacunas*\n\n\
        Hola 👋\n\n\
        El registro de vacunación de *{} {}* se ha procesado exitosamente en nuestro sistema.\n\n",
        paciente.nombre, paciente.apellido
    );

    if !vacunas_hoy.is_empty() {
        mensaje.push_str("💉 *Biológicos aplicados hoy:*\n");
        for v in vacunas_hoy {
            mensaje.push_str(&format!("- {} [{}]\n", v.biologico_nombre, v.dosis_nombre));
        }
        mensaje.push_str("\n");
    }

    mensaje.push_str(
        "📄 *Tu Tarjeta de Vacunación Digital*\n\
        Adjunto a este mensaje encontrarás el comprobante oficial en formato PDF. Por favor, descárgalo y guárdalo.\n\n"
    );

    if let Some(prox_vac) = estado_paciente.proxima_vacuna {
        mensaje.push_str(&format!(
            "🗓️ *Próxima Cita:*\n\
            Para mantener el esquema de inmunización al día, te esperamos el *{}*.\n\n\
            (Te enviaremos un recordatorio automático días antes). 🔔",
            prox_vac.fecha_sugerida.format("%d/%m/%Y")
        ));
    }

    // 6. Enviar a OpenWA
    if let Some(telefono) = &paciente.telefono {
        if !telefono.trim().is_empty() {
            // Asincrónicamente enviar para no bloquear la respuesta HTTP
            // Clonamos los datos necesarios
            let tel_clone = telefono.clone();
            let msg_clone = mensaje.clone();
            
            tokio::spawn(async move {
                if let Err(e) = enviar_notificacion_pdf_vacuna(&tel_clone, &msg_clone, &pdf_base64).await {
                    eprintln!("Error asíncrono al enviar PDF por OpenWA: {}", e);
                }
            });
        }
    }

    Ok(Json(EnviarComprobanteResponse {
        mensaje: "Comprobante en proceso de envío".to_string(),
    }))
}
