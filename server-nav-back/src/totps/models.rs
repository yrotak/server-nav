use serde::{Serialize, Deserialize};
use sqlx::FromRow;



#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Totp {
    pub id: i32,
    pub owner: i32,
    pub issuer: String,
    pub name: String,
    pub secret: String,
}


#[derive(Clone, Deserialize)]
pub struct CreateEntryData {
    pub issuer: String,
    pub name: String,
    pub secret: String,
}