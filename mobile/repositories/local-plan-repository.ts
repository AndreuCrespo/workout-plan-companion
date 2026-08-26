import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockPlan } from '@/data/mock-plan';
import type { PlanProposal } from '@/domain/plan-proposal';
import type { PlanPublication } from '@/domain/plan-publication';
import type { Exercise, MonthlyPlan, PlanWeek, WorkoutSession } from '@/domain/models';
import type { PlanRepository } from '@/repositories/plan-repository';

const STORAGE_KEY = '@gimnasio/published-plans';

const initialPublication: PlanPublication = {
  id: 'publicacion-plan-fuerza-base-01',
  plan: mockPlan,
  publishedAt: '2026-01-01T00:00:00.000Z',
  sourceProposalId: null,
  request: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPlanPublication(value: unknown): value is PlanPublication {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.publishedAt === 'string' &&
    (typeof value.sourceProposalId === 'string' || value.sourceProposalId === null) &&
    isRecord(value.plan) &&
    typeof value.plan.id === 'string' &&
    typeof value.plan.name === 'string' &&
    typeof value.plan.version === 'string' &&
    Array.isArray(value.plan.weeks) &&
    value.plan.weeks.length === 4 &&
    (value.request === null || isRecord(value.request))
  );
}

async function readHistory(): Promise<PlanPublication[]> {
  try {
    const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storedHistory) {
      return [initialPublication];
    }

    const parsedHistory: unknown = JSON.parse(storedHistory);
    const history = Array.isArray(parsedHistory)
      ? parsedHistory.filter(isPlanPublication)
      : [];

    return history.length > 0 ? history : [initialPublication];
  } catch {
    return [initialPublication];
  }
}

function cloneExercise(exercise: Exercise): Exercise {
  return {
    ...exercise,
    techniqueSteps: exercise.techniqueSteps.map((step) => ({ ...step })),
    commonMistakes: [...exercise.commonMistakes],
    sets: exercise.sets.map((set) => ({ ...set })),
  };
}

function cloneSession(session: WorkoutSession, sessionId: string): WorkoutSession {
  return {
    ...session,
    id: sessionId,
    status: 'upcoming',
    warmUp: [...session.warmUp],
    exercises: session.exercises.map(cloneExercise),
  };
}

function publishedPlanFromProposal(proposal: PlanProposal, versionNumber: number, publishedAt: string): MonthlyPlan {
  const planId = `plan-${publishedAt.replaceAll(/[-:.TZ]/g, '').slice(0, 14)}-v${versionNumber}`;
  const weeks: PlanWeek[] = proposal.plan.weeks.map((week, weekIndex) => ({
    ...week,
    sessions: week.sessions.map((session, sessionIndex) => (
      cloneSession(session, `${planId}-semana-${weekIndex + 1}-sesion-${sessionIndex + 1}`)
    )),
  }));

  return {
    id: planId,
    name: proposal.plan.name,
    version: `Versión ${versionNumber} · 4 semanas`,
    weeks,
  };
}

class LocalPlanRepository implements PlanRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  async getActive(): Promise<PlanPublication> {
    const history = await readHistory();
    return history.at(-1) ?? initialPublication;
  }

  async getHistory(): Promise<PlanPublication[]> {
    return readHistory();
  }

  async publish(proposal: PlanProposal): Promise<PlanPublication> {
    const result = this.writeQueue.then(async () => {
      const history = await readHistory();
      const activePublication = history.at(-1) ?? initialPublication;

      if (
        proposal.sourcePlanId !== activePublication.plan.id ||
        proposal.sourcePlanVersion !== activePublication.plan.version
      ) {
        throw new Error('La propuesta ya no corresponde al plan activo. Genera y revisa un nuevo borrador antes de publicarlo.');
      }

      const publishedAt = new Date().toISOString();
      const publication: PlanPublication = {
        id: `publicacion-${publishedAt.replaceAll(/[-:.TZ]/g, '').slice(0, 14)}-v${history.length + 1}`,
        plan: publishedPlanFromProposal(proposal, history.length + 1, publishedAt),
        publishedAt,
        sourceProposalId: proposal.id,
        request: { ...proposal.request },
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...history, publication]));
      return publication;
    });

    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }
}

export const planRepository = new LocalPlanRepository();
