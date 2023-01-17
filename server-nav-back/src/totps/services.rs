use actix_web::{
    delete, get, post, put,
    web::{Data, Json, Path, ServiceConfig},
    HttpRequest, HttpResponse, Responder,
};

use crate::{utils::utils::{AppState, self}, totps::models::{Totp, CreateEntryData}};

#[get("/api/v1/Totps")]
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
        Ok(user) => match sqlx::query_as!(Totp, "SELECT * FROM server_nav.totps WHERE owner = $1", user.id)
            .fetch_all(&state.db)
            .await
        {
            Ok(totps) => HttpResponse::Ok().json(totps),
            Err(_) => HttpResponse::NotFound()
                .json(utils::build_error("Something happened while contacting db")),
        },
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}


#[post("/api/v1/Totps")]
async fn post_entries(
    state: Data<AppState>,
    data: Json<CreateEntryData>,
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
        Ok(user) =>
            match sqlx::query_as!(Totp, "INSERT INTO server_nav.totps (owner, issuer, name, secret) VALUES ($1, $2, $3, $4) RETURNING id,owner, issuer, name, secret",
                user.id,
                data.issuer,
                data.name,
                data.secret
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(totp) => return HttpResponse::Ok().json(totp),
                Err(_) => return HttpResponse::NotFound().json(utils::build_error("Something happened while contacting db")),
            },
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}

#[delete("/api/v1/Totps/{id}")]
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
            let id = path_id.into_inner();

            match sqlx::query_as!(
                Totp,
                "DELETE FROM server_nav.totps WHERE id = $1 AND owner = $2 RETURNING id, owner, issuer, name, secret",
                id,
                user.id
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(totp) => HttpResponse::Ok().json(totp),
                Err(_) => HttpResponse::NotFound()
                    .json(utils::build_error("Something happened while contacting db")),
            }
        }
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}


pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(get_entries)
        .service(post_entries)
        .service(delete_entries);
}