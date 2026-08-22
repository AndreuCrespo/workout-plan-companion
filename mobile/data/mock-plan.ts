import type { Exercise, MonthlyPlan, WorkoutSession } from '@/domain/models';

const createGobletSquat = (): Exercise => ({
  id: 'sentadilla-goblet',
  name: 'Sentadilla goblet',
  equipment: 'Mancuerna',
  coachingCue: 'Mantén el tronco alto y reparte el peso en todo el pie.',
  preparation: 'Sujeta una mancuerna junto al pecho y coloca los pies al ancho que te resulte estable.',
  execution: 'Desciende con control hasta una profundidad cómoda y empuja el suelo para volver arriba.',
  breathing: 'Inspira antes de bajar y suelta el aire al subir sin perder la tensión del tronco.',
  commonMistakes: ['Elevar los talones', 'Perder la posición neutra de la espalda', 'Rebotar al final del recorrido'],
  saferAlternative: 'Reduce la carga o usa una caja como referencia de profundidad.',
  sets: [
    { target: '3 × 8 repeticiones · RPE 7', rest: '90 s' },
    { target: '1 × 10 repeticiones · RPE 6', rest: '90 s' },
  ],
});

const createRomanianDeadlift = (): Exercise => ({
  id: 'peso-muerto-rumano',
  name: 'Peso muerto rumano con mancuernas',
  equipment: 'Mancuernas',
  coachingCue: 'Lleva la cadera atrás; las mancuernas permanecen cerca de las piernas.',
  preparation: 'Pies a la anchura de caderas, rodillas suaves y mancuernas frente a los muslos.',
  execution: 'Desplaza la cadera hacia atrás hasta notar tensión en la parte posterior de las piernas y vuelve apretando glúteos.',
  breathing: 'Toma aire antes de bajar y expúlsalo de forma controlada al regresar.',
  commonMistakes: ['Doblar demasiado las rodillas', 'Alejar la carga del cuerpo', 'Buscar más recorrido perdiendo control'],
  saferAlternative: 'Haz el movimiento sin carga frente a un espejo o acorta el recorrido.',
  sets: [
    { target: '3 × 10 repeticiones · RPE 7', rest: '90 s' },
  ],
});

const createChestPress = (): Exercise => ({
  id: 'press-pecho-mancuernas',
  name: 'Press de pecho con mancuernas',
  equipment: 'Banco y mancuernas',
  coachingCue: 'Apoya bien los pies y controla la bajada antes de empujar.',
  preparation: 'Túmbate con los pies firmes, escápulas apoyadas y mancuernas sobre el pecho.',
  execution: 'Baja las mancuernas a los lados del pecho con control y empuja hasta extender los brazos sin bloquearlos con fuerza.',
  breathing: 'Inspira al bajar y expulsa el aire durante el empuje.',
  commonMistakes: ['Perder el apoyo de los pies', 'Abrir demasiado los codos', 'Bajar rápido sin control'],
  saferAlternative: 'Usa menos carga o realiza el press en máquina con recorrido cómodo.',
  sets: [
    { target: '3 × 8 repeticiones · RPE 7', rest: '90 s' },
  ],
});

const createSeatedRow = (): Exercise => ({
  id: 'remo-sentado',
  name: 'Remo sentado en polea',
  equipment: 'Polea',
  coachingCue: 'Acerca los codos al cuerpo sin encoger los hombros.',
  preparation: 'Siéntate erguido, fija los pies y toma el agarre con los brazos extendidos de forma cómoda.',
  execution: 'Lleva el agarre hacia el abdomen mientras juntas suavemente las escápulas; vuelve lento al inicio.',
  breathing: 'Suelta el aire al remar e inspira al volver.',
  commonMistakes: ['Tirar con impulso del tronco', 'Elevar los hombros', 'Acortar la vuelta del movimiento'],
  saferAlternative: 'Reduce la carga y pausa un segundo con los codos atrás.',
  sets: [
    { target: '3 × 10 repeticiones · RPE 7', rest: '75 s' },
  ],
});

const createStepUp = (): Exercise => ({
  id: 'subida-cajon',
  name: 'Subida al cajón',
  equipment: 'Cajón bajo',
  coachingCue: 'Empuja con el pie que está sobre el cajón y sube con control.',
  preparation: 'Elige una altura estable que te permita mantener la pelvis nivelada.',
  execution: 'Apoya todo el pie, sube sin impulsarte con la pierna de atrás y baja despacio.',
  breathing: 'Respira de forma continua, expulsando aire al subir.',
  commonMistakes: ['Impulsarse con la pierna de atrás', 'Dejar caer la rodilla hacia dentro', 'Usar una altura excesiva'],
  saferAlternative: 'Baja la altura del cajón o realiza una zancada asistida.',
  sets: [
    { target: '3 × 8 por lado · RPE 6', rest: '75 s' },
  ],
});

