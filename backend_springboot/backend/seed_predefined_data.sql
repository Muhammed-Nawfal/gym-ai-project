
BEGIN;

INSERT INTO exercise (id, name, description, youtube_link, created_by, primary_muscle_group, secondary_muscle_group, tertiary_muscle_group) VALUES
(1, 'Bench Press',      'Barbell bench press',      NULL, NULL, 'CHEST',     'TRICEP',    NULL),
(2, 'Incline DB Press',  'Incline dumbbell press',   NULL, NULL, 'CHEST',     'SHOULDERS', NULL),
(3, 'Overhead Press',    'Standing barbell press',   NULL, NULL, 'SHOULDERS', 'TRICEP',    NULL),
(4, 'Tricep Pushdown',   'Cable pushdown',           NULL, NULL, 'TRICEP',    NULL,        NULL),
(5, 'Lat Pulldown',      'Wide grip pulldown',       NULL, NULL, 'BACK',      'BICEP',     NULL),
(6, 'Barbell Row',       'Bent-over row',            NULL, NULL, 'BACK',      'BICEP',     NULL),
(7, 'Seated Cable Row',  'Seated row machine/cable', NULL, NULL, 'BACK',      'BICEP',     NULL),
(8, 'Bicep Curl',        'Dumbbell curl',            NULL, NULL, 'BICEP',     NULL,        NULL),
(9, 'Squat',             'Back squat',               NULL, NULL, 'LEG',       NULL,        NULL),
(10, 'Leg Press',        'Machine leg press',        NULL, NULL, 'LEG',       NULL,        NULL);

-- 5 predefined workouts, owned by your Supabase test user (testuser1@gmail.com).
-- Ownership here doesn't affect visibility to other users (predefined workouts
-- are queried by is_predefined=true regardless of user_id) - it's just required
-- because workout.user_id is NOT NULL.
INSERT INTO workout (id, name, description, user_id, is_predefined, predefined_workout_id) VALUES
(1, 'Push Workout',       'Chest/Shoulders/Triceps', (SELECT id FROM users WHERE email = 'testuser1@gmail.com'), true, NULL),
(2, 'Pull Workout',       'Back/Biceps',             (SELECT id FROM users WHERE email = 'testuser1@gmail.com'), true, NULL),
(3, 'Leg Workout',        'Legs',                    (SELECT id FROM users WHERE email = 'testuser1@gmail.com'), true, NULL),
(4, 'Upper Body Workout', 'Upper body mix',          (SELECT id FROM users WHERE email = 'testuser1@gmail.com'), true, NULL),
(5, 'Lower Body Workout', 'Lower body mix',          (SELECT id FROM users WHERE email = 'testuser1@gmail.com'), true, NULL);

-- Muscle groups per workout.
INSERT INTO workout_muscle_groups (workout_id, muscle_group) VALUES
(1, 'CHEST'), (1, 'SHOULDERS'), (1, 'TRICEP'),
(2, 'BACK'), (2, 'BICEP'),
(3, 'LEG'),
(4, 'CHEST'), (4, 'BACK'), (4, 'SHOULDERS'), (4, 'BICEP'), (4, 'TRICEP'),
(5, 'LEG');

-- Exercises within each workout, with sets/reps/weight/rest as captured locally.
INSERT INTO workout_exercise (id, workout_id, exercise_id, order_index, target_sets, target_reps, target_weight_kg, rest_seconds) VALUES
(1, 1, 1, 1, 4, 8, 60, 180),
(2, 1, 2, 2, 3, 10, 24, 150),
(3, 1, 3, 3, 3, 8, 40, 180),
(4, 1, 4, 4, 3, 12, 20, 90),
(5, 2, 5, 1, 3, 10, 50, 120),
(6, 2, 6, 2, 3, 8, 60, 150),
(7, 2, 7, 3, 3, 10, 45, 120),
(8, 2, 8, 4, 3, 12, 12, 90),
(9, 3, 9, 1, 4, 6, 80, 180),
(10, 3, 10, 2, 4, 10, 140, 150),
(11, 4, 1, 1, 3, 8, 60, 180),
(12, 4, 6, 2, 3, 8, 60, 150),
(13, 4, 3, 3, 3, 8, 40, 180),
(14, 5, 9, 1, 3, 6, 80, 180),
(15, 5, 10, 2, 3, 10, 140, 150);

-- Bump sequences past the explicit ids used above, so future app-created
-- rows (new user exercises/workouts) don't collide with these ids.
SELECT setval('exercise_id_seq', (SELECT MAX(id) FROM exercise));
SELECT setval('workout_id_seq', (SELECT MAX(id) FROM workout));
SELECT setval('workout_exercise_id_seq', (SELECT MAX(id) FROM workout_exercise));

COMMIT;
