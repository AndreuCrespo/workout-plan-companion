import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { PlanProposal } from '@/domain/plan-proposal';
import { planProposalRepository } from '@/repositories/local-plan-proposal-repository';

interface UsePlanProposalResult {
  proposal: PlanProposal | null;
  isLoading: boolean;
  hasError: boolean;
}

export function usePlanProposal(): UsePlanProposalResult {
  const [proposal, setProposal] = useState<PlanProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProposal() {
        setIsLoading(true);
        setHasError(false);

        try {
          const storedProposal = await planProposalRepository.getCurrent();

          if (isMounted) {
            setProposal(storedProposal);
          }
        } catch {
          if (isMounted) {
            setHasError(true);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      void loadProposal();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  return { proposal, isLoading, hasError };
}