const createDeadBug = (): Exercise => ({
  id: 'dead-bug',
  name: 'Dead bug',
  equipment: 'Esterilla',
  coachingCue: 'Mueve lento y conserva la espalda baja en una posición cómoda.',
  preparation: 'Túmbate boca arriba con rodillas y caderas flexionadas, brazos hacia el techo.',
  execution: 'Extiende de forma alterna una pierna y el brazo contrario hasta donde mantengas control; vuelve y cambia.',
  breathing: 'Expulsa el aire al extender y toma aire al regresar.',
  commonMistakes: ['Arquear la espalda baja', 'Moverse demasiado rápido', 'Forzar el rango de la pierna'],
  saferAlternative: 'Mueve solo una pierna o acorta el recorrido.',
  sets: [
    { target: '3 × 6 por lado · RPE 6', rest: '45 s' },
  ],
});

function createSession(
  id: string,
  dayLabel: string,
  title: string,
  focus: string,
  status: WorkoutSession['status'],
  exercises: Exercise[],
): WorkoutSession {
  return {
    id,
    dayLabel,
    title,
    focus,
    estimatedMinutes: 60,
    status,
    warmUp: ['5 min de bici suave', 'Movilidad de tobillo y cadera', '2 series de aproximación del primer ejercicio'],
    exercises,
    coolDown: 'Camina 3 minutos y anota cómo te has sentido.',
  };
}

const weekOneSessions = [
  createSession('semana-1-sesion-1', 'Próxima · martes', 'Tren inferior', 'Fuerza base y control', 'upcoming', [
    createGobletSquat(),
    createRomanianDeadlift(),
    createStepUp(),
    createDeadBug(),
  ]),
  createSession('semana-1-sesion-2', 'Jueves', 'Tren superior', 'Empuje y tracción equilibrados', 'upcoming', [
    createChestPress(),
    createSeatedRow(),
    createDeadBug(),
  ]),
  createSession('semana-1-sesion-3', 'Sábado', 'Cuerpo completo', 'Técnica y ritmo sostenible', 'upcoming', [
    createGobletSquat(),
    createChestPress(),
    createSeatedRow(),
  ]),
];

const weekTwoSessions = [
  createSession('semana-2-sesion-1', 'Martes', 'Tren inferior', 'Repeticiones consistentes', 'upcoming', [
    createGobletSquat(),
    createRomanianDeadlift(),
    createStepUp(),
  ]),
  createSession('semana-2-sesion-2', 'Jueves', 'Tren superior', 'Estabilidad y control', 'upcoming', [
    createChestPress(),
    createSeatedRow(),
    createDeadBug(),
  ]),
  createSession('semana-2-sesion-3', 'Sábado', 'Cuerpo completo', 'Volumen moderado', 'upcoming', [
    createGobletSquat(),
    createChestPress(),
    createStepUp(),
  ]),
];

const weekThreeSessions = [
  createSession('semana-3-sesion-1', 'Martes', 'Tren inferior', 'Fuerza con margen', 'upcoming', [
    createGobletSquat(),
    createRomanianDeadlift(),
    createDeadBug(),
  ]),
  createSession('semana-3-sesion-2', 'Jueves', 'Tren superior', 'Tensión controlada', 'upcoming', [
    createChestPress(),
    createSeatedRow(),
    createDeadBug(),
  ]),
  createSession('semana-3-sesion-3', 'Sábado', 'Cuerpo completo', 'Práctica técnica', 'upcoming', [
    createGobletSquat(),
    createSeatedRow(),
    createStepUp(),
  ]),
];

const weekFourSessions = [
  createSession('semana-4-sesion-1', 'Martes', 'Tren inferior', 'Descarga y movilidad', 'upcoming', [
    createGobletSquat(),
    createRomanianDeadlift(),
    createDeadBug(),
  ]),
  createSession('semana-4-sesion-2', 'Jueves', 'Tren superior', 'Descarga y control', 'upcoming', [
    createChestPress(),
    createSeatedRow(),
    createDeadBug(),
  ]),
  createSession('semana-4-sesion-3', 'Sábado', 'Cuerpo completo', 'Cierre de ciclo', 'upcoming', [
    createGobletSquat(),
    createStepUp(),
    createSeatedRow(),
  ]),
];

export const mockPlan: MonthlyPlan = {
  id: 'plan-fuerza-base-01',
  name: 'Fuerza y base',
  version: 'Versión 1 · 4 semanas',
  weeks: [
    { number: 1, goal: 'Encontrar un ritmo cómodo', sessions: weekOneSessions },
    { number: 2, goal: 'Consolidar la técnica', sessions: weekTwoSessions },
    { number: 3, goal: 'Practicar con margen', sessions: weekThreeSessions },
    { number: 4, goal: 'Cerrar el ciclo con control', sessions: weekFourSessions },
  ],
};

export const mockNextSession = weekOneSessions[0];

export function getMockSession(sessionId: string): WorkoutSession | undefined {
  return mockPlan.weeks.flatMap((week) => week.sessions).find((session) => session.id === sessionId);
}

export function getMockExercise(exerciseId: string): Exercise | undefined {
  return mockPlan.weeks
    .flatMap((week) => week.sessions)
    .flatMap((session) => session.exercises)
    .find((exercise) => exercise.id === exerciseId);
}
