-- Patches the dummy data already loaded from populate_dummy_session_data.sql
-- so reps vary across sessions instead of staying constant per exercise -
-- constant reps meant volume (weight x reps) was just weight x a fixed
-- number, so the Weight and Volume chart views were the same shape rescaled.
-- Targets the exact ids confirmed already in the DB; if you've re-run the
-- base script since, re-check ids before running this.

BEGIN;

-- workout_entry_exercise: target_reps
UPDATE workout_entry_exercise SET target_reps = 8  WHERE id = 79; -- Bench, 70d ago
UPDATE workout_entry_exercise SET target_reps = 10 WHERE id = 80; -- OHP, 70d ago
UPDATE workout_entry_exercise SET target_reps = 6  WHERE id = 81; -- Bench, 50d ago
UPDATE workout_entry_exercise SET target_reps = 10 WHERE id = 82; -- OHP, 50d ago
UPDATE workout_entry_exercise SET target_reps = 6  WHERE id = 83; -- Bench, 30d ago
UPDATE workout_entry_exercise SET target_reps = 6  WHERE id = 88; -- OHP, 12d ago
UPDATE workout_entry_exercise SET target_reps = 5  WHERE id = 91; -- OHP, 3d ago

-- workout_entry_set: reps (all 3 sets per exercise instance)
UPDATE workout_entry_set SET reps = 8  WHERE workout_entry_exercise_id = 79;
UPDATE workout_entry_set SET reps = 10 WHERE workout_entry_exercise_id = 80;
UPDATE workout_entry_set SET reps = 6  WHERE workout_entry_exercise_id = 81;
UPDATE workout_entry_set SET reps = 10 WHERE workout_entry_exercise_id = 82;
UPDATE workout_entry_set SET reps = 6  WHERE workout_entry_exercise_id = 83;
UPDATE workout_entry_set SET reps = 6  WHERE workout_entry_exercise_id = 88;
UPDATE workout_entry_set SET reps = 5  WHERE workout_entry_exercise_id = 91;

-- personal_record_history: reps per PR event
UPDATE personal_record_history SET reps = 8  WHERE id = 8;  -- Bench 60kg
UPDATE personal_record_history SET reps = 6  WHERE id = 9;  -- Bench 65kg
UPDATE personal_record_history SET reps = 6  WHERE id = 10; -- Bench 70kg
UPDATE personal_record_history SET reps = 10 WHERE id = 13; -- OHP 35kg
UPDATE personal_record_history SET reps = 6  WHERE id = 15; -- OHP 40kg
UPDATE personal_record_history SET reps = 5  WHERE id = 16; -- OHP 42kg

-- personal_record: current-best reps (only OHP changes - Bench was already 5)
UPDATE personal_record SET reps = 5 WHERE id = 6; -- OHP 42kg

COMMIT;
