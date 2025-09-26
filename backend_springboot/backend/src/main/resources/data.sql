-- =====================
-- Seed Test User
-- =====================
INSERT INTO users (
    id, first_name, last_name, user_name, email, password_hash,
    profile_picture_url, height, weight, goal_weight,
    created_at, updated_at, user_goal, skill_level, dob
) VALUES (
    1,
    'Test',
    'User',
    'testuser',
    'testuser@example.com',
    '$2a$10$Dow1MLp8sY0I2pKfezPMeuhPxOnWv2vLD5OfOoxjNq8/nmSLSrF92',
    NULL,
    175,
    70,
    65,
    NOW(),
    NOW(),
    'CUTTING',
    'BEGINNER',
    '2000-01-01'
);

-- =====================
-- Seed Exercises
-- =====================
INSERT INTO exercise (id, name, description, youtube_link, created_by)
VALUES
(1, 'Bench Press', 'Compound chest exercise with barbell.', 'https://youtu.be/rT7DgCr-3pg', 1),
(2, 'Squat', 'Lower body strength exercise.', 'https://youtu.be/YaXPRqUwItQ', 1),
(3, 'Deadlift', 'Posterior chain exercise with barbell.', 'https://youtu.be/op9kVnSso6Q', 1),
(4, 'Overhead Press', 'Shoulder pressing exercise.', 'https://youtu.be/B-aVuyhvLHU', 1),
(5, 'Pull-Up', 'Bodyweight back exercise.', 'https://youtu.be/eGo4IYlbE5g', 1),
(6, 'Bicep Curl', 'Isolation exercise for bicep.', 'https://youtu.be/in7PaeYlhrM', 1),
(7, 'Tricep Dip', 'Bodyweight tricep exercise.', 'https://youtu.be/6kALZikXxLc', 1),
(8, 'Lunge', 'Unilateral leg exercise.', 'https://youtu.be/QOVaHwm-Q6U', 1),
(9, 'Leg Press', 'Compound lower body machine exercise.', 'https://youtu.be/IZxyjW7MPJQ', 1),
(10, 'Chest Fly', 'Chest isolation exercise.', 'https://youtu.be/eozdVDA78K0', 1);

-- =====================
-- Seed Muscle Groups Mapping
-- =====================
-- Bench Press
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (1, 'CHEST'), (1, 'TRICEP'), (1, 'SHOULDERS');
-- Squat
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (2, 'LEG');
-- Deadlift
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (3, 'BACK'), (3, 'LEG');
-- Overhead Press
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (4, 'SHOULDERS'), (4, 'TRICEP');
-- Pull-Up
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (5, 'BACK'), (5, 'BICEP');
-- Bicep Curl
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (6, 'BICEP');
-- Tricep Dip
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (7, 'TRICEP'), (7, 'CHEST');
-- Lunge
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (8, 'LEG');
-- Leg Press
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (9, 'LEG');
-- Chest Fly
INSERT INTO exercise_muscle_groups (exercise_id, muscle_group) VALUES (10, 'CHEST');
