-- Dummy data for user_id = 1 (testuser1@gmail.com), covering every table
-- touched by workout logging + personal records:
--   workout_entry, workout_entry_exercise, workout_entry_set,
--   personal_record, personal_record_history
--
-- Story: 5 Push Workout sessions over ~70 days with Bench Press climbing
-- 60kg -> 80kg and Overhead Press climbing 35kg -> 42kg (one session repeats
-- the same OHP weight, on purpose, to prove "no PR" sets don't create a
-- history row). Plus one Leg Workout session and one Chest and Bicep
-- session for variety. Reps deliberately drift down as weight climbs (a
-- realistic top-set pattern) so weight and volume (weight x reps) produce
-- genuinely different-shaped charts, not just the same line rescaled.
-- IDs continue on from whatever's already in the DB (checked before writing
-- this) - if you've added more data since, bump the starting IDs below and
-- the final setval() calls to match.

BEGIN;

-- Clear leftover junk test data for (user 1, Bench Press) from earlier in
-- this project - a stray 10kg/20kg PR dated "yesterday" would otherwise sort
-- as more recent than this script's realistic 60->80kg story, making the
-- timeline look like it climbed to 80kg then crashed back down to 20kg.
DELETE FROM personal_record_history WHERE user_id = 1 AND exercise_id = 1;
DELETE FROM personal_record WHERE user_id = 1 AND exercise_id = 1;

-- workout_entry: id, started_at, completed_at, user_id, workout_id
-- workout_id 1 = Push Workout, 3 = Leg Workout, 7 = Chest and Bicep
INSERT INTO workout_entry (id, started_at, completed_at, user_id, workout_id) VALUES
(19, NOW() - INTERVAL '70 days' - INTERVAL '45 minutes', NOW() - INTERVAL '70 days', 1, 1),
(20, NOW() - INTERVAL '50 days' - INTERVAL '45 minutes', NOW() - INTERVAL '50 days', 1, 1),
(21, NOW() - INTERVAL '30 days' - INTERVAL '45 minutes', NOW() - INTERVAL '30 days', 1, 1),
(22, NOW() - INTERVAL '20 days' - INTERVAL '50 minutes', NOW() - INTERVAL '20 days', 1, 3),
(23, NOW() - INTERVAL '12 days' - INTERVAL '45 minutes', NOW() - INTERVAL '12 days', 1, 1),
(24, NOW() - INTERVAL '8 days'  - INTERVAL '30 minutes', NOW() - INTERVAL '8 days',  1, 7),
(25, NOW() - INTERVAL '3 days'  - INTERVAL '45 minutes', NOW() - INTERVAL '3 days',  1, 1);

-- workout_entry_exercise: id, workout_entry_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, rest_seconds
-- exercise_id: 1=Bench Press, 3=Overhead Press, 8=Bicep Curl, 9=Squat, 10=Leg Press
INSERT INTO workout_entry_exercise (id, workout_entry_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, rest_seconds) VALUES
(79, 19, 1, 1, 3, 8, 60, 180),
(80, 19, 3, 2, 3, 10, 35, 120),
(81, 20, 1, 1, 3, 6, 65, 180),
(82, 20, 3, 2, 3, 10, 35, 120),
(83, 21, 1, 1, 3, 6, 70, 180),
(84, 21, 3, 2, 3, 8, 38, 120),
(85, 22, 9, 1, 3, 5, 100, 180),
(86, 22, 10, 2, 3, 8, 140, 150),
(87, 23, 1, 1, 3, 5, 75, 180),
(88, 23, 3, 2, 3, 6, 40, 120),
(89, 24, 8, 1, 3, 10, 22, 90),
(90, 25, 1, 1, 3, 5, 80, 180),
(91, 25, 3, 2, 3, 5, 42, 120);

-- workout_entry_set: id, workout_entry_exercise_id, set_index, weight, reps, completed, completed_at
-- 3 completed sets per exercise, matching the target weight/reps above
INSERT INTO workout_entry_set (id, workout_entry_exercise_id, set_index, weight, reps, completed, completed_at) VALUES
(230, 79, 1, 60, 8, true, NOW() - INTERVAL '70 days'), (231, 79, 2, 60, 8, true, NOW() - INTERVAL '70 days'), (232, 79, 3, 60, 8, true, NOW() - INTERVAL '70 days'),
(233, 80, 1, 35, 10, true, NOW() - INTERVAL '70 days'), (234, 80, 2, 35, 10, true, NOW() - INTERVAL '70 days'), (235, 80, 3, 35, 10, true, NOW() - INTERVAL '70 days'),

(236, 81, 1, 65, 6, true, NOW() - INTERVAL '50 days'), (237, 81, 2, 65, 6, true, NOW() - INTERVAL '50 days'), (238, 81, 3, 65, 6, true, NOW() - INTERVAL '50 days'),
(239, 82, 1, 35, 10, true, NOW() - INTERVAL '50 days'), (240, 82, 2, 35, 10, true, NOW() - INTERVAL '50 days'), (241, 82, 3, 35, 10, true, NOW() - INTERVAL '50 days'),

