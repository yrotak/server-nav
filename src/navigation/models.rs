use serde::{Serialize, Deserialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct NavItem {
    pub id: i32,
    pub name: String,
    pub url: String,
    pub image: String,
}

#[derive(Clone, Deserialize)]
pub struct CreateEntryData {
    pub name: String,
    pub url: String,
    pub image: String,
}