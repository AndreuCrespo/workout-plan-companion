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

## Probar Android por USB desde WSL

Para trabajar con Expo Go sin red Wi-Fi, Windows debe compartir el teléfono con WSL mediante `usbipd-win`. Hace falta tener la depuración USB autorizada en el teléfono y `adb` instalado en WSL.

1. En PowerShell de Windows con permisos de administrador, identifica y adjunta el dispositivo:

   ```powershell
   usbipd list
   usbipd bind --busid <BUSID>
   usbipd attach --wsl --busid <BUSID>
   ```

2. En WSL, comprueba que el estado del teléfono es `device`, crea el puente y arranca Expo:

   ```bash
   adb devices -l
   adb reverse tcp:8081 tcp:8081
   cd mobile
   npm start -- --localhost --port 8081
   ```

3. Escanea el QR desde Expo Go. Al guardar cambios, Fast Refresh actualiza la app en el teléfono.

Al desconectar, puede ser necesario repetir el adjunto USB. Nunca compartas autorizaciones RSA ni tokens.

## Licencia

Pendiente de decidir antes de autorizar explícitamente la reutilización del código por terceros.
