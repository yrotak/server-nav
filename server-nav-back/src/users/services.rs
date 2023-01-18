use crate::{
    users::models::{ChangePasswordData, RegistrationFromDb, SignData},
    utils::utils::AppState,
};

use super::models::{CreateEntryData, LoginData, RegisterTokenData, TotpData, User, UserTokenData};
use actix_web::{
    delete, get, post, put,
    web::{Data, Json, Path, ServiceConfig},
    HttpRequest, HttpResponse, Responder,
};
use chrono;
use rand::distributions::{Alphanumeric, DistString};
use sqlx;
use u2f::{messages::SignResponse, protocol::Challenge, register::Registration};

use crate::utils::utils;

#[get("/api/v1/Users")]
async fn get_entries(state: Data<AppState>, req: HttpRequest) -> impl Responder {
    match utils::check_token(
        req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no")
            .to_string(),
        state.clone(),
    )
    .await
    {
        Ok(user) => {
            if (user.rank != "admin") {
                return HttpResponse::Unauthorized()
                    .json(utils::build_error("You need admin rank"));
            }
            match sqlx::query_as!(User, "SELECT * FROM server_nav.users")
                .fetch_all(&state.db)
                .await
            {
                Ok(users) => HttpResponse::Ok().json(users),
                Err(_) => HttpResponse::NotFound()
                    .json(utils::build_error("Something happened while contacting db")),
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}
#[get("/api/v1/Users/generateLink")]
async fn generate_link(state: Data<AppState>, req: HttpRequest) -> impl Responder {
    match utils::check_token(
        req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no")
            .to_string(),
        state,
    )
    .await
    {
        Ok(user) => {
            if (user.rank != "admin") {
                return HttpResponse::Unauthorized()
                    .json(utils::build_error("You need admin rank"));
            }
            let regpayload = jsonwebtoken::encode(
                &jsonwebtoken::Header::default(),
                &RegisterTokenData {
                    regsess: Alphanumeric.sample_string(&mut rand::thread_rng(), 16),
                    exp: chrono::offset::Local::now().timestamp() + (2 * 24 * 60 * 60 * 1000),
                },
                &jsonwebtoken::EncodingKey::from_secret(
                    std::env::var("JWT_SECRET")
                        .expect("secret not found")
                        .as_ref(),
                ),
            )
            .unwrap();
            return HttpResponse::Ok()
                .json(serde_json::json!({"url":std::env::var("URL").expect("url not found") + "/register?p=" + regpayload.as_str()}));
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}

#[post("/api/v1/Users/login")]
async fn login(state: Data<AppState>, data: Json<LoginData>) -> impl Responder {
    match sqlx::query_as!(
        User,
        "SELECT * FROM server_nav.users WHERE username = $1 AND password = $2",
        data.username,
        sha256::digest(String::from(data.password.clone())),
    )
    .fetch_all(&state.db)
    .await
    {
        Ok(user) => {
            if user.len() == 0 {
                return HttpResponse::NotFound().json(utils::build_error(
                    "User does not exist or wrong creditentials",
                ));
            }
            if user[0].rank == "unaccepted" {
                return HttpResponse::NotFound()
                    .json(utils::build_error("Your account has not been activated"));
            }
            let token = jsonwebtoken::encode(
                &jsonwebtoken::Header::default(),
                &UserTokenData {
                    id: user[0].id,
                    password: user[0].password.clone(),
                    auth_level: 1,
                    exp: chrono::offset::Local::now().timestamp() + (2 * 24 * 60 * 60 * 1000),
                },
                &jsonwebtoken::EncodingKey::from_secret(
                    std::env::var("JWT_SECRET")
                        .expect("secret not found")
                        .as_ref(),
                ),
            )
            .unwrap();
            return HttpResponse::Ok().json(serde_json::json!({ "token": token }));
        }
        Err(_) => HttpResponse::NotFound()
            .json(utils::build_error("Something happened while contacting db")),
    }
}

#[post("/api/v1/Users/totp")]
async fn totp_confirm(
    state: Data<AppState>,
    data: Json<TotpData>,
    req: HttpRequest,
) -> impl Responder {
    match jsonwebtoken::decode::<UserTokenData>(
        &req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no"),
        &jsonwebtoken::DecodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("secret not found")
                .as_ref(),
        ),
        &jsonwebtoken::Validation::default(),
    ) {
        Ok(token) => {
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
                        return HttpResponse::Unauthorized()
                            .json(utils::build_error("Token creditentials are invalids"));
                    }
                    let totp = totp_rs::TOTP::new(
                        totp_rs::Algorithm::SHA1,
                        6,
                        1,
                        30,
                        totp_rs::Secret::Encoded(user[0].totp.clone())
                            .to_bytes()
                            .unwrap(),
                    )
                    .unwrap();
                    let totptoken = totp.generate_current().unwrap();
                    if totptoken != data.code {
                        return HttpResponse::Unauthorized()
                            .json(utils::build_error("TOTP code is invalid"));
                    }
                    let token = jsonwebtoken::encode(
                        &jsonwebtoken::Header::default(),
                        &UserTokenData {
                            id: user[0].id,
                            password: user[0].password.clone(),
                            auth_level: 2,
                            exp: chrono::offset::Local::now().timestamp()
                                + (2 * 24 * 60 * 60 * 1000),
                        },
                        &jsonwebtoken::EncodingKey::from_secret(
                            std::env::var("JWT_SECRET")
                                .expect("secret not found")
                                .as_ref(),
                        ),
                    )
                    .unwrap();
                    return HttpResponse::Ok().json(serde_json::json!({ "token": token }));
                }
                Err(_) => {
                    return HttpResponse::NotFound()
                        .json(utils::build_error("Something happened while contacting db"))
                }
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error("Invalid token")),
    }
}

#[post("/api/v1/Users/changePass")]
async fn change_pass(
    state: Data<AppState>,
    data: Json<ChangePasswordData>,
    req: HttpRequest,
) -> impl Responder {
    match utils::check_token(
        req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no")
            .to_string(),
        state.clone(),
    )
    .await
    {
        Ok(user) => {
            if user.password == sha256::digest(String::from(data.curpass.clone())) {
                if data.newpass == data.confirmnewpass {
                    match sqlx::query_as!(
                        User,
                        "UPDATE server_nav.users SET password = $1 WHERE id = $2 RETURNING id, username, password, totp, date, regsess, u2f_device, rank",
                        sha256::digest(String::from(data.newpass.clone())),
                        user.id
                    )
                    .fetch_all(&state.db)
                    .await
                    {
                        Ok(user) => {
                            if user.len() == 0 {
                                return HttpResponse::Unauthorized()
                                    .json(utils::build_error("An error has happened"));
                            }
        
                            return HttpResponse::Ok().json(serde_json::json!({ "success": true }));
                        }
                        Err(_) => {
                            return HttpResponse::NotFound()
                                .json(utils::build_error("Something happened while contacting db"))
                        }
                    }
                } else {
                    return HttpResponse::BadRequest()
                        .json(utils::build_error("The two password are not matching"))
                }
            } else {
                return HttpResponse::Unauthorized()
                        .json(utils::build_error("Current password is not valid"))
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}
#[post("/api/v1/Users/signRequest")]
async fn sign_request(state: Data<AppState>, req: HttpRequest) -> impl Responder {
    match jsonwebtoken::decode::<UserTokenData>(
        &req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no"),
        &jsonwebtoken::DecodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("secret not found")
                .as_ref(),
        ),
        &jsonwebtoken::Validation::default(),
    ) {
        Ok(token) => {
            if token.claims.auth_level == 2 {
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
                            return HttpResponse::Unauthorized()
                                .json(utils::build_error("Token creditentials are invalids"));
                        }
                        let challenge = state.u2f.generate_challenge().unwrap();
                        let challenge_str = serde_json::to_string(&challenge);
                        let v: RegistrationFromDb =
                            serde_json::from_str(&user[0].u2f_device).unwrap();
                        let u2f_device: Registration = Registration {
                            attestation_cert: v.attestation_cert,
                            key_handle: v.key_handle,
                            device_name: v.device_name,
                            pub_key: v.pub_key,
                        };
                        let signed_request = state.u2f.sign_request(challenge, vec![u2f_device]);

                        return HttpResponse::Ok().json(serde_json::json!({
                            "signed_request": signed_request,
                            "challenge_str": challenge_str.unwrap()
                        }));
                    }
                    Err(_) => {
                        return HttpResponse::NotFound()
                            .json(utils::build_error("Something happened while contacting db"))
                    }
                }
            } else {
                return HttpResponse::Unauthorized().json(utils::build_error("Wrong auth level"));
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error("Invalid token")),
    }
}
#[post("/api/v1/Users/signResponse")]
async fn sign_response(
    state: Data<AppState>,
    data: Json<SignData>,
    req: HttpRequest,
) -> impl Responder {
    match jsonwebtoken::decode::<UserTokenData>(
        &req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no"),
        &jsonwebtoken::DecodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("secret not found")
                .as_ref(),
        ),
        &jsonwebtoken::Validation::default(),
    ) {
        Ok(token) => {
            if token.claims.auth_level == 2 {
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
                            return HttpResponse::Unauthorized()
                                .json(utils::build_error("Token creditentials are invalids"));
                        }
                        let challenge: Challenge =
                            serde_json::from_str(&data.challenge_str).unwrap();
                        let v: RegistrationFromDb =
                            serde_json::from_str(&user[0].u2f_device).unwrap();
                        let u2f_device: Registration = Registration {
                            attestation_cert: v.attestation_cert,
                            key_handle: v.key_handle,
                            device_name: v.device_name,
                            pub_key: v.pub_key,
                        };
                        let sign_resp: SignResponse =
                            serde_json::from_str(&data.sign_data).unwrap();

                        let mut _counter: u32 = 0;
                        let response = state.u2f.sign_response(
                            challenge.clone(),
                            u2f_device,
                            sign_resp.clone(),
                            _counter,
                        );
                        match response {
                            Ok(new_counter) => {
                                _counter = new_counter;
                                let token = jsonwebtoken::encode(
                                    &jsonwebtoken::Header::default(),
                                    &UserTokenData {
                                        id: user[0].id,
                                        password: user[0].password.clone(),
                                        auth_level: 3,
                                        exp: chrono::offset::Local::now().timestamp()
                                            + (2 * 24 * 60 * 60 * 1000),
                                    },
                                    &jsonwebtoken::EncodingKey::from_secret(
                                        std::env::var("JWT_SECRET")
                                            .expect("secret not found")
                                            .as_ref(),
                                    ),
                                )
                                .unwrap();
                                return HttpResponse::Ok().json(serde_json::json!({
                                    "token": token,
                                }));
                            }
                            Err(_e) => {
                                return HttpResponse::Unauthorized()
                                    .json(utils::build_error("Invalid U2F !"));
                            }
                        }
                    }
                    Err(_) => {
                        return HttpResponse::NotFound()
                            .json(utils::build_error("Something happened while contacting db"))
                    }
                }
            } else {
                return HttpResponse::Unauthorized().json(utils::build_error("Wrong auth level"));
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error("Invalid token")),
    }
}
#[get("/api/v1/Users/initRegister")]
async fn register_request(state: Data<AppState>) -> impl Responder {
    let challenge = state.u2f.generate_challenge().unwrap();
    let challenge_str = serde_json::to_string(&challenge);

    let u2f_request = state.u2f.request(challenge.clone(), vec![]);

    let secret = totp_rs::Secret::generate_secret().to_encoded();

    return HttpResponse::Ok().json(serde_json::json!({
        "secret": secret.to_string(),
        "u2f_request": u2f_request.unwrap(),
        "challenge_str": challenge_str.unwrap()
    }));
}
#[post("/api/v1/Users")]
async fn post_entries(state: Data<AppState>, data: Json<CreateEntryData>) -> impl Responder {
    let regpayload = jsonwebtoken::decode::<RegisterTokenData>(
        &data.regpayload,
        &jsonwebtoken::DecodingKey::from_secret(
            std::env::var("JWT_SECRET")
                .expect("secret not found")
                .as_ref(),
        ),
        &jsonwebtoken::Validation::default(),
    )
    .unwrap()
    .claims;
    match sqlx::query_as!(
        User,
        "SELECT * FROM server_nav.users WHERE regsess = $1",
        regpayload.regsess,
    )
    .fetch_all(&state.db)
    .await
    {
        Ok(user) => {
            if user.len() > 0 {
                return HttpResponse::NotAcceptable().json(utils::build_error("Link already used"));
            }
            let challenge: Challenge = serde_json::from_str(&data.challenge_str).unwrap();
            let registration = state
                .u2f
                .register_response(challenge, serde_json::from_str(&data.u2f_device).unwrap());
            match registration {
                Ok(reg) => {
                    match sqlx::query_as!(
                        User,
                        "INSERT INTO server_nav.users (username, password, totp, date, regsess, u2f_device, rank) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, password, totp, date, regsess, u2f_device, rank",
                        data.username,
                        sha256::digest(String::from(data.password.clone())),
                        data.totp,
                        chrono::offset::Local::now().timestamp(),
                        regpayload.regsess,
                        serde_json::to_string(&reg).unwrap(),
                        "unaccepted"
                    )
                    .fetch_all(&state.db)
                    .await
                    {
                        Ok(user) => return HttpResponse::Ok().json(user),
                        Err(_) => return HttpResponse::NotFound().json(utils::build_error("Something happened while contacting db")),
                    }
                }
                Err(e) => {
                    return HttpResponse::NotFound().json(utils::build_error("Something happened while contacting db"));
                }
            }
        }
        Err(_) => HttpResponse::NotFound()
            .json(utils::build_error("Something happened while contacting db")),
    }
}

