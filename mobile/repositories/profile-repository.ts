import type { UserProfile } from '@/domain/models';

/**
 * Contrato local del perfil. Una futura implementación remota podrá sustituirlo
 * sin acoplar las pantallas a Supabase.
 */
export interface ProfileRepository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
}
