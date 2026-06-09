CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    personal_id INT NOT NULL REFERENCES personal_salud(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id INT,
    detalles TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_personal_id ON audit_logs(personal_id);
CREATE INDEX idx_audit_logs_creado_en ON audit_logs(creado_en DESC);
