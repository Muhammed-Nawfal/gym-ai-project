# Gym AI Project

A gym workout tracking app with a Spring Boot backend and two clients: a React web app and a React Native (Expo) mobile app.

## Architecture

- **Backend**: Spring Boot (Java), Postgres (hosted on Supabase), JWT-based auth
- **Web app**: `frontend-react/frontend` — Vite + React
- **Mobile app**: `frontend-react/gym-ai-mobile` — Expo / React Native, feature-equivalent to the web app

## Current features

### Auth & onboarding
- Register (with live username/email availability check) → onboarding (height, weight, goal weight, DOB, fitness goal, skill level, profile picture) → JWT issued
- Login with email/password

### Profile
- View/edit personal info
- Profile picture upload

### Exercise library
- Browse all exercises (global, not per-user), filter by muscle group, search
- Create custom exercises (name, muscle groups, description, YouTube link)
- View exercise detail (description, video link, muscle groups)

### Workouts
- Browse your own workouts + predefined (template) workouts
- Create custom workouts (name, description, muscle groups, pick exercises)
- Edit/delete your own workouts
- "Add to My Workouts" on a predefined workout copies it into your own editable version — the original stays untouched for everyone else, and predefined workouts can't be edited directly

### Live workout logging
- Start a session, log sets (weight/reps), mark sets complete, add/remove sets on the fly
- Rest timer between sets
- Add extra exercises mid-session
- Per-exercise notes
- Shows previous performance per set for reference
- Finish or discard the session
- Offline draft persistence during an active session (localStorage on web, AsyncStorage on mobile)

## Known gaps / scaffolded but not functional

- **Achievements** — entity + service exist, but the controller has no `@GetMapping`/`@PostMapping` annotations, so no endpoints are actually reachable
- **Calorie Calculator** — DB table + entity exist, no service or controller
- **Personal Records** — DB table + entity exist, no service or controller
- No public/private visibility toggle for user-created exercises/workouts
- No real admin role — "predefined" is just a boolean any authenticated user could technically set
- "+ Add to Workout" button on the exercise detail modal is a placeholder (no handler)
- Home screen's "This Week" and "Streak" stats are hardcoded fake values, not real data

## Feature ideas / roadmap

### Finish what's half-built
- Wire up Achievements (small fix — just needs the mapping annotations added)
- Personal Records — auto-detect a new max weight/reps on a completed set and save it
- Calorie Calculator — BMR/TDEE calculator using the height/weight/goal data already collected at onboarding
- Wire up "+ Add to Workout" on the exercise detail modal

### Real gaps in the current flow
- Workout history / progress view — `WorkoutEntry` data is tracked but there's no screen to browse past workouts or see trends; the Home screen's "This Week"/"Streak" stats need to be wired to real data instead of hardcoded values
- Public/private visibility for custom exercises/workouts
- Push notification when the rest timer ends (currently only matters if the app stays foregrounded)

### Bigger / newer ideas
- Body measurement / weight progress tracking over time (charts)
- Social features — following other users, sharing custom workouts publicly
- Admin role — to actually gate who can create predefined/global content
- Offline-first workout logging — extend the existing local draft persistence into a full offline queue/sync
