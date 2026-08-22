---
name: gym-data
description: Design future persistence for profiles, plans, workouts, and progress in the gym app with privacy and versioning.
---

# Data and backend

Use this skill only to define or implement the data layer. Read `docs/product-brief.md` and preserve history: a published plan and a logged workout must not be overwritten.

- Model the profile, preferences, monthly plan, weeks, workouts, exercises, logged sets, and notes.
- When Supabase is introduced, protect user data with RLS and never expose service keys in the client.
- Separate sensitive data from optional analytics and request authorisation before creating or changing remote resources.
