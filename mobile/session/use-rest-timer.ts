import { useCallback, useEffect, useState } from 'react';

import { restDurationInSeconds } from '@/domain/rest-timer';

interface RestTimerState {
  exerciseName: string;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

interface UseRestTimerResult {
  timer: RestTimerState | null;
  start: (exerciseName: string, rest: string) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  dismiss: () => void;
}

export function useRestTimer(): UseRestTimerResult {
  const [timer, setTimer] = useState<RestTimerState | null>(null);

  useEffect(() => {
    if (!timer?.isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((currentTimer) => {
        if (!currentTimer || !currentTimer.isRunning) {
          return currentTimer;
        }

        const remainingSeconds = currentTimer.remainingSeconds - 1;

        return {
          ...currentTimer,
          remainingSeconds: Math.max(remainingSeconds, 0),
          isRunning: remainingSeconds > 0,
          isFinished: remainingSeconds <= 0,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer?.isRunning]);

  const start = useCallback((exerciseName: string, rest: string) => {
    const duration = restDurationInSeconds(rest);

    if (!duration) {
      return;
    }

    setTimer({
      exerciseName,
      initialSeconds: duration,
      remainingSeconds: duration,
      isRunning: true,
      isFinished: false,
    });
  }, []);

  const pause = useCallback(() => {
    setTimer((currentTimer) => currentTimer ? { ...currentTimer, isRunning: false } : null);
  }, []);

  const resume = useCallback(() => {
    setTimer((currentTimer) =>
      currentTimer && currentTimer.remainingSeconds > 0
        ? { ...currentTimer, isRunning: true, isFinished: false }
        : currentTimer,
    );
  }, []);

  const restart = useCallback(() => {
    setTimer((currentTimer) =>
      currentTimer
        ? {
            ...currentTimer,
            remainingSeconds: currentTimer.initialSeconds,
            isRunning: true,
            isFinished: false,
          }
        : null,
    );
  }, []);

  const dismiss = useCallback(() => setTimer(null), []);

  return { timer, start, pause, resume, restart, dismiss };
}
