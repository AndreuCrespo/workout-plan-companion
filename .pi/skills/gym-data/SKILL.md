---
name: gym-data
description: Diseña la futura persistencia de perfil, planes, sesiones y progreso para la app de gimnasio con privacidad y versionado.
---

# Datos y backend

Usa este skill solo para definir o implementar la capa de datos. Lee `docs/product-brief.md` y conserva el historial: un plan publicado y una sesión registrada no se reescriben.

- Modela perfil, preferencias, plan mensual, semanas, sesiones, ejercicios, series registradas y notas.
- Cuando llegue Supabase, protege los datos por usuario con RLS y nunca expongas claves de servicio en el cliente.
- Separa datos sensibles de analítica opcional y pide autorización antes de crear o cambiar recursos remotos.
