# Recover a private backup on a new device

A private backup is recovered only through an explicit account flow. It is not automatic synchronization and it never replaces an existing local profile or completed training history.

## Supported flow

1. Install the app on a new device and stay in onboarding.
2. Choose **I already have an account (Ya tengo una cuenta)**.
3. Complete Magic Link access with the account that owns the backup.
4. Review the remote item counts and confirm **Recover my private backup (Recuperar mi copia privada)**.

The app restores the remote profile, theme, published plan snapshots, and completed workout logs. Progress is recalculated locally from the recovered immutable logs.

## Boundaries

- The flow is available only before onboarding creates a local profile and before local completed logs exist.
- In-progress drafts are device-local and are not backed up or recovered.
- Existing local plans and completed logs are never merged or replaced by the recovery flow.
- A person can keep using the app offline after recovery; later backups remain explicit actions from **Profile → Account**.
