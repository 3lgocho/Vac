use reqwest::Client;
use serde_json::json;

pub async fn enviar_notificacion_vacuna(
    telefono: &str,
    mensaje: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    // El puerto 2785 es donde Docker expuso tu OpenWA localmente
    let url = "http://localhost:2785/api/sessions/clinica-bot/messages/send-text";

    let tel = telefono.trim();
    let tel_formatted = if tel.starts_with("0") {
        format!("58{}", &tel[1..])
    } else if tel.starts_with("+58") {
        tel[1..].to_string()
    } else if tel.starts_with("58") {
        tel.to_string()
    } else {
        format!("58{}", tel)
    };

    // Formateamos el número al estándar de WhatsApp (ej: 584121234567@c.us)
    let chat_id = format!("{}@c.us", tel_formatted);

    let res = client
        .post(url)
        .header("X-API-Key", "dev-admin-key")
        .json(&json!({
            "chatId": chat_id,
            "text": mensaje
        }))
        .send()
        .await?;

    if res.status().is_success() {
        println!("Notificación enviada a {}", telefono);
    } else {
        println!("Error al enviar a {}: {:?}", telefono, res.text().await?);
    }

    Ok(())
}

pub async fn enviar_notificacion_pdf_vacuna(
    telefono: &str,
    mensaje_caption: &str,
    pdf_base64: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    let url = "http://localhost:2785/api/sessions/clinica-bot/messages/send-file";

    let tel = telefono.trim();
    let tel_formatted = if tel.starts_with("0") {
        format!("58{}", &tel[1..])
    } else if tel.starts_with("+58") {
        tel[1..].to_string()
    } else if tel.starts_with("58") {
        tel.to_string()
    } else {
        format!("58{}", tel)
    };

    let chat_id = format!("{}@c.us", tel_formatted);
    
    // OpenWA espera el data URI completo en algunos endpoints, o solo base64.
    // Usualmente es preferible enviar el data URI: data:application/pdf;base64,...
    let base64_uri = format!("data:application/pdf;base64,{}", pdf_base64);

    let res = client
        .post(url)
        .header("X-API-Key", "dev-admin-key")
        .json(&json!({
            "chatId": chat_id,
            "base64": base64_uri,
            "filename": "tarjeta_vacunacion.pdf",
            "caption": mensaje_caption
        }))
        .send()
        .await?;

    if res.status().is_success() {
        println!("PDF enviado a {}", telefono);
    } else {
        println!("Error al enviar PDF a {}: {:?}", telefono, res.text().await?);
    }

    Ok(())
}
