import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  availabilityOptions,
  durationOptions,
  equipmentOptions,
  experienceOptions,
  primaryGoalOptions,
  trainingPreferenceOptions,
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

function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.firstName === 'string' &&
    isOptionValue(primaryGoalOptions, value.primaryGoal) &&
    isOptionValue(experienceOptions, value.experience) &&
    isOptionValue(availabilityOptions, value.availability) &&
    isOptionValue(durationOptions, value.sessionDurationMinutes) &&
    isOptionValue(equipmentOptions, value.equipment) &&
    typeof value.limitations === 'string' &&
    isOptionValue(unitOptions, value.units) &&
    isOptionValue(trainingPreferenceOptions, value.trainingPreference) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

class LocalProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile | null> {
    try {
      const storedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

      if (!storedProfile) {
        return null;
      }

      const parsedProfile: unknown = JSON.parse(storedProfile);
      return isUserProfile(parsedProfile) ? parsedProfile : null;
    } catch {
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export const profileRepository = new LocalProfileRepository();
