import type { ProfileDraft, UserProfile } from '@/domain/models';

export function createProfileDraft(): ProfileDraft {
  return {
    firstName: '',
    primaryGoal: 'strength',
    experience: 'beginner',
    availability: 'three-days',
    sessionDurationMinutes: 60,
    equipment: 'full-gym',
    limitations: '',
    units: 'metric',
    trainingPreference: 'guided',
  };
}

export function toProfileDraft(profile: UserProfile): ProfileDraft {
  return {
    firstName: profile.firstName,
    primaryGoal: profile.primaryGoal,
    experience: profile.experience,
    availability: profile.availability,
    sessionDurationMinutes: profile.sessionDurationMinutes,
    equipment: profile.equipment,
    limitations: profile.limitations,
    units: profile.units,
    trainingPreference: profile.trainingPreference,
  };
}
