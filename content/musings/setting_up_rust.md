---
title: "Setting up Rust"
date: 2026-11-24
description: ""
tags: ["essays"]
back: true
---

```rust 

    use axum::{http::StatusCode, response::IntoResponse, routing::get, Router};
    use tokio::net::TcpListener;

    #[tokio::main]
    async fn main() {
        let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
        let app = Router::new().route("/health_check", get(health));
        axum::serve::serve(listener, app).await.unwrap();
    }

    async fn health() -> impl IntoResponse {
        StatusCode::OK
    }

```

If two tests run this same code, then there is port conflict. So, we add `0` instead of `3000`. OS assigns a random port everytime. But a new problem is we don't know what is the port that OS assigned to it.  

```rust 

    use axum::{http::StatusCode, response::IntoResponse, routing::get, Router};
    use tokio::net::TcpListener;

    #[tokio::main]
    async fn main() {
        let listener = TcpListener::bind("0.0.0.0:0").await.unwrap();
        println!("Address: {:?}", listener.local_addr());
        let app = Router::new().route("/health_check", get(health));
        axum::serve::serve(listener, app).await.unwrap();
    }

    async fn health() -> impl IntoResponse {
        StatusCode::OK
    }

```

`.local_addr()` gives `Result<SocketAddr>`. We wanna move this code as a `run()` function inside `lib.rs`. Why? Because `main` code is compiled to a binary and each test runs as a separate crate and can only access library. To allow tests to access this code, we move it to `lib`. 

### Which are the lines of codes that we move?
```rust

    let app = Router::new().route("/health_check", get(health));
    axum::serve::serve(listener, app).await.unwrap();


```

`Why is listener not being moved?` There is a pretty simple answer to this: Dependency Injection(giving control to the caller). If the listener is kept at run, the port address is stuck there. In production, if a new port is created after every restart, then client can't find it but tests need different ports each time. That's why run() takes an already-bound listener: whoever calls it (main with port 3000, or a test with port 0) stays in control of the address.

So, the new `lib.rs` is:

```rust 

    use axum::{routing::get, Router};
    use tokio::net::TcpListener;

    use crate::health::health;

    pub mod health;
    pub mod types;

    pub async fn run(listener: TcpListener) {
        let app = Router::new().route("/health_check", get(health));
        axum::serve::serve(listener, app).await.unwrap();
    }

```

```rust 

    use teletest::run;
    use tokio::net::TcpListener;

    #[tokio::main]
    async fn main() {
        let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
        println!("Address: {:?}", listener.local_addr());
        run(listener).await;
    }

```

We have to use `teletest` and not `crate` because cargo treats `lib` as a separate crate and `main` has to call `teletest`. But modules like `health` can use `crate` because they fall in the same crate.

## Test 
We wrote our first test.
```rust 

    use reqwest::StatusCode;
    use teletest::run;
    use tokio::net::TcpListener;

    #[tokio::test]
    async fn test_health_check() {
        let client = reqwest::Client::new();
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let address = format!("http://{}", address);
        run(listener).await;
        let response = client
            .get(format!("{}/health_check", address))
            .send()
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK)
    }

```

But this hangs because the `run` function runs in the main thread blocking until it returns which it doesn't because server is eternally listening. The solution is to run it as a background task in a single thread and runs concurrently with main task.

```rust 

    use reqwest::StatusCode;
    use teletest::run;
    use tokio::net::TcpListener;

    #[tokio::test]
    async fn test_health_check() {
        let client = reqwest::Client::new();
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let address = format!("http://{}", address);
        
        tokio::spawn(async move {
            run(listener).await;
        });

        let response = client
            .get(format!("{}/health_check", address))
            .send()
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK)
    }

```

