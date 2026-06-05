use lopdf::{dictionary, Document, Object, Stream};
use lopdf::content::{Content, Operation};
use base64::{Engine as _, engine::general_purpose};
use chrono::NaiveDate;

pub struct DatosVacunacion<'a> {
    pub nombre: &'a str,
    pub cedula: &'a str,
    pub fecha_nacimiento: Option<NaiveDate>,
    pub sexo: &'a str,
    pub vacunas: Vec<VacunaAplicadaFila<'a>>,
}

pub struct VacunaAplicadaFila<'a> {
    pub vacuna: &'a str,
    pub dosis: &'a str,
    pub fecha: NaiveDate,
}

pub fn generar_comprobante_pdf(datos: &DatosVacunacion) -> Result<String, String> {
    // Intentamos cargar la plantilla
    let template_path = "src/assets/plantilla_vacunacion.pdf";
    let mut doc = match Document::load(template_path) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("No se pudo cargar la plantilla PDF en {}: {}", template_path, e);
            // Fallback: Si no hay plantilla, creamos un documento básico
            return generar_comprobante_pdf_basico(datos);
        }
    };

    // Añadir fuente Helvetica si no existe
    doc.add_object(lopdf::dictionary! {
        "Type" => "Font",
        "Subtype" => "Type1",
        "BaseFont" => "Helvetica",
    });

    // Encontrar la primera página
    let page_id = doc.page_iter().next().ok_or("La plantilla PDF no tiene páginas")?;
    
    // Preparar el texto a dibujar
    let mut operations = Vec::new();
    
    // Iniciar texto
    operations.push(Operation::new("BT", vec![]));
    // Asignamos una fuente estándar (aquí deberíamos agregarla a los recursos de la página,
    // pero para simplificar asumiendo un fallback, o podemos usar el generador básico)
    // Para no complicar el objeto PDF de la plantilla arbitraria sin conocer sus fuentes,
    // este es un bosquejo de inserción.
    
    operations.push(Operation::new("ET", vec![]));

    let content = Content { operations };
    let stream = Stream::new(lopdf::dictionary! {}, content.encode().unwrap());
    
    let stream_id = doc.add_object(stream);
    
    // Añadimos el stream al contenido de la página
    if let Ok(Object::Dictionary(page_dict)) = doc.get_object_mut(page_id) {
        if let Ok(contents) = page_dict.get_mut(b"Contents") {
            if let Object::Array(arr) = contents {
                arr.push(Object::Reference(stream_id));
            } else if let Object::Reference(old_stream_id) = contents {
                let old_id = old_stream_id.clone();
                *contents = Object::Array(vec![Object::Reference(old_id), Object::Reference(stream_id)]);
            }
        } else {
            page_dict.set("Contents", Object::Reference(stream_id));
        }
    }

    let mut buf = Vec::new();
    doc.save_to(&mut buf).map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(&buf))
}

// Fallback básico en caso de que no exista la plantilla
fn generar_comprobante_pdf_basico(datos: &DatosVacunacion) -> Result<String, String> {
    let mut doc = Document::with_version("1.5");
    let pages_id = doc.new_object_id();
    
    let font_id = doc.add_object(lopdf::dictionary! {
        "Type" => "Font",
        "Subtype" => "Type1",
        "BaseFont" => "Helvetica",
    });

    let resources_id = doc.add_object(lopdf::dictionary! {
        "Font" => lopdf::dictionary! {
            "F1" => font_id,
        },
    });

    let mut operations = Vec::new();
    operations.push(Operation::new("BT", vec![]));
    operations.push(Operation::new("Tf", vec!["F1".into(), 12.into()]));
    operations.push(Operation::new("Td", vec![50.into(), 800.into()]));
    
    let texto_titulo = format!("Comprobante de Vacunacion");
    operations.push(Operation::new("Tj", vec![Object::string_literal(texto_titulo)]));
    operations.push(Operation::new("Td", vec![0.into(), (-20).into()]));
    
    let texto_paciente = format!("Paciente: {} - Cedula: {}", datos.nombre, datos.cedula);
    operations.push(Operation::new("Tj", vec![Object::string_literal(texto_paciente)]));
    
    for vacuna in &datos.vacunas {
        operations.push(Operation::new("Td", vec![0.into(), (-15).into()]));
        let texto_vacuna = format!("{} - {} - {}", vacuna.vacuna, vacuna.dosis, vacuna.fecha.format("%Y-%m-%d"));
        operations.push(Operation::new("Tj", vec![Object::string_literal(texto_vacuna)]));
    }

    operations.push(Operation::new("ET", vec![]));
    let content = Content { operations };
    let content_id = doc.add_object(Stream::new(lopdf::dictionary! {}, content.encode().unwrap()));

    let page_id = doc.add_object(lopdf::dictionary! {
        "Type" => "Page",
        "Parent" => pages_id,
        "Contents" => content_id,
        "Resources" => resources_id,
        "MediaBox" => vec![0.into(), 0.into(), 595.into(), 842.into()],
    });

    let pages = lopdf::dictionary! {
        "Type" => "Pages",
        "Kids" => vec![page_id.into()],
        "Count" => 1,
    };
    doc.objects.insert(pages_id, Object::Dictionary(pages));
    
    let catalog_id = doc.add_object(lopdf::dictionary! {
        "Type" => "Catalog",
        "Pages" => pages_id,
    });
    
    doc.trailer.set("Root", catalog_id);
    doc.compress();

    let mut buf = Vec::new();
    doc.save_to(&mut buf).map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(&buf))
}
