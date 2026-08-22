import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { ProfileDraft, UserProfile } from '@/domain/models';
import { profileRepository } from '@/repositories/local-profile-repository';

interface ProfileContextValue {
  profile: UserProfile | null;
  isHydrated: boolean;
  saveProfile: (draft: ProfileDraft) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateProfile() {
      const storedProfile = await profileRepository.getProfile();

      if (isMounted) {
        setProfile(storedProfile);
        setIsHydrated(true);
      }
    }

    void hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProfile = useCallback(
    async (draft: ProfileDraft) => {
      const now = new Date().toISOString();
      const nextProfile: UserProfile = {
        ...draft,
        firstName: draft.firstName.trim(),
        limitations: draft.limitations.trim(),
        createdAt: profile?.createdAt ?? now,
        updatedAt: now,
      };

      await profileRepository.saveProfile(nextProfile);
      setProfile(nextProfile);
    },
    [profile?.createdAt],
  );

  const value = useMemo(
    () => ({
      profile,
      isHydrated,
      saveProfile,
    }),
    [isHydrated, profile, saveProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile debe utilizarse dentro de ProfileProvider.');
  }

  return context;
}
