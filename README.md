# ALICE-History-SaaS

Immutable event history SaaS with temporal queries, point-in-time restore, and audit trails.

## Architecture

```
Frontend (Next.js :3000)
        |
        v
API Gateway (:8081)
        |
   +----+----+----+
   |    |    |    |
 Store Query Restore Audit
   |    |    |    |
   +----+----+----+
           |
    Append-Only Event Store
    (Cryptographic Integrity)
           |
     Time-Series Index
```

## Features

| Feature | Description |
|---------|-------------|
| Immutable Storage | Append-only streams with cryptographic integrity checks |
| Temporal Queries | Query entity state across any time range |
| Point-in-Time Restore | Reconstruct exact state at any past moment |
| Audit Trails | Actor-attributed, tamper-evident compliance logs |
| Stream Management | Named event streams with entity-scoped partitioning |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/history/store | Append an event to a stream |
| POST | /api/v1/history/query | Query events by stream, entity, time range |
| POST | /api/v1/history/restore | Restore entity state at a point in time |
| POST | /api/v1/history/audit | Generate an audit trail report |
| GET | /api/v1/history/stats | Storage and query throughput stats |

## Quick Start

```bash
docker compose up -d
# API:      http://localhost:8081
# Frontend: http://localhost:3000
```

## License

AGPL-3.0-or-later
