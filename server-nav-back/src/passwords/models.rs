use serde::{Serialize, Deserialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Password {
    pub id: i32,
    pub password: String,
    pub owner: i32,
    pub name: String,
}


#[derive(Clone, Deserialize)]
pub struct CreateEntryData {
    pub password: String,
    pub name: String,
}