import type { ThemeName, UserProfile } from '@/domain/models';
import { supabase } from '@/lib/supabase';

export interface PrivateProfileBackupInput {
  profile: UserProfile;
  themeName: ThemeName;
  userId: string;
}

export interface PrivateProfileBackupRepository {
  getLastBackupAt(userId: string): Promise<string | null>;
  save(input: PrivateProfileBackupInput): Promise<void>;
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  return supabase;
}

class SupabasePrivateProfileBackupRepository implements PrivateProfileBackupRepository {
  async getLastBackupAt(userId: string): Promise<string | null> {
    const client = getClient();
    const [profileResult, preferenceResult] = await Promise.all([
      client.from('profiles').select('updated_at').eq('user_id', userId).maybeSingle(),
      client.from('user_preferences').select('updated_at').eq('user_id', userId).maybeSingle(),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (preferenceResult.error) {
      throw preferenceResult.error;
    }

    if (!profileResult.data || !preferenceResult.data) {
      return null;
    }

    return preferenceResult.data.updated_at;
  }

  async save({ profile, themeName, userId }: PrivateProfileBackupInput): Promise<void> {
    const client = getClient();
    const { error: profileError } = await client.from('profiles').upsert(
      {
        availability: profile.availability,
        first_name: profile.firstName,
        limitations: profile.limitations,
        session_duration_minutes: profile.sessionDurationMinutes,
        units: profile.units,
        user_id: userId,
      },
      { onConflict: 'user_id' },
    );

    if (profileError) {
      throw profileError;
    }

    const { error: preferenceError } = await client.from('user_preferences').upsert(
      {
        theme_name: themeName,
        user_id: userId,
      },
      { onConflict: 'user_id' },
    );

    if (preferenceError) {
      throw preferenceError;
    }
  }
}

export const privateProfileBackupRepository = new SupabasePrivateProfileBackupRepository();
