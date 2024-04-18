use actix_web::{
    delete, get, post,
    web::{Data, Json, Path, ServiceConfig},
    HttpRequest, HttpResponse, Responder,
};

use crate::{
    navigation::models::{CreateEntryData, NavItem},
    utils::utils::{self, AppState},
};

#[get("/api/v1/Navigation")]
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
        Ok(_user) => match sqlx::query_as!(NavItem, "SELECT * FROM server_nav.nav_items")
            .fetch_all(&state.db)
            .await
        {
            Ok(items) => HttpResponse::Ok().json(items),
            Err(_) => HttpResponse::NotFound()
                .json(utils::build_error("Something happened while contacting db")),
        },
        Err(e) => HttpResponse::Unauthorized().json(utils::build_error(&e)),
    }
}

#[post("/api/v1/Navigation")]
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
        Ok(_user) =>
            match sqlx::query_as!(NavItem, "INSERT INTO server_nav.nav_items (name, url, image) VALUES ($1, $2, $3) RETURNING id, name, url, image",
                data.name,
                data.url,
                data.image
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

#[delete("/api/v1/Navigation/{id}")]
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
        Ok(_user) => {
            let id = path_id.into_inner();

            match sqlx::query_as!(
                NavItem,
                "DELETE FROM server_nav.nav_items WHERE id = $1 RETURNING id, name, url, image",
                id
            )
            .fetch_all(&state.db)
            .await
            {
                Ok(item) => HttpResponse::Ok().json(item),
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