#[delete("/api/v1/Users/{id}")]
async fn delete_entries(
    state: Data<AppState>,
    path_id: Path<i32>,
    req: HttpRequest,
) -> impl Responder {
    match utils::check_token(
        req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no")
            .to_string(),
        state.clone(),
    )
    .await
    {
        Ok(user) => {
            if (user.rank != "admin") {
                return HttpResponse::Unauthorized()
                    .json(utils::build_error("You need admin rank"));
            }
            let id = path_id.into_inner();

            match sqlx::query_as!(
                User,
                "DELETE FROM server_nav.users WHERE id = $1 RETURNING id, username, password, totp, date, regsess, u2f_device, rank",
                id
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(user) => HttpResponse::Ok().json(user),
                Err(_) => HttpResponse::NotFound().json(utils::build_error("Something happened while contacting db")),
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}
#[post("/api/v1/Users/checkToken")]
async fn check_token(state: Data<AppState>, req: HttpRequest) -> impl Responder {
    match utils::check_token(
        req.headers()
            .get("Authorization")
            .unwrap()
            .to_str()
            .unwrap_or("no")
            .to_string(),
        state,
    )
    .await
    {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}
pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(get_entries)
        .service(post_entries)
        .service(delete_entries)
        .service(login)
        .service(generate_link)
        .service(totp_confirm)
        .service(register_request)
        .service(sign_response)
        .service(sign_request)
        .service(check_token)
        .service(change_pass);
}
