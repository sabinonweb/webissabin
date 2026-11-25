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

## SQL Design Choice

```rust

    // search.rs 
    use axum::{extract::{Query, State}, Json,};
    use sqlx::PgPool;
    use crate::types::{SearchHit, SearchParams};

    pub async fn search(
        State(pool): State<PgPool>,
        Query(params): Query<SearchParams>,
    ) -> Json<Vec<SearchHit>> {
        let hits = sqlx::query_as(
            "SELECT idx, title, service_type, search_order FROM nodes WHERE title ILIKE $1 AND is_obsolete IS NOT TRUE ORDER BY search_order;",
        )
            .bind(format!("%{}%", params.q))
            .fetch_all(&pool)
            .await
            .unwrap();
        Json(hits)
    }

```

Instead of this:

```rust 

    let sql = format!(
        "SELECT idx, title FROM nodes WHERE title ILIKE '%{}%'",
        params.q
    );
    sqlx::query(&sql).fetch_all(&pool).await

```
If we use this and if user sends `x'; DROP TABLE nodes; --'` then it deletes the nodes table, which is SQL injection. -- comments out the rest and user's ' closes the quote. The query becomes `SELECT idx, title FROM nodes WHERE title ILIKE '%x'; DROP TABLE nodes; --%'.

But if we write it:

```rust 

    sqlx::query_as("SELECT idx, title FROM nodes WHERE title ILIKE $1")
        .bind(format!("%{}%", params.q))

```

Postgres receives query and value. It first parses the query and then plugs in the value, which it receives not as a query but as a string to compare. Postgres searches for columns with `x'; DROP TABLE nodes; --` literal value.

#### The Solution 
The solution is using a `PgPool`. It is a manager not a waiter. It points to a pool of `PgConnection`, so it can be cloned. It provides one `PgConnection` to one query so only one query gets one &mut use of one connection. The waiting time is only for the (N+1)th query and only until a connection returns.
When multiple connections access the same database:
- if the rows are different, it makes changes to two rows in parallel
- if the rows are same then, database locks the row until the first transaction finishes.

## Dockerfile 

```Dockerfile
    
    FROM rust:1.99 
    WORKDIR /app 
    COPY . . 
    RUN cargo build --release 
    ENTRYPOINT ["./target/release/teletest"]

```

- FROM rust:1.99 -> Start from a rust image 
- WORKDIR /app -> create an app directory and cds into the /app
- COPY . . -> copy the project into the /app excluding the files in .dockerignore
- RUN cargo build --release  -> run this while building image 
- ENTRYPOINT ["./target/release/teletest"] -> it runs every time a new container runs

Now `docker build -t teletest .`. `-t` gives a tag to the image, without it we would have to copy paste the id everytime. Docker looks for Dockerfile in directory `.`.

We then run `docker run -p 3000:3000 teletest` which redirects every request on `localhost:3000` to the port `3000` of the container. But this command fails with:

```shell
    
    hread 'main' (1) panicked at src/main.rs:12:10:
    Failed to connect to database: PoolTimedOut
    note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

    What's next:
        Debug this container error with Gordon → docker ai "help me fix this container error"


```

Not immediately but after a while. This happens because the app tries to connet to postgres at `127.0.0.1:5432` which is a loopback address i.e. it can listen to connections only inside the machine it is running in. The postgres is running inside my computer not in the container, so it cannot connect to the postgres. The connection is refused, sqlx keeps retrying until the pool's 30-second timeout, then panics with PoolTimedOut. So, the solution is `0.0.0.0`.

The solution is to use name the host in database settings as host.docker.internal which points to the machine the container is running on. Similarly, loopback address accepts connections from its own machine only but using `0.0.0.0` accepts connections from any network interface.

## Test Result 
`curl -i "http://localhost:3000/search?q=%25"` gives out even electricity. `%` means match everything. Eg: `%pay` anything + pay, `pay%` pay + anything and `%pay%` anything + pay + anything. 25 in hex is 37 which in ASCII is `%`. `format!("%{}%", params.q)` converts it to `%%%`. So, it mactches all the titles.

## Telemetry 
Telemetry data is information about the running application collected automatically, used to inspect the state of the appliation. 

Observability is about asking arbitrary questions without having to know what to ask in the first place. We look at the logs, look at the logs and find out the problem. 

Logger is a middleware that captures every incoming reqeuest in the server. And instrumentation is the act of inserting the log statements in the application. It is done by the log crate. It doesn't print the log to the terminal or to the file itself. Rather, log stores a pointer to the backend which processes the log. 