(242, 83, 1, 70, 6, true, NOW() - INTERVAL '30 days'), (243, 83, 2, 70, 6, true, NOW() - INTERVAL '30 days'), (244, 83, 3, 70, 6, true, NOW() - INTERVAL '30 days'),
(245, 84, 1, 38, 8, true, NOW() - INTERVAL '30 days'), (246, 84, 2, 38, 8, true, NOW() - INTERVAL '30 days'), (247, 84, 3, 38, 8, true, NOW() - INTERVAL '30 days'),

(248, 85, 1, 100, 5, true, NOW() - INTERVAL '20 days'), (249, 85, 2, 100, 5, true, NOW() - INTERVAL '20 days'), (250, 85, 3, 100, 5, true, NOW() - INTERVAL '20 days'),
(251, 86, 1, 140, 8, true, NOW() - INTERVAL '20 days'), (252, 86, 2, 140, 8, true, NOW() - INTERVAL '20 days'), (253, 86, 3, 140, 8, true, NOW() - INTERVAL '20 days'),

(254, 87, 1, 75, 5, true, NOW() - INTERVAL '12 days'), (255, 87, 2, 75, 5, true, NOW() - INTERVAL '12 days'), (256, 87, 3, 75, 5, true, NOW() - INTERVAL '12 days'),
(257, 88, 1, 40, 6, true, NOW() - INTERVAL '12 days'), (258, 88, 2, 40, 6, true, NOW() - INTERVAL '12 days'), (259, 88, 3, 40, 6, true, NOW() - INTERVAL '12 days'),

(260, 89, 1, 22, 10, true, NOW() - INTERVAL '8 days'), (261, 89, 2, 22, 10, true, NOW() - INTERVAL '8 days'), (262, 89, 3, 22, 10, true, NOW() - INTERVAL '8 days'),

(263, 90, 1, 80, 5, true, NOW() - INTERVAL '3 days'), (264, 90, 2, 80, 5, true, NOW() - INTERVAL '3 days'), (265, 90, 3, 80, 5, true, NOW() - INTERVAL '3 days'),
(266, 91, 1, 42, 5, true, NOW() - INTERVAL '3 days'), (267, 91, 2, 42, 5, true, NOW() - INTERVAL '3 days'), (268, 91, 3, 42, 5, true, NOW() - INTERVAL '3 days');

-- personal_record: current best per (user, exercise) - id, user_id, exercise_id, weight, reps, workout_entry_id, achieved_at
INSERT INTO personal_record (id, user_id, exercise_id, weight, reps, workout_entry_id, achieved_at) VALUES
(5, 1, 1, 80, 5, 25, NOW() - INTERVAL '3 days'),
(6, 1, 3, 42, 5, 25, NOW() - INTERVAL '3 days'),
(7, 1, 9, 100, 5, 22, NOW() - INTERVAL '20 days'),
(8, 1, 10, 140, 8, 22, NOW() - INTERVAL '20 days'),
(9, 1, 8, 22, 10, 24, NOW() - INTERVAL '8 days');

-- personal_record_history: one row per PR-breaking event.
-- Bench Press climbs every session (60/65/70/75/80) - 5 events.
-- Overhead Press repeats 35kg once (session 2) - that repeat correctly does
-- NOT get a row here, since it didn't beat the existing record - 4 events.
-- Squat/Leg Press/Bicep Curl are each a single first-ever PR - 1 event each.
INSERT INTO personal_record_history (id, user_id, exercise_id, weight, reps, workout_entry_id, achieved_at) VALUES
(8,  1, 1, 60, 8, 19, NOW() - INTERVAL '70 days'),
(9,  1, 1, 65, 6, 20, NOW() - INTERVAL '50 days'),
(10, 1, 1, 70, 6, 21, NOW() - INTERVAL '30 days'),
(11, 1, 1, 75, 5, 23, NOW() - INTERVAL '12 days'),
(12, 1, 1, 80, 5, 25, NOW() - INTERVAL '3 days'),

(13, 1, 3, 35, 10, 19, NOW() - INTERVAL '70 days'),
(14, 1, 3, 38, 8, 21, NOW() - INTERVAL '30 days'),
(15, 1, 3, 40, 6, 23, NOW() - INTERVAL '12 days'),
(16, 1, 3, 42, 5, 25, NOW() - INTERVAL '3 days'),

(17, 1, 9, 100, 5, 22, NOW() - INTERVAL '20 days'),
(18, 1, 10, 140, 8, 22, NOW() - INTERVAL '20 days'),
(19, 1, 8, 22, 10, 24, NOW() - INTERVAL '8 days');

-- Bump sequences past everything inserted above, so future app-created rows
-- don't collide with these ids.
SELECT setval('workout_entry_id_seq', 25);
SELECT setval('workout_entry_exercise_id_seq', 91);
SELECT setval('workout_entry_set_id_seq', 268);
SELECT setval('personal_record_id_seq', 9);
SELECT setval('personal_record_history_id_seq', 19);

COMMIT;
