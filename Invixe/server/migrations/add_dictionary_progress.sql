-- Migration: Add dictionary progress tracking
-- This table stores which dictionary entries a user has seen/mastered

CREATE TABLE IF NOT EXISTS dictionary_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_id VARCHAR(255) NOT NULL,
    seen BOOLEAN DEFAULT FALSE,
    mastered BOOLEAN DEFAULT FALSE,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mastered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entry_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_dictionary_progress_user_id ON dictionary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dictionary_progress_entry_id ON dictionary_progress(entry_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_dictionary_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF NEW.mastered = TRUE AND OLD.mastered = FALSE THEN
        NEW.mastered_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update timestamps
DROP TRIGGER IF EXISTS dictionary_progress_update_timestamp ON dictionary_progress;
CREATE TRIGGER dictionary_progress_update_timestamp
    BEFORE UPDATE ON dictionary_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_dictionary_progress_timestamp();

-- Comments for documentation
COMMENT ON TABLE dictionary_progress IS 'Tracks user progress for dictionary entries';
COMMENT ON COLUMN dictionary_progress.entry_id IS 'ID of the dictionary entry from the frontend data';
COMMENT ON COLUMN dictionary_progress.seen IS 'Whether the user has viewed this entry';
COMMENT ON COLUMN dictionary_progress.mastered IS 'Whether the user has mastered this entry';
