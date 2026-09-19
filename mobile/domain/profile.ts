import type { ProfileDraft, UserProfile } from '@/domain/models';

export function createProfileDraft(): ProfileDraft {
  return {
    firstName: '',
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
    availability: profile.availability,
    sessionDurationMinutes: profile.sessionDurationMinutes,
    trainingEmphasis: profile.trainingEmphasis,
    limitations: profile.limitations,
    units: profile.units,
  };
}
