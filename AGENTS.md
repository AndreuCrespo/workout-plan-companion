# Gym App — project context

## Purpose

A personal mobile app for training at the gym without relying on a coach: it gathers context, creates and presents four-week monthly plans, guides each workout, and records progress. The application does not provide medical diagnoses or replace healthcare professionals.

The product communicates in clear, approachable Spanish and makes no result promises. Acute pain, an injury, or a clinical condition requires pausing and consulting a professional.

## Approved decisions

- Client: React Native with Expo and strict TypeScript, inside `mobile/`.
- Navigation: Expo Router, with four tabs: **Today (Hoy)**, **My plan (Mi plan)**, **Progress (Progreso)**, and **Profile (Perfil)**.
- Future persistence: Supabase for accounts, profiles, plans, and logs. Do not create a remote project, credentials, or production migrations without explicit approval.
- Initial plan: a four-week monthly template; every workout has a warm-up, exercises, sets/repetitions/RPE or rest, and a cool-down. Published plans are versioned: history is never overwritten.
- Persistent onboarding: goal, experience, availability, workout duration, equipment, declared limitations, units, and preferences; it can be edited from Profile and informs future plans.
- Visual theme: persistent selector in **Profile → Appearance (Perfil → Apariencia)**. The default is `verde-activo`; `grafito-naranja` is the alternative; changes apply immediately.

## MVP scope

1. Editable onboarding and profile.
2. Monthly plan navigable by week and workout.
3. Workout execution and logging for load, repetitions, RPE, and notes.
4. Exercise detail with instructions, technical cues, common mistakes, and an illustration/animation that can be safely replaced later.
5. Basic progress: adherence, volume, and progression by exercise.

Out of scope for the MVP: social features, payments, wearables, nutrition/calorie tracking, injury diagnosis, unreviewed automatic generation, and complex notifications.

## Working approach

- Read `docs/product-brief.md` and `docs/design-system.md` before making product or UI decisions.
- Before adding a dependency, check whether Expo already covers the need; prefer maintained libraries compatible with the installed SDK.
- Keep sample data isolated and use a repository layer so Supabase can replace local storage without rewriting screens.
- Never store secrets in the repository or client. Ask for confirmation before creating external services, deploying, or running distribution builds.
- After changes, run the project's provided typecheck, lint, and relevant tests. Do not ignore errors.
- Use the appropriate skill: `/skill:gym-product`, `/skill:gym-ui`, `/skill:gym-mobile`, `/skill:gym-data`, or `/skill:gym-quality`.

## First code delivery

Create the Expo app shell in `mobile/`: four-tab routes, local sample data, the Active Green theme, a switch to Graphite Orange from Profile, and structural screens for the workout flow. Do not integrate Supabase yet.
