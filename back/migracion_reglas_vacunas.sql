BEGIN;

-- 1. Modificar la tabla esquema_dosis para soportar la lógica dinámica
ALTER TABLE esquema_dosis
ADD COLUMN IF NOT EXISTS edad_minima_meses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS edad_maxima_meses INTEGER,
ADD COLUMN IF NOT EXISTS edad_recomendada_meses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intervalo_recomendado_meses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intervalo_minimo_meses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS es_refuerzo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS es_anual BOOLEAN DEFAULT FALSE;

-- 2. Limpiar esquemas anteriores para recrearlos
DELETE FROM esquema_dosis;

-- 3. Actualizar / Insertar Catálogo Biológicos
UPDATE catalogo_biologicos SET nombre = 'Hexavalente', descripcion = 'DTPa + VHB + Hib + IPV' WHERE id = 4;
UPDATE catalogo_biologicos SET nombre = 'Neumococo 20 Valente' WHERE id = 9;

INSERT INTO catalogo_biologicos (id, nombre, descripcion) OVERRIDING SYSTEM VALUE VALUES
    (18, 'Covid-19', 'Vacuna contra Covid-19'),
    (19, 'Hepatitis A', 'Vacuna contra Hepatitis A'),
    (20, 'Varicela', 'Vacuna contra Varicela'),
    (21, 'Virus Papiloma Humano (VPH)', 'Vacuna contra VPH'),
    (22, 'Tdap', 'Tétanos, difteria y Tosferina acelular (adolescentes/adultos)')
ON CONFLICT (id) DO NOTHING;

SELECT setval('catalogo_biologicos_id_seq', (SELECT MAX(id) FROM catalogo_biologicos), true);

-- 4. Insertar las reglas en esquema_dosis

-- BCG (1) - Dosis Única al nacer
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(1, 'DU', 1, 0, 0, 0, FALSE);

-- Hepatitis B (2) - Dosis Única al nacer
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(2, 'DU', 1, 0, 0, 0, FALSE);

-- Hexavalente (4) - 2m, 4m, 6m. Refuerzos 18m y 4 años.
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(4, '1D', 1, 2, 0, 0, FALSE),
(4, '2D', 2, 4, 2, 1, FALSE),
(4, '3D', 3, 6, 2, 1, FALSE),
(4, '1REF', 4, 18, 12, 3, TRUE),
(4, '2REF', 5, 48, 30, 6, TRUE);

-- Polio Oral (10) - 2m, 4m, 6m. Refuerzos 18m y 4 años.
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(10, '1D', 1, 2, 0, 0, FALSE),
(10, '2D', 2, 4, 2, 1, FALSE),
(10, '3D', 3, 6, 2, 1, FALSE),
(10, '1REF', 4, 18, 12, 6, TRUE),
(10, '2REF', 5, 48, 30, 6, TRUE);

-- Rotavirus (3) - 2m, 4m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(3, '1D', 1, 2, 0, 0, FALSE),
(3, '2D', 2, 4, 2, 1, FALSE);

-- Neumococo 20 Valente (9) - 2m, 4m, Refuerzo 12m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(9, '1D', 1, 2, 0, 0, FALSE),
(9, '2D', 2, 4, 2, 1, FALSE),
(9, '1REF', 3, 12, 8, 2, TRUE);

-- Influenza Estacional (11) - 6m, 7m, luego Anual (simplificado a 1REF)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo, es_anual) VALUES
(11, '1D', 1, 6, 0, 0, FALSE, FALSE),
(11, '2D', 2, 7, 1, 1, FALSE, FALSE),
(11, 'Anual', 3, 18, 12, 11, TRUE, TRUE);

-- Covid-19 (18) - 6m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(18, 'DU', 1, 6, 0, 0, FALSE);

-- SRP (7) - 12m, 18m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(7, '1D', 1, 12, 0, 0, FALSE),
(7, '1REF', 2, 18, 6, 1, TRUE);

-- Hepatitis A (19) - 12m, 18m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(19, '1D', 1, 12, 0, 0, FALSE),
(19, '1REF', 2, 18, 6, 6, TRUE);

-- Varicela (20) - 15m, 4 años (48m)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(20, '1D', 1, 15, 0, 0, FALSE),
(20, '1REF', 2, 48, 36, 3, TRUE);

-- Fiebre Amarilla (6) - 15m
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(6, 'DU', 1, 15, 0, 0, FALSE);

-- VPH (21) - 10 años (120m)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(21, '1D', 1, 120, 0, 0, FALSE),
(21, '2D', 2, 126, 6, 6, FALSE);

-- Tdap (22) - 10 años (120m)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(22, 'DU', 1, 120, 0, 0, FALSE);

-- TTD - Toxoide Tetánico Diftérico (8) - Esquema de 10 a 19 años cada 10 años (Para sustituir lo de "Pentavalente cada 10 años")
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion, edad_recomendada_meses, intervalo_recomendado_meses, intervalo_minimo_meses, es_refuerzo) VALUES
(8, '1D', 1, 120, 0, 0, FALSE),
(8, '2D', 2, 121, 1, 1, FALSE),
(8, '1REF', 3, 133, 12, 12, TRUE),
(8, '2REF', 4, 253, 120, 120, TRUE),
(8, '3REF', 5, 373, 120, 120, TRUE);

SELECT setval('esquema_dosis_id_seq', (SELECT MAX(id) FROM esquema_dosis), true);

COMMIT;
