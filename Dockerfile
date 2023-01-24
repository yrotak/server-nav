# syntax=docker/dockerfile:1
FROM rust:server-nav
WORKDIR /app
COPY . .
CMD ["./server-nav-back"]
EXPOSE 8080
