import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { mockPlan } from '@/data/mock-plan';
import type { PlanProposal } from '@/domain/plan-proposal';
import type { PlanPublication } from '@/domain/plan-publication';
import type { MonthlyPlan } from '@/domain/models';
import { planRepository } from '@/repositories/local-plan-repository';

interface PlanContextValue {
  activePublication: PlanPublication | null;
  history: PlanPublication[];
  isHydrated: boolean;
  plan: MonthlyPlan;
  publishProposal: (proposal: PlanProposal) => Promise<PlanPublication>;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: PropsWithChildren) {
  const [activePublication, setActivePublication] = useState<PlanPublication | null>(null);
  const [history, setHistory] = useState<PlanPublication[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydratePlans() {
      const publications = await planRepository.getHistory();

      if (isMounted) {
        setHistory(publications);
        setActivePublication(publications.at(-1) ?? null);
        setIsHydrated(true);
      }
    }

    void hydratePlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const publishProposal = useCallback(async (proposal: PlanProposal) => {
    const publication = await planRepository.publish(proposal);
    const publications = await planRepository.getHistory();

    setHistory(publications);
    setActivePublication(publication);

    return publication;
  }, []);

  const value = useMemo(
    () => ({
      activePublication,
      history,
      isHydrated,
      plan: activePublication?.plan ?? mockPlan,
      publishProposal,
    }),
    [activePublication, history, isHydrated, publishProposal],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext);

  if (!context) {
    throw new Error('usePlan debe utilizarse dentro de PlanProvider.');
  }

  return context;
}
