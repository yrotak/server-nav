use actix_web::{
    delete, get, post, put,
    web::{Data, Json, Path, ServiceConfig},
    HttpRequest, HttpResponse, Responder,
};

use crate::{
    passwords::models::{Password, CreateEntryData},
    utils::utils::{self, AppState},
};

#[get("/api/v1/Passwords")]
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
        Ok(user) => match sqlx::query_as!(Password, "SELECT * FROM server_nav.passwords WHERE owner = $1", user.id)
            .fetch_all(&state.db)
            .await
        {
            Ok(passwords) => HttpResponse::Ok().json(passwords),
            Err(_) => HttpResponse::NotFound()
                .json(utils::build_error("Something happened while contacting db")),
        },
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}


#[post("/api/v1/Passwords")]
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
            match sqlx::query_as!(Password, "INSERT INTO server_nav.passwords (password, owner, name) VALUES ($1, $2, $3) RETURNING id, password, owner, name",
                data.password,
                user.id,
                data.name
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(item) => return HttpResponse::Ok().json(item),
                Err(_) => return HttpResponse::NotFound().json(utils::build_error("Something happened while contacting db")),
            },
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}

#[delete("/api/v1/Passwords/{id}")]
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
                Password,
                "DELETE FROM server_nav.passwords WHERE id = $1 AND owner = $2 RETURNING id, password, owner, name",
                id,
                user.id
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(password) => HttpResponse::Ok().json(password),
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