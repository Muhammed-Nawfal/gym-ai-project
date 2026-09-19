# 🦖 JackZilla

JackZilla is a full-stack fitness platform with a built-in AI coach. Track workouts and personal records, get AI-generated training plans, and receive proactive coaching when your progress stalls — all in a sleek, mobile-first app.

> **Status:** 🚧 Active development — core tracking, personal records, and the AI coach are built and working end-to-end; polish and v2 features are ongoing.

---

## 🌟 Features

- 🔐 **Secure auth** — JWT-based login/registration with an onboarding flow to capture goals, skill level, and stats
- 🏋️ **Workout tracking** — build custom workouts or start from predefined templates, log sets/reps/weight per session, view workout history
- 🏆 **Personal records** — automatic PR detection per exercise, with stats (heaviest lift, most improved exercise, monthly PR count) and per-exercise history charts
- 🤖 **AI Coach chat** — a Google ADK / Gemini-powered agent with three specialized sub-agents:
  - **Workout Plan Generator** — proposes a full workout plan on request, which you review and explicitly apply (never auto-applied)
  - **Injury Safety Specialist** — answers injury/safety-related training questions
  - **Progress Insight Agent** — powers stagnation detection (see below)
- 📉 **Stagnation detection** — a nightly job flags exercises where weight hasn't progressed over enough sessions/time, surfaced as a dismissible insight card on the home screen. Tapping "Ask Coach" starts a conversation about it; the agent only marks it resolved once you've engaged and explicitly agree — mirroring the plan-proposal confirm pattern, never unilaterally
- 📊 **Home dashboard** — total workouts, this week's count, current goal, a weekly training streak (3+ workout days in a week keeps it alive), and recent workouts/PRs at a glance
- 🎥 Exercise library with demo videos

### Planned (v2)
- **Consistency tracking** — flag when workout frequency drops off from a user's usual pattern
- **Muscle-group balance** — flag lopsided training (e.g. heavy chest/arms, neglected back/legs)

Both would reuse the same insight/detection architecture as stagnation detection, just with a different rule per insight type.

---

## 🧱 Tech Stack

**Backend** — Spring Boot 3.5 (Java 21), PostgreSQL, Spring Security + JWT, Google ADK Java (`com.google.adk`) with Gemini 3.6 Flash for the AI coach.

**Mobile app** (primary frontend) — React Native + Expo Router, TypeScript.

**Web app** (`frontend-react/frontend`) — an earlier Vite/React client; not actively maintained now that the mobile app is the primary frontend.

---

## 🚀 Getting Started

Clone the repository, then set up each piece:

### Backend
```
cd backend_springboot/backend
```
Create `src/main/resources/application-secrets.properties` (gitignored) with your DB credentials, JWT secret, and API keys:
```properties
spring.datasource.url=jdbc:postgresql://<host>:<port>/<db>
spring.datasource.username=<user>
spring.datasource.password=<password>
app.jwtsecret=<your-jwt-secret>
GEMINI_API_KEY=<your-gemini-api-key>
LINKUP_API_KEY=<your-linkup-api-key>
```
Then run:
```
./mvnw spring-boot:run
```
The API serves on `http://localhost:8080`.

### Mobile App (Expo)
```
cd frontend-react/gym-ai-mobile
npm install
npx expo start
```
By default it points at `http://localhost:8080` (or `10.0.2.2:8080` on Android emulator). Override with an `EXPO_PUBLIC_API_URL` env var if your backend runs elsewhere.
