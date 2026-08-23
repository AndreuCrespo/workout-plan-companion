import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { MonthlyPlan, ProgressSnapshot } from '@/domain/models';
import { progressRepository } from '@/repositories/local-progress-repository';

interface UseProgressSnapshotResult {
  progress: ProgressSnapshot | null;
  isLoading: boolean;
  hasError: boolean;
}

export function useProgressSnapshot(plan: MonthlyPlan): UseProgressSnapshotResult {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadProgress() {
        setIsLoading(true);
        setHasError(false);

        try {
          const nextProgress = await progressRepository.getProgress(plan);

          if (isMounted) {
            setProgress(nextProgress);
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

      void loadProgress();

      return () => {
        isMounted = false;
      };
    }, [plan]),
  );

  return { progress, isLoading, hasError };
}
