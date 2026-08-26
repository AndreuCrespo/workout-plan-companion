import type { Exercise } from '@/domain/models';

/**
 * Small reviewed extension of the local catalogue. Text and metadata are
 * adapted from Exercises Dataset (Hasan Emir Yıldırım, MIT); see
 * docs/third-party-licenses.md. No third-party media is included.
 */
export const curatedExercises: Exercise[] = [
  {
    id: 'sentadilla-barra',
    name: 'Sentadilla con barra',
    equipment: 'Barra y soportes',
    equipmentSetup: 'Una barra colocada a una altura que puedas retirar con control y espacio libre para moverte.',
    techniqueSteps: [
      { label: 'Colócate', description: 'Sitúa los pies a una anchura estable y apoya la barra sobre la parte alta de la espalda.' },
      { label: 'Desciende', description: 'Flexiona caderas y rodillas con el pecho alto, sin perder el control.' },
      { label: 'Sube', description: 'Empuja el suelo con todo el pie y vuelve de pie de forma continua.' },
    ],
    coachingCue: 'Mantén las rodillas alineadas con los pies y usa una carga que controles.',
    preparation: 'Coloca los pies a una anchura cómoda, activa el tronco y retira la barra de los soportes solo si puedes hacerlo con estabilidad.',
    execution: 'Desciende hasta una profundidad cómoda mientras mantienes el control; empuja el suelo para volver arriba sin rebotar.',
    breathing: 'Toma aire antes de descender y suéltalo de forma controlada al subir.',
    commonMistakes: ['Perder el apoyo de todo el pie', 'Dejar que las rodillas caigan hacia dentro', 'Usar una carga que impide mantener el control'],
    sets: [{ target: '3 × 6 repeticiones · RPE 6', rest: '120 s' }],
  },
  {
    id: 'press-banca-barra',
    name: 'Press de banca con barra',
    equipment: 'Banco, barra y soportes',
    equipmentSetup: 'Banco estable, barra con seguros si están disponibles y un peso que puedas controlar.',
    techniqueSteps: [
      { label: 'Apóyate', description: 'Apoya los pies, la espalda alta y la cabeza de forma estable sobre el banco.' },
      { label: 'Baja', description: 'Desciende la barra hacia el pecho de manera lenta y controlada.' },
      { label: 'Empuja', description: 'Extiende los brazos sin perder el apoyo de los pies ni acelerar al final.' },
    ],
    coachingCue: 'Mantén los pies firmes y controla la barra durante todo el recorrido.',
    preparation: 'Túmbate con los pies apoyados y toma la barra con un agarre ligeramente más ancho que los hombros.',
    execution: 'Baja la barra hacia el pecho con control y empuja hasta extender los brazos sin buscar velocidad innecesaria.',
    breathing: 'Inspira durante la bajada y expulsa el aire de forma gradual al empujar.',
    commonMistakes: ['Perder el apoyo de los pies', 'Rebotar la barra sobre el pecho', 'Abrir los codos sin control'],
    sets: [{ target: '3 × 8 repeticiones · RPE 7', rest: '90 s' }],
  },
  {
    id: 'jalon-pecho-polea',
    name: 'Jalón al pecho en polea',
    equipment: 'Polea alta y asiento con sujeción',
    equipmentSetup: 'Polea alta, barra de jalón y apoyo para fijar las piernas de forma cómoda.',
    techniqueSteps: [
      { label: 'Fíjate', description: 'Ajusta las piernas bajo las almohadillas y toma la barra con un agarre cómodo.' },
      { label: 'Jala', description: 'Lleva la barra hacia la parte alta del pecho acercando los omóplatos.' },
      { label: 'Vuelve', description: 'Deja subir la barra despacio sin encoger los hombros.' },
    ],
    coachingCue: 'Lleva los codos hacia abajo sin tirar con impulso del tronco.',
    preparation: 'Siéntate estable, fija las piernas y mantén el pecho alto antes de iniciar el tirón.',
    execution: 'Jala la barra hacia la parte superior del pecho con control y vuelve lento a los brazos extendidos.',
    breathing: 'Suelta el aire al jalar e inspira mientras la barra vuelve arriba.',
    commonMistakes: ['Balancearse hacia atrás', 'Elevar los hombros', 'Soltar la carga demasiado rápido'],
    sets: [{ target: '3 × 10 repeticiones · RPE 7', rest: '75 s' }],
  },
  {
    id: 'curl-biceps-mancuernas',
    name: 'Curl de bíceps con mancuernas',
    equipment: 'Mancuernas',
    equipmentSetup: 'Dos mancuernas que puedas levantar sin balancear el tronco.',
    techniqueSteps: [
      { label: 'Prepárate', description: 'Ponte de pie con los brazos junto al cuerpo y las palmas orientadas hacia delante.' },
      { label: 'Flexiona', description: 'Sube las mancuernas manteniendo los codos cerca de los costados.' },
      { label: 'Baja', description: 'Desciende lento hasta extender los brazos de nuevo.' },
    ],
    coachingCue: 'Evita usar el impulso de la espalda para terminar cada repetición.',
    preparation: 'Colócate estable con una mancuerna en cada mano y los hombros relajados.',
    execution: 'Flexiona los codos para elevar las mancuernas y baja de forma controlada sin balancearte.',
    breathing: 'Expulsa el aire al subir e inspira mientras bajas.',
    commonMistakes: ['Balancear el tronco', 'Separar los codos del cuerpo', 'Bajar las mancuernas sin control'],
    sets: [{ target: '2 × 12 repeticiones · RPE 7', rest: '60 s' }],
  },
  {
    id: 'extension-triceps-polea',
    name: 'Extensión de tríceps en polea',
    equipment: 'Polea alta y agarre en V',
    equipmentSetup: 'Polea en posición alta y un agarre que permita mantener las muñecas cómodas.',
    techniqueSteps: [
      { label: 'Colócate', description: 'Ponte frente a la polea con los codos cerca de los costados.' },
      { label: 'Extiende', description: 'Empuja el agarre hacia abajo sin mover los brazos superiores.' },
      { label: 'Regresa', description: 'Vuelve despacio al inicio conservando el control.' },
    ],
    coachingCue: 'Mantén los codos estables y deja que el movimiento salga de la extensión del brazo.',
    preparation: 'Ajusta el agarre en la posición alta y adopta una postura estable frente a la máquina.',
    execution: 'Extiende los brazos hacia abajo y vuelve lento sin usar el tronco para ayudar.',
    breathing: 'Suelta el aire al extender e inspira al regresar.',
    commonMistakes: ['Mover los codos hacia delante', 'Inclinarse para usar el peso corporal', 'Soltar el agarre al volver'],
    sets: [{ target: '2 × 12 repeticiones · RPE 7', rest: '60 s' }],
  },
  {
    id: 'zancada-mancuernas',
    name: 'Zancada con mancuernas',
    equipment: 'Mancuernas y espacio libre',
    equipmentSetup: 'Dos mancuernas ligeras o moderadas y un recorrido sin obstáculos.',
    techniqueSteps: [
      { label: 'Da el paso', description: 'Avanza con un pie manteniendo el tronco erguido.' },
      { label: 'Desciende', description: 'Baja con control hasta una profundidad cómoda para ambas rodillas.' },
      { label: 'Vuelve', description: 'Empuja el suelo con el pie adelantado para recuperar la posición inicial.' },
    ],
    coachingCue: 'Usa un paso que te permita conservar equilibrio y una trayectoria cómoda de rodilla.',
    preparation: 'Ponte de pie con las mancuernas a los lados y espacio suficiente para avanzar.',
    execution: 'Da un paso, desciende con control y empuja con el pie adelantado para volver; alterna lados.',
    breathing: 'Inspira al descender y suelta el aire al volver de pie.',
    commonMistakes: ['Dar un paso demasiado corto', 'Perder el equilibrio por acelerar', 'Usar una carga que altera la técnica'],
    sets: [{ target: '3 × 8 por lado · RPE 6', rest: '75 s' }],
  },
  {
    id: 'plancha-rotacion',
    name: 'Plancha alta con rotación',
    equipment: 'Esterilla',
    equipmentSetup: 'Una esterilla o superficie estable que permita apoyar las manos con comodidad.',
    techniqueSteps: [
      { label: 'Forma la plancha', description: 'Coloca las manos bajo los hombros y crea una línea cómoda de cabeza a pies.' },
      { label: 'Rota', description: 'Gira el torso y eleva un brazo con control, sin acelerar.' },
      { label: 'Alterna', description: 'Vuelve al centro y cambia de lado manteniendo la pelvis estable.' },
    ],
    coachingCue: 'Mueve con un rango que puedas controlar sin forzar la zona lumbar.',
    preparation: 'Empieza en plancha alta con manos bajo hombros y pies a una distancia estable.',
    execution: 'Rota el torso hacia un lado, vuelve al centro y alterna con calma.',
    breathing: 'Respira de forma continua y evita contener el aire.',
    commonMistakes: ['Dejar caer la pelvis', 'Girar con impulso', 'Forzar un rango incómodo'],
    sets: [{ target: '2 × 8 por lado · RPE 6', rest: '45 s' }],
  },
];

export function getCuratedExercise(exerciseId: string): Exercise | undefined {
  return curatedExercises.find((exercise) => exercise.id === exerciseId);
}
