import type { ProgressSnapshot } from '@/domain/models';

export const mockProgress: ProgressSnapshot = {
  adherencePercent: 83,
  completedSessions: 5,
  plannedSessions: 6,
  monthlyVolumeKg: 12480,
  volumeChangePercent: 8,
  exerciseName: 'Sentadilla goblet',
  exerciseTrend: [
    { label: 'S1', load: 20 },
    { label: 'S2', load: 22.5 },
    { label: 'S3', load: 22.5 },
    { label: 'S4', load: 25 },
  ],
  latestNote: null,
};
