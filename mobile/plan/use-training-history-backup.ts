import { useCallback, useEffect, useState } from 'react';

import type { WorkoutLog } from '@/domain/models';
import type { PlanPublication } from '@/domain/plan-publication';
import {
  trainingHistoryBackupRepository,
  type TrainingHistoryBackupResult,
  type TrainingHistoryBackupStatus,
} from '@/repositories/supabase-training-history-backup-repository';

interface UseTrainingHistoryBackupResult {
  backup: (publications: PlanPublication[], completedLogs: WorkoutLog[]) => Promise<TrainingHistoryBackupResult | null>;
  errorMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
  status: TrainingHistoryBackupStatus | null;
}

export function useTrainingHistoryBackup(userId: string | undefined): UseTrainingHistoryBackupResult {
  const [status, setStatus] = useState<TrainingHistoryBackupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!userId) {
        return;
      }

      try {
        const nextStatus = await trainingHistoryBackupRepository.getStatus(userId);
        if (isMounted) {
          setErrorMessage(null);
          setStatus(nextStatus);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('No pudimos consultar el estado de tus planes y registros privados. Tus datos locales no han cambiado.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const backup = useCallback(async (publications: PlanPublication[], completedLogs: WorkoutLog[]): Promise<TrainingHistoryBackupResult | null> => {
    if (!userId) {
      setErrorMessage('Inicia sesión antes de guardar planes y registros.');
      return null;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await trainingHistoryBackupRepository.save({ completedLogs, publications });
      setStatus({
        completedLogCount: completedLogs.length,
        lastImportedAt: new Date().toISOString(),
        planCount: publications.length,
      });
      return result;
    } catch {
      setErrorMessage('No pudimos completar la copia privada. Tus datos locales no han cambiado; inténtalo de nuevo.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  return { backup, errorMessage, isLoading, isSaving, status };
}
