-- Optional OAuth identity columns (run once in Supabase SQL editor)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS apple_sub TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_user_apple_sub ON "User"(apple_sub);
CREATE INDEX IF NOT EXISTS idx_user_google_sub ON "User"(google_sub);
