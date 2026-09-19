import type { ProfileDraft, UserProfile } from '@/domain/models';

export function createProfileDraft(): ProfileDraft {
  return {
    firstName: '',
    primaryGoal: 'strength',
    trainingExperience: 'some-experience',
    equipmentAccess: 'full-gym',
    availability: 'three-days',
    sessionDurationMinutes: 60,
    trainingEmphasis: 'compound-strength',
    limitations: '',
    units: 'metric',
  };
}

export function toProfileDraft(profile: UserProfile): ProfileDraft {
  return {
    firstName: profile.firstName,
    primaryGoal: profile.primaryGoal,
    trainingExperience: profile.trainingExperience,
    equipmentAccess: profile.equipmentAccess,
    availability: profile.availability,
    sessionDurationMinutes: profile.sessionDurationMinutes,
    trainingEmphasis: profile.trainingEmphasis,
    limitations: profile.limitations,
    units: profile.units,
  };
}