## A little refactor 
```rust 

    use reqwest::StatusCode;
    use teletest::run;
    use tokio::net::TcpListener;

    async fn spawn_app() -> String {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let address = format!("http://{}", address);
        println!("address: {}", address);

        tokio::spawn(async move {
            run(listener).await;
        });

        address
    }

    #[tokio::test]
    async fn test_health_check_status() {
        let address = spawn_app().await;
        let client = reqwest::Client::new();

        let response = client
            .get(format!("{}/health_check", address))
            .send()
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK)
    }

    #[tokio::test]
    async fn test_health_check_content_length() {
        let address = spawn_app().await;
        let client = reqwest::Client::new();
        let response = client
            .get(format!("{}/health_check", address))
            .send()
            .await
            .unwrap();

        assert_eq!(response.content_length(), Some(0));
    }

```

## Configurations 
To manage configurations, we create a file `configurations.rs`.

```rust 

    #[derive(Clone, Debug)]
    pub struct Application {
        host: String,

        port: u16,
    }

    #[derive(Clone, Debug)]
    pub struct DatabaseSettings {
        user: String,

        password: Option<String>,

        host: String,

        port: u16,

        db_name: String,
    }

```

Password can be empty so we are using `Option`. Ports are expressed in 16-bits with possible values from `0 to 65,535` and a `int` type to represent that range is `u16`.
For passwords, we use `secrecy` crate because when the passwords are logged it doesn't print the actual value. On top of that to use it we need to use `expose_secret()` function and once it goes out of scope, SecretString is wiped off of memory. 

### Why does config live in a YAML file instead of being hard-coded in main.rs, and why does the DB config use separate fields instead of one URL?
If the host and port are hardcoded then in prod they can only deploy it in one machine. To run it on  a different machine, we would have to change it again.

DB's name would be changed for different tests for different requirements. This can cause flaky tests which can be solved by giving each database its own name.

```shell

    A and B share one database. A inserts "Pay Bills", and B inserts "Payout Help". Then A searches for pay.

    How many rows does A get back: 1 or 2? -> 2. 
    And on another run, if B happens to insert after A searches, A gets 1 and passes.

    Same code, different result each run. That's a flaky test: it passes or fails depending on timing.

```

## Database 
For connecting to database:

```rust 

    // configutation.rs 
    impl DatabaseSettings {
        pub fn connect_options(&self) -> PgConnectOptions {
            let options = PgConnectOptions::new()
                .username(&self.user)
                .host(&self.host)
                .port(self.port) 
                .database(&self.db_name);

            match &self.password {
                Some(p) => options.password(p.expose_secret()),
                None => options,
            }
        }
    }

```

```rust

    // lib.rs 
    
    let app = Router::new().route("/health_check", get(health));
    axum::serve::serve(listener, app)
        .await
        .unwrap()
        .with_state(connection);

```

```rust 
    
    // main.rs 
    let connection = PgConnection::connect_with(&settings.database.conne        ct_options())
        .await
        .expect("Failed to connect to database");
    run(listener, connection).await;

```

When we compile this:

```shell
    
    error[E0277]: the trait bound `PgConnection: Clone` is not satisfied
       --> src/lib.rs:12:15
        |
     12 |     let app = Router::new()
        |               ^^^^^^^^^^^^^ the trait `Clone` is not implemented for `PgConnection`


```

It is because, axum gives a connection to each handler and it cannot be cloned because it is a TcpConnection underneath. We can use `Arc` but each handler needs a `&mut PgConnnection` and `Arc` doesn't give that. `Mutex` would create a long waiting time: when a query is running, we cannot run any other query until it finishes. 

#### The Solution 
The solution is using a `PgPool`. It is a manager not a waiter. It points to a pool of `PgConnection`, so it can be cloned. It provides one `PgConnection` to one query so only one query gets one &mut use of one connection. The waiting time is only for the (N+1)th query and only until a connection returns.
When multiple connections access the same database:
- if the rows are different, it makes changes to two rows in parallel
- if the rows are same then, database locks the row until the first transaction finishes.
