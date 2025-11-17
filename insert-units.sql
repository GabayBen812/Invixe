-- Insert additional units for Supabase
-- Run this in your Supabase SQL editor

INSERT INTO "Unit" (index, title, description, created_at) VALUES 
(2, 'Technical Analysis', NULL, NOW()),
(3, 'Long Term Investments', NULL, NOW()),
(4, 'Fundamental Analysis', NULL, NOW())
ON CONFLICT (index) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description;

