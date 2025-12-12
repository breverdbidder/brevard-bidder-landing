-- BidDeed.AI Session Checkpoints Table
-- Auto-saves Claude session state to resume across conversations
-- Author: Ariel Shapira, Solo Founder, Everest Capital USA

CREATE TABLE IF NOT EXISTS session_checkpoints (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    task_description TEXT NOT NULL,
    state_json JSONB NOT NULL DEFAULT '{}',
    tool_calls_count INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resumed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Index for fast lookup of active checkpoints
CREATE INDEX IF NOT EXISTS idx_checkpoints_status ON session_checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_checkpoints_updated ON session_checkpoints(updated_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_checkpoint_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS checkpoint_timestamp ON session_checkpoints;
CREATE TRIGGER checkpoint_timestamp
    BEFORE UPDATE ON session_checkpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_checkpoint_timestamp();

-- Sample checkpoint for testing
INSERT INTO session_checkpoints (session_id, task_description, state_json, tool_calls_count, priority, status)
VALUES (
    'init_test_checkpoint',
    'System initialization test',
    '{"test": true, "message": "Checkpoint system operational"}',
    1,
    'low',
    'completed'
) ON CONFLICT (session_id) DO NOTHING;
