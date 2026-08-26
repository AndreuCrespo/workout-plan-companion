import { useCallback, useEffect, useState } from 'react';

import type { ThemeName, UserProfile } from '@/domain/models';
import { privateProfileBackupRepository } from '@/repositories/supabase-private-profile-backup-repository';

interface UsePrivateProfileBackupResult {
  backup: (profile: UserProfile, themeName: ThemeName) => Promise<boolean>;
  errorMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastBackupAt: string | null;
}

export function usePrivateProfileBackup(userId: string | undefined): UsePrivateProfileBackupResult {
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLastBackup() {
      if (!userId) {
        return;
      }

      try {
        const backupAt = await privateProfileBackupRepository.getLastBackupAt(userId);
        if (isMounted) {
          setErrorMessage(null);
          setLastBackupAt(backupAt);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('No pudimos consultar el estado de tu copia privada. Tus datos locales no han cambiado.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLastBackup();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const backup = useCallback(async (profile: UserProfile, themeName: ThemeName): Promise<boolean> => {
    if (!userId) {
      setErrorMessage('Inicia sesión antes de guardar una copia privada.');
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await privateProfileBackupRepository.save({ profile, themeName, userId });
      setLastBackupAt(new Date().toISOString());
      return true;
    } catch {
      setErrorMessage('No pudimos guardar la copia privada. Tus datos locales no han cambiado; inténtalo de nuevo.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  return { backup, errorMessage, isLoading, isSaving, lastBackupAt };
}
