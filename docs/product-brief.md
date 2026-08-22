# Product brief — gym app

## User and problem

A person who used to follow a coach's plan and now trains independently. They want to arrive at the gym, know exactly what to do, understand each exercise, and see progress without spending time maintaining spreadsheets.

## Core experience

1. On first launch, they complete a short onboarding flow.
2. In **Today (Hoy)**, they see the next workout, estimated duration, and goal.
3. They start the workout, consult exercise technique when needed, and log every set.
4. They finish, add an optional note, and update their progress.
5. At the beginning of a cycle, they review and confirm the next monthly plan; previous results provide context, while the user stays in control.

## Navigation

| Section | Main content |
| --- | --- |
| Today (Hoy) | Next workout, plan status, workout CTA, and streak/adherence. |
| My plan (Mi plan) | Monthly cycle, week selector, workouts, and day detail. |
| Progress (Progreso) | Adherence, volume, load progression, and relevant notes. |
| Profile (Perfil) | Onboarding details, units, equipment, privacy, and Appearance. |

## Onboarding data

- Primary goal (strength, muscle gain, general health, or returning to training).
- Experience, available days, workout duration, and equipment.
- The person's preferences and declared limitations.
- Units and visual theme.

This data is stored in the profile and can be edited. Each plan stores a copy of the parameters that originated it, and its logged workouts are not retrospectively modified.

## Safety principles

- Show clear notices for acute pain, injury, or declared pregnancy/conditions; recommend professional care when appropriate.
- Explain technique in practical language: setup, execution, breathing, and common mistakes.
- Do not present recommendations as medical prescriptions or set absolute loads without the person's own data.

## First-version criteria

- A person can complete the main flow with sample data, even without a connection or account.
- Changing the theme does not alter navigation or data and persists after the app restarts.
- The UI fits and remains usable on a 360 px-wide mobile screen.
