# Visual system — approved foundation

The interface should feel warm, clear, and focused. This is not an aggressive bodybuilding app: it prioritises fast reading, confidence, and action during training.

## Themes

### 01 · Active Green — default

| Token | Value |
| --- | --- |
| Background | `#F4F7F5` |
| Surface | `#FFFFFF` |
| Text | `#14241E` |
| Secondary text | `#587066` |
| Primary | `#177453` |
| Soft primary | `#DDEFE7` |
| Emphasis lime | `#C8EE72` |
| Warm amber | `#FFBD72` |
| Border | `#D9E5DE` |

### 09 · Graphite Orange — alternative

| Token | Value |
| --- | --- |
| Background | `#202326` |
| Surface | `#2B2F32` |
| Elevated surface | `#353A3E` |
| Text | `#F7F7F5` |
| Secondary text | `#B4BAB8` |
| Primary | `#ED682B` |
| Strong primary | `#FF8040` |
| Emphasis amber | `#FACB65` |
| Border | `#454B50` |

## Components and hierarchy

- Compact top bar: greeting/context and a contextual action; do not overload it with icons.
- Prominent workout card: day, focus, duration, and a primary action button.
- Secondary cards: clean surface, 20–24 radius, and a subtle border; actions are clear through colour and size hierarchy, not shadows alone.
- Fixed bottom navigation with icon and label: Hoy, Mi plan, Progreso, and Perfil.
- Full-width primary buttons with a minimum 48 px touch height. Logging controls should be comfortable to use with one hand.
- System sans serif typeface, semibold/bold titles, and well-aligned tabular set and load numbers when available.

## Theme behaviour

The user changes the theme in **Profile → Appearance (Perfil → Apariencia)**. The state applies immediately, is initially persisted locally, and will synchronise with the profile when an account exists. It must never be accidentally inherited from the system setting or lost when a plan is updated.

## Accessibility

- Sufficient contrast for text, buttons, and states.
- Do not communicate state through colour alone.
- Accessible labels for controls and icons, generous touch targets, and support for font scaling.
- Respect Safe Area, keyboard handling, and reduced motion where applicable.
