use std::sync::Mutex;

use actix_web::web::Data;
use sqlx::{Pool, Postgres};
use webauthn_rs::Webauthn;

use crate::{users::models::{User, UserTokenData}, States};

pub struct AppState {
    pub db: Pool<Postgres>,
    pub webauthn: Webauthn,
    pub states: Mutex<States>,
}

pub async fn check_token(token: String, state: Data<AppState>) -> Result<User, String> {
    match jsonwebtoken::decode::<UserTokenData>(
        &token,
        &jsonwebtoken::DecodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("secret not found")
                .as_ref(),
        ),
        &jsonwebtoken::Validation::default(),
    ) {
        Ok(token) => {
            if token.claims.auth_level == 3 {
                match sqlx::query_as!(
                    User,
                    "SELECT * FROM server_nav.users WHERE id = $1 AND password = $2",
                    token.claims.id,
                    token.claims.password
                )
                .fetch_all(&state.db)
                .await
                {
                    Ok(user) => {
                        if user.len() == 0 {
                            return Err("Token creditentials are invalids".to_owned());
                        }
                        if user[0].rank == "unaccepted" {
                            return Err("Your account has not been activated".to_owned());
                        }
                        return Ok(user[0].clone());
                    }
                    Err(_) => return Err("Something happened while contacting db".to_owned()),
                }
            } else {
                return Err("Wrong auth level".to_owned());
            }
        }
        Err(_) => Err("Invalid token".to_owned()),
    }
}

pub fn build_error(err: &str) -> serde_json::Value {
    return serde_json::json!({
        "error": err
    });
}
