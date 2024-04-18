FROM rust:latest as builder

RUN apt-get update
RUN apt-get install -y openssl libssl-dev musl-tools pkg-config make g++ librust-openssl-sys-dev libudev-dev
RUN rustup target add x86_64-unknown-linux-musl

WORKDIR /wd
COPY . /wd

#ENV OPENSSL_DIR=/usr/local/ssl
RUN RUSTFLAGS=-Clinker=musl-gcc && cargo build --release --target x86_64-unknown-linux-musl

FROM scratch

COPY --from=builder /wd/static /static
COPY --from=builder /wd/.env /.env
COPY --from=builder /wd/cert.pem /cert.pem
COPY --from=builder /wd/key.pem /key.pem
COPY --from=builder /wd/target/x86_64-unknown-linux-musl/release/server-nav /

EXPOSE 8080


CMD [ "./server-nav" ]