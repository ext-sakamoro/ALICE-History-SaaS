-- ALICE History: Domain-specific tables
CREATE TABLE IF NOT EXISTS entity_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    entropy_hash TEXT NOT NULL,
    data_bytes BIGINT NOT NULL DEFAULT 0,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'restore')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete', 'restore', 'query')),
    actor TEXT NOT NULL,
    ip_address TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS history_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    snapshot_version BIGINT NOT NULL,
    compressed_bytes BIGINT NOT NULL DEFAULT 0,
    compression_ratio DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_versions_user ON entity_versions(user_id);
CREATE INDEX idx_entity_versions_entity ON entity_versions(entity_type, entity_id, version);
CREATE INDEX idx_audit_trails_user ON audit_trails(user_id, created_at);
CREATE INDEX idx_audit_trails_entity ON audit_trails(entity_type, entity_id);
CREATE INDEX idx_history_snapshots_entity ON history_snapshots(entity_type, entity_id);
