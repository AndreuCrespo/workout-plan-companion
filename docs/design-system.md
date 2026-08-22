# Sistema visual — base aprobada

La interfaz debe sentirse cálida, clara y enfocada. No es una app de culturismo agresiva: prioriza lectura rápida, confianza y acción durante el entrenamiento.

## Temas

### 01 · Verde activo — predeterminado

| Token | Valor |
| --- | --- |
| Fondo | `#F4F7F5` |
| Superficie | `#FFFFFF` |
| Texto | `#14241E` |
| Texto secundario | `#587066` |
| Primario | `#177453` |
| Primario suave | `#DDEFE7` |
| Lima de énfasis | `#C8EE72` |
| Ámbar cálido | `#FFBD72` |
| Borde | `#D9E5DE` |

### 09 · Grafito naranja — alternativa

| Token | Valor |
| --- | --- |
| Fondo | `#202326` |
| Superficie | `#2B2F32` |
| Superficie elevada | `#353A3E` |
| Texto | `#F7F7F5` |
| Texto secundario | `#B4BAB8` |
| Primario | `#ED682B` |
| Primario intenso | `#FF8040` |
| Ámbar de énfasis | `#FACB65` |
| Borde | `#454B50` |

## Componentes y jerarquía

- Barra superior compacta: saludo/contexto y acción contextual; no saturar con iconos.
- Tarjeta de sesión destacada: día, foco, duración y botón primario de acción.
- Tarjetas secundarias: superficie limpia, radio 20–24, borde discreto; las acciones quedan claras con jerarquía de tamaño y color, no solo con sombra.
- Navegación inferior fija con icono y etiqueta: Hoy, Mi plan, Progreso y Perfil.
- Botones principales de ancho completo y altura táctil mínima de 48 px. Los controles de registro son cómodos con una mano.
- Tipografía: sans serif del sistema, títulos con peso semibold/bold; números de series y carga con buena alineación tabular cuando sea posible.

## Comportamiento del tema

El usuario cambia el tema en **Perfil → Apariencia**. El estado se aplica al instante, se persiste localmente al principio y se sincronizará con el perfil cuando exista cuenta. Nunca se hereda por accidente de la configuración del sistema ni se pierde al actualizar un plan.

## Accesibilidad

- Contraste suficiente en texto, botones y estados.
- No comunicar estado solo mediante color.
- Etiquetas accesibles en controles e iconos, objetivos táctiles amplios y soporte de tamaño de fuente.
- Respetar Safe Area, teclado y reducción de movimiento cuando aplique.
