import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  availabilityOptions,
  durationOptions,
  equipmentAccessOptions,
  primaryGoalOptions,
  trainingEmphasisOptions,
  trainingExperienceOptions,
  unitOptions,
} from '@/data/profile-options';
import type { ProfileOption } from '@/data/profile-options';
import type { UserProfile } from '@/domain/models';
import type { ProfileRepository } from '@/repositories/profile-repository';

const PROFILE_STORAGE_KEY = '@gimnasio/profile';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOptionValue<TValue extends string | number>(
  options: readonly ProfileOption<TValue>[],
  value: unknown,
): value is TValue {
  return options.some((option) => option.value === value);
}

function parseUserProfile(value: unknown): UserProfile | null {
  if (!isRecord(value)
    || typeof value.firstName !== 'string'
    || !isOptionValue(availabilityOptions, value.availability)
    || !isOptionValue(durationOptions, value.sessionDurationMinutes)
    || typeof value.limitations !== 'string'
    || !isOptionValue(unitOptions, value.units)
    || typeof value.createdAt !== 'string'
    || typeof value.updatedAt !== 'string') {
    return null;
  }

  return {
    availability: value.availability,
    createdAt: value.createdAt,
    equipmentAccess: isOptionValue(equipmentAccessOptions, value.equipmentAccess)
      ? value.equipmentAccess
      : 'full-gym',
    firstName: value.firstName,
    limitations: value.limitations,
    primaryGoal: isOptionValue(primaryGoalOptions, value.primaryGoal)
      ? value.primaryGoal
      : 'strength',
    sessionDurationMinutes: value.sessionDurationMinutes,
    trainingEmphasis: isOptionValue(trainingEmphasisOptions, value.trainingEmphasis)
      ? value.trainingEmphasis
      : 'compound-strength',
    trainingExperience: isOptionValue(trainingExperienceOptions, value.trainingExperience)
      ? value.trainingExperience
      : 'some-experience',
    units: value.units,
    updatedAt: value.updatedAt,
  };
}

class LocalProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

      if (!storedProfile) {
        return null;
      }

      const parsedProfile: unknown = JSON.parse(storedProfile);
      return parseUserProfile(parsedProfile);
    } catch {
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export const profileRepository = new LocalProfileRepository();
