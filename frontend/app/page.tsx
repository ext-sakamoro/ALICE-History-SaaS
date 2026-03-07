export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a, #1a1000)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "24px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ffffff10",
        }}
      >
        <h2 style={{ margin: 0, color: "#f59e0b" }}>ALICE History</h2>
        <a
          href="/dashboard/console"
          style={{
            color: "#f59e0b",
            textDecoration: "none",
            padding: "8px 20px",
            border: "1px solid #f59e0b",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          Console →
        </a>
      </header>

      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#f59e0b20",
            color: "#f59e0b",
            padding: "4px 16px",
            borderRadius: 20,
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          Immutable Event History
        </div>
        <h1 style={{ fontSize: 52, marginBottom: 16, lineHeight: 1.1 }}>
          Every Event Preserved,<br />Every Moment Queryable
        </h1>
        <p style={{ fontSize: 20, color: "#aaa", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px" }}>
          Append-only event store with temporal queries, point-in-time restore, and tamper-evident audit trails for compliance.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            textAlign: "left",
          }}
        >
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x1F4DC;</div>
            <h3 style={{ margin: "0 0 8px", color: "#f59e0b" }}>Immutable Storage</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Append-only event streams with cryptographic integrity. No record can ever be deleted or modified.
            </p>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x23F1;&#xFE0F;</div>
            <h3 style={{ margin: "0 0 8px", color: "#f59e0b" }}>Temporal Queries</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Query any entity's state at any point in time. Replay history to reconstruct exact past conditions.
            </p>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 12, padding: 28, border: "1px solid #ffffff10" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>&#x1F50D;</div>
            <h3 style={{ margin: "0 0 8px", color: "#f59e0b" }}>Audit Trails</h3>
            <p style={{ color: "#aaa", margin: 0, lineHeight: 1.6 }}>
              Compliance-ready audit logs with actor attribution, IP tracking, and exportable reports.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <a
            href="/dashboard/console"
            style={{
              display: "inline-block",
              background: "#f59e0b",
              color: "#000",
              padding: "14px 36px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Open Console
          </a>
        </div>
      </main>
    </div>
  );
}
