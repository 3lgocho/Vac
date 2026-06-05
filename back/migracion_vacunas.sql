_ALTER TABLE esquema_dosis
-- Reglas de Edad (Todo llevado a MESES)
ADD COLUMN edad_minima_meses INTEGER DEFAULT 0,
ADD COLUMN edad_maxima_meses INTEGER, -- NULL significa sin límite

-- Reglas de Intervalo Recomendado (Meses a esperar desde la dosis anterior)
ADD COLUMN intervalo_recomendado_meses INTEGER DEFAULT 0,

-- Reglas Específicas
ADD COLUMN grupo_especial_requerido VARCHAR(100), -- 'embarazadas', 'VIH', etc.
ADD COLUMN genero_requerido VARCHAR(20), -- 'Femenino', 'Masculino' o NULL para ambos
ADD COLUMN es_anual BOOLEAN DEFAULT FALSE; -- Para casos como Influenza