### Problem with log 
Log is isolated but a request is a tree: `request -> search -> DB query`. If we add request_id to each request then we can solve it to a certain exent but what about the code which is not in our control: like `sqlx`, `axum`. Passing request_id to downstream functions is not a great and sustainable idea. 

### Tracing
Tracing has spans which can be entered and exited by a particular request. But the problem here is, in rust async functions can't run in one go. An async function might enter the span and it's span is read from the thread. Only dropping the guard(going out of scope) resets the span. But in this case when an async function is awaiting, it is removed from a thread, and the new async function reads the same old span and uses it as a parent. 

```rust

    async fn search_broken(q: &'static str, db_ms: u64) {
        let span = info_span!("search", q);
        let _guard = span.enter();
        info!("searching");
        tokio::time::sleep(Duration::from_millis(db_ms)).await; // pretend DB query
        info!("found results");
    }

```

```shell

    2026-11-25T08:24:03.333400Z  INFO span_demo: ===== BROKEN =====
    2026-11-25T08:24:03.333478Z  INFO search{q="pay"}: span_demo: searching
    2026-11-25T08:24:03.333506Z  INFO search{q="pay"}:search{q="topup"}: span_demo: searching
    2026-11-25T08:24:03.436032Z  INFO search{q="pay"}:search{q="topup"}: span_demo: found results
    2026-11-25T08:24:03.535063Z  INFO search{q="pay"}: span_demo: found results


```

.instrument(span) attaches the span to the future instead of the thread. Every time the executor polls the future, the span is entered; every time the future pauses at an .await, the span is exited. So the span can be entered and exited many times, and it closes once when the future completes. Because it travels with the future, it stays correct even if the future resumes on a different thread.

```rust 

    async fn search_fixed(q: &'static str, db_ms: u64) {
        let span = info_span!("search", q);
        async move {
            info!("searching");
            tokio::time::sleep(Duration::from_millis(db_ms)).await; // pretend DB query
            info!("found results");
        }
        .instrument(span)
        .await
    }

```

```shell
    
    2026-11-25T08:24:03.535202Z  INFO span_demo: ===== FIXED =====
    2026-11-25T08:24:03.535251Z  INFO search{q="pay"}: span_demo: searching
    2026-11-25T08:24:03.535303Z  INFO search{q="topup"}: span_demo: searching
    2026-11-25T08:24:03.637792Z  INFO search{q="topup"}: span_demo: found results
    2026-11-25T08:24:03.737158Z  INFO search{q="pay"}: span_demo: found results

```

### Log
```shell

    log::info!("search for {} found {} results in {}ms", q, n, ms);
    ELK receives one string:
    search for electricity found 0 results in 42ms
    search for top up found 5 results in 31ms
    search for ncell found 0 results in 28ms

```

If I want searches that resulted in zero searches, a regex needs to be written. 

### Tracer 
```shell
    
    tracing::info!(query = %q, results = n, duration_ms = ms, "search done");
    ELK receives separate, named values (with the JSON formatter):
    {"msg":"search done", "query":"electricity", "results":0, "duration_ms":42}
    {"msg":"search done", "query":"top up",      "results":5, "duration_ms":31}
    {"msg":"search done", "query":"ncell",       "results":0, "duration_ms":28}

```

But in tracing everything is stored as a key-value pair and not using String interpolation. After string interpolation, q and results stop becoming separate values and are merged. 

## Subscriber

```rust

    let span = info_span!("search", q = "pay");
    info!("found s");

```

It logs:

```shell
    
    INFO search{q = "pay"}: found s

```

How does `INFO search{q = "pay"}` appear in the log even when it is not in `found s`. It is because Subscriber stores the span context when it is created. 
But different use cases might differ the way we want to use it. Someone might just want text, another might want json, another person might want a trace level of info and so forth. So, for that reason, the four jobs of Subscriber trait(what the receiver must be able to do):
- store span context
- filter 
- format(text/json)
- output

Registry is a struct which implements Subscriber trait but only stores the span context(bookkeeping). 
Layer is a trait which allows for composable processing on top of Registry. It reads Registry's data, adds focused behavior, and allows us to create processing pipeline for span data. 

tracing gives macros that announce spans and events. App installs a subscriber into the global dispatcher which listens to those events. Every macro call looks it up there and hands it the span or the event. Registry stores the span context and Layer filters, formats and prints them.

```rust 

    use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

    pub fn init_tracing() {
        let filter = EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| EnvFilter::new("info"));

        Registry::default()
            .with(filter)
            .with(fmt::layer())
            .init();
    }

```

The two new imports, SubscriberExt and SubscriberInitExt, are extension traits. They're what add the .with() and .init() methods to Registry. Without them in scope, the compiler says the methods don't exist.
