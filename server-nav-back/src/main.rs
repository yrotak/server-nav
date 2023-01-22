use std::io::Error;

mod navigation;
mod passwords;
mod totps;
mod users;

mod utils;

use actix_files::NamedFile;
use actix_multipart::Multipart;
use actix_web::middleware;
use actix_web::HttpRequest;
use actix_web::{get, post, web, web::Data, App, HttpResponse, HttpServer, Responder};
use futures_util::TryStreamExt as _;
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use rand::distributions::{Alphanumeric, DistString};
use sqlx::postgres::PgPoolOptions;
use utils::utils::build_error;
use std::io::Write;
use u2f::protocol::*;
use users::models::RegisterTokenData;
use utils::utils::AppState;
use uuid::Uuid;

use crate::utils::utils::check_token;

#[get("/")]
async fn index() -> Result<NamedFile, Error> {
    NamedFile::open("./static/index.html")
}
#[get("/register")]
async fn register() -> Result<NamedFile, Error> {
    NamedFile::open("./static/register.html")
}
async fn save_file(
    mut payload: Multipart,
    state: Data<AppState>,
    req: HttpRequest,
) -> Result<HttpResponse, actix_web::Error> {
    match check_token(
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

            let mut filenames: Vec<String> = vec![];

            while let Some(mut field) = payload.try_next().await? {
                let content_disposition = field.content_disposition();
        
                let filename = content_disposition
                    .get_filename()
                    .map_or_else(|| Uuid::new_v4().to_string(), sanitize_filename::sanitize);

                filenames.push(filename.clone());
                let filepath = format!("./uploads/{filename}");
        
                let mut f = web::block(|| std::fs::File::create(filepath)).await??;
        
                while let Some(chunk) = field.try_next().await? {
                    f = web::block(move || f.write_all(&chunk).map(|_| f)).await??;
                }
            }       
            Ok(HttpResponse::Ok().json(serde_json::json!({"filenames": filenames})).into()) 
        }
        Err(e) => Ok(HttpResponse::Unauthorized().json(build_error(&e)).into()),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

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

    println!(
        "{}",
        std::env::var("URL").expect("url not found") + "/register?p=" + regpayload.as_str()
    );

    let db_url = std::env::var("DATABASE_URL").expect("db not found");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await
        .expect("DB connection pool ERR");

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    std::fs::create_dir_all("./uploads")?;

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(AppState {
                db: pool.clone(),
                u2f: U2f::new(std::env::var("URL").expect("url not found")),
            }))
            .configure(navigation::services::config)
            .configure(totps::services::config)
            .configure(passwords::services::config)
            .configure(users::services::config)
            .service(index)
            .service(register)
            .service(web::resource("/upload").route(web::post().to(save_file)))
            .service(actix_files::Files::new("/uploads", "./uploads").show_files_listing())
            .service(actix_files::Files::new("/", "./static").show_files_listing())
    })
    .bind_openssl(("127.0.0.1", 8080), builder)?
    .run()
    .await
}
