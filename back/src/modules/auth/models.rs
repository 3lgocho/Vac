use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub cedula: String,
    pub pin: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub nombre: String,
    pub rol: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,
    pub cedula: String,
    pub nombre: String,
    pub rol: String,
    pub exp: usize,
}
