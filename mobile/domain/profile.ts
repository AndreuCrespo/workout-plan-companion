import type { ProfileDraft, UserProfile } from '@/domain/models';

export function createProfileDraft(): ProfileDraft {
  return {
    firstName: '',
    availability: 'three-days',
    sessionDurationMinutes: 60,
    limitations: '',
    units: 'metric',
  };
}

export function toProfileDraft(profile: UserProfile): ProfileDraft {
  return {
    firstName: profile.firstName,
    availability: profile.availability,
    sessionDurationMinutes: profile.sessionDurationMinutes,
    limitations: profile.limitations,
    units: profile.units,
  };
}
