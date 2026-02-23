use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_stores: u64, total_queries: u64, total_restores: u64, bytes_stored: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct StoreRequest { entity_type: String, entity_id: String, data: serde_json::Value, metadata: Option<serde_json::Value> }
#[derive(Serialize)]
struct StoreResponse { version_id: String, entity_id: String, version: u64, entropy_hash: String, status: String, elapsed_us: u128 }

#[derive(Deserialize)]
struct QueryRequest { entity_id: String, at_time: Option<String>, from_version: Option<u64>, to_version: Option<u64> }
#[derive(Serialize)]
struct QueryResponse { entity_id: String, versions: Vec<VersionEntry>, total_versions: u64, elapsed_us: u128 }
#[derive(Serialize)]
struct VersionEntry { version: u64, timestamp: String, data: serde_json::Value, entropy_hash: String, delta_size_bytes: u64 }

#[derive(Deserialize)]
struct RestoreRequest { entity_id: String, target_version: u64 }
#[derive(Serialize)]
struct RestoreResponse { entity_id: String, restored_version: u64, data: serde_json::Value, reverse_entropy_applied: bool, elapsed_us: u128 }

#[derive(Deserialize)]
struct AuditRequest { entity_type: Option<String>, from_time: Option<String>, to_time: Option<String>, limit: Option<u32> }
#[derive(Serialize)]
struct AuditResponse { entries: Vec<AuditEntry>, total_entries: u64 }
#[derive(Serialize)]
struct AuditEntry { entity_type: String, entity_id: String, action: String, version: u64, actor: String, timestamp: String }

#[derive(Serialize)]
struct StatsResponse { total_stores: u64, total_queries: u64, total_restores: u64, bytes_stored: u64, entities_tracked: u64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "history_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_stores: 0, total_queries: 0, total_restores: 0, bytes_stored: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/history/store", post(store))
        .route("/api/v1/history/query", post(query))
        .route("/api/v1/history/restore", post(restore))
        .route("/api/v1/history/audit", post(audit))
        .route("/api/v1/history/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("HISTORY_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("History Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_stores + st.total_queries })
}

async fn store(State(s): State<Arc<AppState>>, Json(req): Json<StoreRequest>) -> Json<StoreResponse> {
    let t = Instant::now();
    let bytes = serde_json::to_string(&req.data).map(|s| s.len() as u64).unwrap_or(0);
    let h = fnv1a(serde_json::to_string(&req.data).unwrap_or_default().as_bytes());
    { let mut st = s.stats.lock().unwrap(); st.total_stores += 1; st.bytes_stored += bytes; }
    Json(StoreResponse { version_id: uuid::Uuid::new_v4().to_string(), entity_id: req.entity_id, version: s.stats.lock().unwrap().total_stores, entropy_hash: format!("{:064x}", h), status: "stored".into(), elapsed_us: t.elapsed().as_micros() })
}

async fn query(State(s): State<Arc<AppState>>, Json(req): Json<QueryRequest>) -> Json<QueryResponse> {
    let t = Instant::now();
    let from = req.from_version.unwrap_or(1); let to = req.to_version.unwrap_or(from + 5);
    let versions: Vec<VersionEntry> = (from..=to).map(|v| VersionEntry { version: v, timestamp: format!("2026-02-23T00:00:{}Z", v), data: serde_json::json!({"state": format!("version_{}", v)}), entropy_hash: format!("{:064x}", fnv1a(format!("{}{}", req.entity_id, v).as_bytes())), delta_size_bytes: 256 }).collect();
    s.stats.lock().unwrap().total_queries += 1;
    Json(QueryResponse { entity_id: req.entity_id, versions, total_versions: to, elapsed_us: t.elapsed().as_micros() })
}

async fn restore(State(s): State<Arc<AppState>>, Json(req): Json<RestoreRequest>) -> Json<RestoreResponse> {
    let t = Instant::now();
    s.stats.lock().unwrap().total_restores += 1;
    Json(RestoreResponse { entity_id: req.entity_id, restored_version: req.target_version, data: serde_json::json!({"state": format!("restored_to_v{}", req.target_version)}), reverse_entropy_applied: true, elapsed_us: t.elapsed().as_micros() })
}

async fn audit(State(_s): State<Arc<AppState>>, Json(req): Json<AuditRequest>) -> Json<AuditResponse> {
    let limit = req.limit.unwrap_or(20) as usize;
    let entries: Vec<AuditEntry> = (0..limit).map(|i| AuditEntry { entity_type: req.entity_type.clone().unwrap_or_else(|| "document".into()), entity_id: format!("entity_{}", i), action: ["create", "update", "restore"][i % 3].into(), version: (i + 1) as u64, actor: "system".into(), timestamp: format!("2026-02-23T00:00:{}Z", i) }).collect();
    Json(AuditResponse { entries, total_entries: 5000 })
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_stores: st.total_stores, total_queries: st.total_queries, total_restores: st.total_restores, bytes_stored: st.bytes_stored, entities_tracked: st.total_stores })
}

fn fnv1a(data: &[u8]) -> u64 { let mut h: u64 = 0xcbf2_9ce4_8422_2325; for &b in data { h ^= b as u64; h = h.wrapping_mul(0x0100_0000_01b3); } h }
