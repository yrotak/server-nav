use std::io::Error;

use actix_files::NamedFile;
use actix_web::{get, post, web, web::Data, App, HttpResponse, HttpServer, Responder};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};
use sqlx::postgres::PgPoolOptions;
use u2f::messages::*;
use u2f::protocol::*;
use u2f::register::*;
mod users;
use users::models::AppState;

#[get("/")]
async fn index() -> Result<NamedFile, Error> {
    NamedFile::open("./static/index.html")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

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
            .configure(users::services::config)
            .service(index)
            .service(actix_files::Files::new("/", "./static").show_files_listing())
    })
    .bind_openssl(("127.0.0.1", 8080), builder)?
    .run()
    .await
}
