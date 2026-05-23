-- =============================================
-- MIGRACIÓN: Esquema de Vacunación Completo
-- =============================================

BEGIN;

-- 1. Hepatitis B (Pediátrica) -> Hepatitis B (3 dosis)
UPDATE catalogo_biologicos
SET nombre = 'Hepatitis B', descripcion = 'Prevención de Hepatitis B (3 dosis: recién nacidos, 1 y 6 meses)'
WHERE id = 2;

DELETE FROM esquema_dosis WHERE biologico_id = 2 AND nombre_dosis = 'DU';

INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (2, '1D', 1),
    (2, '2D', 2),
    (2, '3D', 3);

-- 2. Pentavalente: agregar 1REF, 2REF, DA
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (4, '1REF', 4),
    (4, '2REF', 5),
    (4, 'DA',   6);

-- 3. Polio (IPV/bOPV) -> Polio Inyectable (solo 3 dosis)
UPDATE catalogo_biologicos
SET nombre = 'Polio Inyectable', descripcion = 'Prevención de la Poliomielitis (Vacuna Inactivada)'
WHERE id = 5;

DELETE FROM esquema_dosis WHERE biologico_id = 5;

INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (5, '1D', 1),
    (5, '2D', 2),
    (5, '3D', 3);

-- 4. SRP: agregar 2D, DA
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (7, '2D', 3),
    (7, 'DA', 4);

-- 5. TTD: esquema completo (reemplazar Refuerzo Gestacional)
DELETE FROM esquema_dosis WHERE biologico_id = 8;

INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (8, '1D',   1),
    (8, '2D',   2),
    (8, '3D',   3),
    (8, '1REF', 4),
    (8, '2REF', 5),
    (8, '3REF', 6),
    (8, 'DA',   7);

-- 6. Nuevos biológicos
INSERT INTO catalogo_biologicos (id, nombre, descripcion) OVERRIDING SYSTEM VALUE VALUES
    (9,  'Neumococo 13 Valente',  'Prevención de enfermedades neumocócicas (13 serotipos)'),
    (10, 'Polio Oral',            'Prevención de la Poliomielitis (Vacuna Oral)'),
    (11, 'Influenza Estacional',  'Prevención de la Influenza Estacional'),
    (12, 'Neumococo 23 Valente',  'Prevención de enfermedades neumocócicas (23 serotipos)'),
    (13, 'Meningocócica B-C',     'Prevención de enfermedad meningocócica'),
    (14, 'Rabia Humana (Pre-exposición)',  'Prevención de la Rabia (Pre-exposición)'),
    (15, 'Rabia Humana (Post-exposición)', 'Prevención de la Rabia (Post-exposición)');

-- 7. Dosis de nuevos biológicos
-- Neumococo 13 Valente (id=9)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (9, '1D',   1),
    (9, '2D',   2),
    (9, '3D',   3),
    (9, '1REF', 4),
    (9, '2REF', 5),
    (9, 'DA',   6);

-- Polio Oral (id=10)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (10, '1D',   1),
    (10, '2D',   2),
    (10, '3D',   3),
    (10, '1REF', 4),
    (10, '2REF', 5),
    (10, 'DA',   6);

-- Influenza Estacional (id=11)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (11, '1D',   1),
    (11, '2D',   2),
    (11, '1REF', 3),
    (11, 'DA',   4);

-- Neumococo 23 Valente (id=12)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (12, '1D',   1),
    (12, '1REF', 2);

-- Meningocócica B-C (id=13)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (13, '1D', 1),
    (13, '2D', 2);

-- Rabia Humana (Pre-exposición) (id=14)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (14, '1D', 1),
    (14, '2D', 2),
    (14, '3D', 3);

-- Rabia Humana (Post-exposición) (id=15)
INSERT INTO esquema_dosis (biologico_id, nombre_dosis, orden_aplicacion) VALUES
    (15, '1D', 1),
    (15, '2D', 2),
    (15, '3D', 3),
    (15, '4D', 4),
    (15, '5D', 5),
    (15, '6D', 6),
    (15, '7D', 7);

-- 8. Actualizar secuencias
SELECT setval('catalogo_biologicos_id_seq', 15, true);
SELECT setval('esquema_dosis_id_seq', (SELECT MAX(id) FROM esquema_dosis), true);

COMMIT;
