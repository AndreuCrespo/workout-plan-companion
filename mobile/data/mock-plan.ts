import type { Exercise, MonthlyPlan, WorkoutSession } from '@/domain/models';

const createGobletSquat = (): Exercise => ({
  id: 'sentadilla-goblet',
  name: 'Sentadilla goblet',
  equipment: 'Mancuerna',
  equipmentSetup: 'Una mancuerna que puedas sostener junto al pecho y espacio libre para moverte.',
  techniqueSteps: [
    { label: 'Colócate', description: 'Sujeta la mancuerna junto al pecho y apoya todo el pie.' },
    { label: 'Desciende', description: 'Lleva la cadera hacia abajo con el pecho alto.' },
    { label: 'Vuelve', description: 'Empuja el suelo y termina de pie con control.' },
  ],
  coachingCue: 'Mantén el tronco alto y reparte el peso en todo el pie.',
  preparation: 'Sujeta una mancuerna junto al pecho y coloca los pies al ancho que te resulte estable.',
  execution: 'Desciende con control hasta una profundidad cómoda y empuja el suelo para volver arriba.',
  breathing: 'Inspira antes de bajar y suelta el aire al subir sin perder la tensión del tronco.',
  commonMistakes: ['Elevar los talones', 'Perder la posición neutra de la espalda', 'Rebotar al final del recorrido'],
  sets: [
    { target: '3 × 8 repeticiones · RPE 7', rest: '90 s' },
    { target: '1 × 10 repeticiones · RPE 6', rest: '90 s' },
  ],
});

const createRomanianDeadlift = (): Exercise => ({
  id: 'peso-muerto-rumano',
  name: 'Peso muerto rumano con mancuernas',
  equipment: 'Mancuernas',
  equipmentSetup: 'Dos mancuernas y una zona libre para llevar la cadera hacia atrás.',
  techniqueSteps: [
    { label: 'Colócate', description: 'Mancuernas cerca de los muslos, rodillas suaves.' },
    { label: 'Lleva atrás', description: 'Desplaza la cadera atrás sin alejar la carga.' },
    { label: 'Extiende', description: 'Vuelve de pie apretando glúteos sin acelerar.' },
  ],
  coachingCue: 'Lleva la cadera atrás; las mancuernas permanecen cerca de las piernas.',
  preparation: 'Pies a la anchura de caderas, rodillas suaves y mancuernas frente a los muslos.',
  execution: 'Desplaza la cadera hacia atrás hasta notar tensión en la parte posterior de las piernas y vuelve apretando glúteos.',
  breathing: 'Toma aire antes de bajar y expúlsalo de forma controlada al regresar.',
  commonMistakes: ['Doblar demasiado las rodillas', 'Alejar la carga del cuerpo', 'Buscar más recorrido perdiendo control'],
  sets: [
    { target: '3 × 10 repeticiones · RPE 7', rest: '90 s' },
  ],
});

const createChestPress = (): Exercise => ({
  id: 'press-pecho-mancuernas',
  name: 'Press de pecho con mancuernas',
  equipment: 'Banco y mancuernas',
  equipmentSetup: 'Banco estable y dos mancuernas que puedas controlar durante toda la serie.',
  techniqueSteps: [
    { label: 'Apóyate', description: 'Pies firmes y espalda alta apoyada en el banco.' },
    { label: 'Baja', description: 'Desciende las mancuernas a los lados del pecho.' },
    { label: 'Empuja', description: 'Extiende los brazos de forma controlada.' },
  ],
  coachingCue: 'Apoya bien los pies y controla la bajada antes de empujar.',
  preparation: 'Túmbate con los pies firmes, escápulas apoyadas y mancuernas sobre el pecho.',
  execution: 'Baja las mancuernas a los lados del pecho con control y empuja hasta extender los brazos sin bloquearlos con fuerza.',
  breathing: 'Inspira al bajar y expulsa el aire durante el empuje.',
  commonMistakes: ['Perder el apoyo de los pies', 'Abrir demasiado los codos', 'Bajar rápido sin control'],
  sets: [
    { target: '3 × 8 repeticiones · RPE 7', rest: '90 s' },
  ],
});

const createSeatedRow = (): Exercise => ({
  id: 'remo-sentado',
  name: 'Remo sentado en polea',
  equipment: 'Polea baja y agarre',
  equipmentSetup: 'Polea baja, agarre cómodo y asiento con los pies firmemente apoyados.',
  techniqueSteps: [
    { label: 'Siéntate', description: 'Coloca los pies y mantén el tronco erguido.' },
    { label: 'Rema', description: 'Lleva el agarre hacia el abdomen con los codos atrás.' },
    { label: 'Vuelve', description: 'Extiende los brazos lento sin perder la postura.' },
  ],
  coachingCue: 'Acerca los codos al cuerpo sin encoger los hombros.',
  preparation: 'Siéntate erguido, fija los pies y toma el agarre con los brazos extendidos de forma cómoda.',
  execution: 'Lleva el agarre hacia el abdomen mientras juntas suavemente las escápulas; vuelve lento al inicio.',
  breathing: 'Suelta el aire al remar e inspira al volver.',
  commonMistakes: ['Tirar con impulso del tronco', 'Elevar los hombros', 'Acortar la vuelta del movimiento'],
  sets: [
    { target: '3 × 10 repeticiones · RPE 7', rest: '75 s' },
  ],
});

const createStepUp = (): Exercise => ({
  id: 'subida-cajon',
  name: 'Subida al cajón',
  equipment: 'Cajón bajo y estable',
  equipmentSetup: 'Un cajón firme y bajo que te permita mantener la pelvis nivelada.',
  techniqueSteps: [
    { label: 'Apoya', description: 'Coloca todo el pie sobre el cajón.' },
    { label: 'Sube', description: 'Empuja el cajón con esa pierna sin impulsarte atrás.' },
    { label: 'Baja', description: 'Desciende despacio y recupera una posición estable.' },
  ],
  coachingCue: 'Empuja con el pie que está sobre el cajón y sube con control.',
  preparation: 'Elige una altura estable que te permita mantener la pelvis nivelada.',
  execution: 'Apoya todo el pie, sube sin impulsarte con la pierna de atrás y baja despacio.',
  breathing: 'Respira de forma continua, expulsando aire al subir.',
  commonMistakes: ['Impulsarse con la pierna de atrás', 'Dejar caer la rodilla hacia dentro', 'Usar una altura excesiva'],
  sets: [
    { target: '3 × 8 por lado · RPE 6', rest: '75 s' },
  ],
});

const createDeadBug = (): Exercise => ({
  id: 'dead-bug',
  name: 'Dead bug',
  equipment: 'Esterilla',
  equipmentSetup: 'Una esterilla o superficie cómoda que no se deslice.',
  techniqueSteps: [
    { label: 'Prepárate', description: 'Boca arriba, rodillas sobre caderas y brazos al techo.' },
    { label: 'Extiende', description: 'Aleja una pierna y el brazo contrario con control.' },
    { label: 'Alterna', description: 'Vuelve al centro y cambia de lado sin prisa.' },
  ],
  coachingCue: 'Mueve lento y conserva la espalda baja en una posición cómoda.',
  preparation: 'Túmbate boca arriba con rodillas y caderas flexionadas, brazos hacia el techo.',
  execution: 'Extiende de forma alterna una pierna y el brazo contrario hasta donde mantengas control; vuelve y cambia.',
  breathing: 'Expulsa el aire al extender y toma aire al regresar.',
  commonMistakes: ['Arquear la espalda baja', 'Moverse demasiado rápido', 'Forzar el rango de la pierna'],
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
