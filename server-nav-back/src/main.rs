use std::io::Error;


mod users;
mod navigation;
mod passwords;
mod totps;

mod utils;

use actix_files::NamedFile;
use actix_web::{get, post, web, web::Data, App, HttpResponse, HttpServer, Responder};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use rand::distributions::{Alphanumeric, DistString};
use sqlx::postgres::PgPoolOptions;
use u2f::protocol::*;
use users::models::RegisterTokenData;
use utils::utils::AppState;

#[get("/")]
async fn index() -> Result<NamedFile, Error> {
    NamedFile::open("./static/index.html")
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

    println!("{}", std::env::var("URL").expect("url not found") + "/register?p=" + regpayload.as_str());

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
            .service(actix_files::Files::new("/", "./static").show_files_listing())
    })
    .bind_openssl(("127.0.0.1", 8080), builder)?
    .run()
    .await
}
