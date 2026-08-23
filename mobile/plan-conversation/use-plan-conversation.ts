import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { createPlanConversation, respondToPlanConversation } from '@/domain/plan-conversation';
import type { MonthlyPlan, UserProfile } from '@/domain/models';
import type { PlanConversation } from '@/domain/plan-conversation';
import { workoutLogRepository } from '@/repositories/local-workout-log-repository';
import { planConversationRepository } from '@/repositories/local-plan-conversation-repository';

interface UsePlanConversationResult {
  conversation: PlanConversation | null;
  isLoading: boolean;
  isSaving: boolean;
  hasError: boolean;
  respond: (text: string, suggestionId?: string) => void;
  restart: () => void;
}

export function usePlanConversation(plan: MonthlyPlan, profile: UserProfile | null): UsePlanConversationResult {
  const [conversation, setConversation] = useState<PlanConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const createConversation = useCallback(async () => {
    if (!profile) {
      return null;
    }

    const completedLogs = await workoutLogRepository.getCompletedLogs();
    return createPlanConversation({
      plan,
      profile,
      completedLogs: completedLogs.filter((log) => log.planId === plan.id),
    });
  }, [plan, profile]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadConversation() {
        setIsLoading(true);
        setHasError(false);

        try {
          const storedConversation = await planConversationRepository.getCurrent();
          const canResumeConversation = storedConversation?.request.sourcePlanId === plan.id && storedConversation.request.sourcePlanVersion === plan.version;
          const nextConversation = canResumeConversation ? storedConversation : await createConversation();

          if (nextConversation && !canResumeConversation) {
            await planConversationRepository.save(nextConversation);
          }

          if (isMounted) {
            setConversation(nextConversation);
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

      void loadConversation();

      return () => {
        isMounted = false;
      };
    }, [createConversation, plan.id, plan.version]),
  );

  const respond = useCallback(
    (text: string, suggestionId?: string) => {
      if (!conversation || isSaving) {
        return;
      }

      const nextConversation = respondToPlanConversation(conversation, { text, suggestionId });

      if (nextConversation === conversation) {
        return;
      }

      setConversation(nextConversation);
      setIsSaving(true);
      setHasError(false);
      void planConversationRepository.save(nextConversation).catch(() => setHasError(true)).finally(() => setIsSaving(false));
    },
    [conversation, isSaving],
  );

  const restart = useCallback(() => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setHasError(false);
    void createConversation()
      .then(async (nextConversation) => {
        if (!nextConversation) {
          return;
        }

        await planConversationRepository.save(nextConversation);
        setConversation(nextConversation);
      })
      .catch(() => setHasError(true))
      .finally(() => setIsSaving(false));
  }, [createConversation, isSaving]);

  return { conversation, isLoading, isSaving, hasError, respond, restart };
}
