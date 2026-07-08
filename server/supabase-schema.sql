-- Supabase Schema for Invixe App
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT NOT NULL,
  agegroup TEXT,
  goal TEXT,
  coins INTEGER DEFAULT 0,
  lightnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units table (for organizing lessons)
CREATE TABLE IF NOT EXISTS "Unit" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  index INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS "Lesson" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unitid UUID REFERENCES "Unit"(id),
  code INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  prerequisites INTEGER[] DEFAULT '{}',
  unlockminpoints INTEGER,
  parentlessonid UUID REFERENCES "Lesson"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson steps table (for lesson content)
CREATE TABLE IF NOT EXISTS "LessonStepsV2" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lessonid UUID REFERENCES "Lesson"(id) UNIQUE NOT NULL,
  steps JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table
CREATE TABLE IF NOT EXISTS "Progress" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid UUID REFERENCES "User"(id) NOT NULL,
  lessonid TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson attempts table
CREATE TABLE IF NOT EXISTS "LessonAttempt" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid UUID REFERENCES "User"(id) NOT NULL,
  lessonid TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  lastattempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS "Portfolio" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid UUID REFERENCES "User"(id) NOT NULL,
  symbol TEXT NOT NULL,
  shares DECIMAL NOT NULL,
  avgprice DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_lesson_code ON "Lesson"(code);
CREATE INDEX IF NOT EXISTS idx_lesson_unitid ON "Lesson"(unitid);
CREATE INDEX IF NOT EXISTS idx_progress_userid ON "Progress"(userid);
CREATE INDEX IF NOT EXISTS idx_lesson_attempt_userid ON "LessonAttempt"(userid);
CREATE INDEX IF NOT EXISTS idx_portfolio_userid ON "Portfolio"(userid);
CREATE INDEX IF NOT EXISTS idx_unit_index ON "Unit"(index);

-- Trade history
CREATE TABLE IF NOT EXISTS "TradeHistory" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userid UUID REFERENCES "User"(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  symbol TEXT NOT NULL,
  shares INTEGER NOT NULL CHECK (shares > 0),
  price DECIMAL NOT NULL CHECK (price > 0),
  total DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_history_userid_created
  ON "TradeHistory"(userid, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonStepsV2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradeHistory" ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON "User" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "Unit" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "Lesson" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "LessonStepsV2" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "Progress" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "LessonAttempt" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "Portfolio" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "TradeHistory" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "TradeHistory" FOR INSERT WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO "Unit" (index, title, description) VALUES 
(1, 'מבוא להשקעות', 'שיעורי מבוא לעולם ההשקעות'),
(2, 'מניות', 'לימוד על מניות והשקעות במניות')
ON CONFLICT (index) DO NOTHING;

-- Insert sample lessons for step 2
INSERT INTO "Lesson" (unitid, code, title, description, type) 
SELECT 
  u.id,
  lesson_data.code,
  lesson_data.title,
  lesson_data.description,
  lesson_data.type
FROM "Unit" u,
(VALUES 
  (5, 'מבוא להשקעות במניות', 'הכרות עם עולם ההשקעות והמניות - הבסיס לכל המשך הלמידה', 'info'),
  (6, 'מהי מניה?', 'הבנת המושג מניה וכיצד היא עובדת', 'info'),
  (7, 'סוגי מניות', 'מניות רגילות, מועדפות ועוד', 'memorize'),
  (8, 'בחירת מניות - יסודות', 'איך לבחור מניות טובות להשקעה', 'info'),
  (9, 'סימולציית קנייה', 'תרגל קניית מניות במשחק סימולציה', 'practice')
) AS lesson_data(code, title, description, type)
WHERE u.index = 2
ON CONFLICT (code) DO NOTHING;
