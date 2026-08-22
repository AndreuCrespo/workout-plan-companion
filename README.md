# Workout Plan Companion

Aplicación móvil personal para organizar un plan mensual de gimnasio, guiar cada sesión y registrar progreso. Está construida con Expo, React Native y TypeScript.

> Esta aplicación no realiza diagnósticos médicos ni sustituye a un profesional sanitario. Ante dolor agudo, lesión o una condición clínica, pausa el ejercicio y consulta a un profesional.

## Estado actual · v0.1.0

- Navegación con Expo Router: **Hoy**, **Mi plan**, **Progreso** y **Perfil**.
- Plan mensual local de cuatro semanas, detalle de ejercicios y flujo estructural de sesión.
- Dos temas persistentes: Verde activo y Grafito naranja.
- Datos de muestra y repositorios locales, preparados para sustituirse más adelante por una persistencia remota.
- Sin cuentas, Supabase, credenciales ni servicios externos de datos.

## Ejecutar en desarrollo

Requiere Node.js 24 y npm.

```bash
cd mobile
npm install
npm start
```

Para probarlo en un teléfono, instala Expo Go y escanea el código QR desde la misma red Wi-Fi.

## Comprobaciones

```bash
cd mobile
npm run lint
npm run typecheck
```

GitHub Actions ejecuta ambas comprobaciones en cada push y pull request dirigido a `main`.

## Estructura

- `mobile/app/`: rutas y pantallas de Expo Router.
- `mobile/components/`: componentes reutilizables de interfaz.
- `mobile/theme/`: tokens y proveedor de temas.
- `mobile/domain/`: modelos TypeScript.
- `mobile/data/`: datos de muestra aislados.
- `mobile/repositories/`: contratos e implementación local de datos y preferencias.
- `docs/`: brief de producto y sistema visual aprobados.

## Licencia

Pendiente de decidir antes de autorizar explícitamente la reutilización del código por terceros.
