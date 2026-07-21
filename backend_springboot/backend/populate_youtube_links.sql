-- Populates youtube_link for the 10 predefined exercises seeded by
-- seed_predefined_data.sql (ids 1-10 are currently NULL in Supabase).
-- Run this in the Supabase SQL editor.
--
-- All links are real ATHLEAN-X form-tutorial videos, found via web search
-- and verified against actual search results (not guessed from memory).

BEGIN;

UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=vthMCtgVtFw' WHERE id = 1 AND name = 'Bench Press';       -- The Official Bench Press Check List (AVOID MISTAKES!)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=awEEyL5zGvU' WHERE id = 2 AND name = 'Incline DB Press';  -- How To PROPERLY Dumbbell Incline Press Like A Pro | 3 Common Mistakes
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=Gu1t7X2yq4M' WHERE id = 3 AND name = 'Overhead Press';    -- Overhead Shoulder Press (3 MISTAKES!)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=6yp_-GcB4ew' WHERE id = 4 AND name = 'Tricep Pushdown';   -- MAX GAINS SERIES: Triceps Pushdowns
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=qaJhYsCkX2s' WHERE id = 5 AND name = 'Lat Pulldown';     -- Do Lat Pulldowns Like This Instead (BETTER LATS GAINS!)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=T3N-TO4reLQ' WHERE id = 6 AND name = 'Barbell Row';      -- The Truth about Barbell Rows (AVOID MISTAKES!)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=7BkgqzC6WsM' WHERE id = 7 AND name = 'Seated Cable Row'; -- How to PROPERLY Seated Cable Row (DO THIS NOW)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=KS-1_r9K4XA' WHERE id = 8 AND name = 'Bicep Curl';       -- Proper Form Bicep Curls | Athlean-X
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=nEQQle9-0NA' WHERE id = 9 AND name = 'Squat';            -- How to Squat Properly (MAJOR FORM FIX!)
UPDATE exercise SET youtube_link = 'https://www.youtube.com/watch?v=CHPHn-OnTqE' WHERE id = 10 AND name = 'Leg Press';       -- How to PROPERLY Leg Press | 3 Leg Press Variations for Muscle Gain

COMMIT;
