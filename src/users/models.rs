use serde::{Deserialize, Serialize};
use sqlx::{FromRow};

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
    pub totp: String,
    pub date: i64,
    pub regsess: String,
    pub rank: String,
    pub unique_id: String,
    pub creditential: String,
}

#[derive(Clone, Deserialize)]
pub struct CreateEntryData {
    pub username: String,
    pub password: String,
    pub totp: String,
    pub regpayload: String,
    pub public_key_credential: String,
    pub unique_id: String,
}
#[derive(Clone, Deserialize)]
pub struct InitRegister {
    pub username: String,
}
#[derive(Clone, Deserialize)]
pub struct ChangeRankData {
    pub id: i32,
    pub rank: String,
}
#[derive(Clone, Deserialize)]
pub struct LoginData {
    pub username: String,
    pub password: String,
}
#[derive(Clone, Deserialize)]
pub struct TotpData {
    pub code: String,
}

#[derive(Clone, Deserialize)]
pub struct SignData {
    pub public_key_credential: String,
}

#[derive(Clone, Deserialize)]
pub struct ChangePasswordData {
    pub curpass: String,
    pub newpass: String,
    pub confirmnewpass: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserTokenData {
    pub id: i32,
    pub password: String,
    pub auth_level: i32,
    pub exp: i64
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistrationFromDb {
    pub key_handle: Vec<u8>,
    pub pub_key: Vec<u8>,

    pub attestation_cert: Option<Vec<u8>>,
    pub device_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterTokenData {
    pub regsess: String,
    pub exp: i64
}