-- Check what lessons exist to find a suitable parent or understand the structure

-- 1. List all lessons with their codes
SELECT id, code, title, parentlessonid, type 
FROM "Lesson" 
ORDER BY code;

-- 2. Check if there are any lessons with code 301 (maybe that's the sublesson we created before?)
SELECT id, code, title, parentlessonid 
FROM "Lesson" 
WHERE code IN (301, 302, 3);

-- 3. Check if there are lessons with parentlessonid (sublessons)
SELECT id, code, title, parentlessonid 
FROM "Lesson" 
WHERE parentlessonid IS NOT NULL;

