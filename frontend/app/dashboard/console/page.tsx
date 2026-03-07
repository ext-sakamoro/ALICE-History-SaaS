"use client";
import { useState } from "react";

type Tab = "store" | "query" | "restore" | "audit" | "stats";

const DEFAULTS: Record<Tab, string> = {
  store: JSON.stringify({
    stream: "orders",
    event_type: "order.created",
    entity_id: "ord-001",
    payload: { amount: 99.99, currency: "USD", items: ["sku-1", "sku-2"] },
    metadata: { user_id: "u-123", ip: "192.168.1.1" }
  }, null, 2),
  query: JSON.stringify({
    stream: "orders",
    entity_id: "ord-001",
    from_ts: "2024-01-01T00:00:00Z",
    to_ts: "2024-12-31T23:59:59Z",
    event_types: ["order.created", "order.updated"],
    limit: 50
  }, null, 2),
  restore: JSON.stringify({
    stream: "orders",
    entity_id: "ord-001",
    point_in_time: "2024-06-15T12:00:00Z",
    include_metadata: true
  }, null, 2),
  audit: JSON.stringify({
    stream: "orders",
    from_ts: "2024-01-01T00:00:00Z",
    to_ts: "2024-12-31T23:59:59Z",
    actor_id: "u-123",
    action_types: ["order.created", "order.cancelled"],
    format: "json"
  }, null, 2),
  stats: "",
};

const TAB_LABELS: Record<Tab, string> = {
  store: "POST /store",
  query: "POST /query",
  restore: "POST /restore",
  audit: "POST /audit",
  stats: "GET /stats",
};

const GET_TABS: Tab[] = ["stats"];

const ROUTES: Record<Tab, string> = {
  store: "/api/v1/history/store",
  query: "/api/v1/history/query",
  restore: "/api/v1/history/restore",
  audit: "/api/v1/history/audit",
  stats: "/api/v1/history/stats",
};

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState<Tab>("store");
  const [input, setInput] = useState(DEFAULTS["store"]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:8081";

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setInput(DEFAULTS[tab]);
    setResponse("");
  };

  const send = async () => {
    setLoading(true);
    try {
      const isGet = GET_TABS.includes(activeTab);
      const res = await fetch(`${API}${ROUTES[activeTab]}`, {
        method: isGet ? "GET" : "POST",
        headers: isGet ? {} : { "Content-Type": "application/json" },
        body: isGet ? undefined : input,
      });
      setResponse(JSON.stringify(await res.json(), null, 2));
    } catch (e: unknown) {
      setResponse(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ marginBottom: 4 }}>ALICE History-SaaS — Console</h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Immutable event history and audit trail API tester</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: activeTab === tab ? "#f59e0b" : "#333",
              background: activeTab === tab ? "#f59e0b20" : "#111",
              color: activeTab === tab ? "#f59e0b" : "#888",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {!GET_TABS.includes(activeTab) && (
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 13,
            background: "#111",
            color: "#e0e0e0",
            border: "1px solid #333",
            borderRadius: 8,
            padding: 12,
            boxSizing: "border-box",
          }}
        />
      )}

      {GET_TABS.includes(activeTab) && (
        <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>
          No request body required for GET requests.
        </div>
      )}

      <button
        onClick={send}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 28px",
          background: loading ? "#333" : "#f59e0b",
          color: loading ? "#666" : "#000",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        {loading ? "Sending..." : "Send"}
      </button>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          marginTop: 16,
          minHeight: 200,
          overflow: "auto",
          borderRadius: 8,
          border: "1px solid #222",
          fontSize: 13,
        }}
      >
        {response || "// Response will appear here"}
      </pre>
    </div>
  );
}
