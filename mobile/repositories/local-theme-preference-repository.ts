import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ThemeName } from '@/domain/models';
import type { ThemePreferenceRepository } from '@/repositories/theme-preference-repository';

const THEME_STORAGE_KEY = '@gimnasio/theme-preference';

function isThemeName(value: string | null): value is ThemeName {
  return value === 'verde-activo' || value === 'grafito-naranja';
}

class LocalThemePreferenceRepository implements ThemePreferenceRepository {
  async getTheme(): Promise<ThemeName | null> {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      return isThemeName(storedTheme) ? storedTheme : null;
    } catch {
      return null;
    }
  }

  async saveTheme(themeName: ThemeName): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch {
      // La app conserva el tema actual aunque el almacenamiento local no esté disponible.
    }
  }
}

export const themePreferenceRepository = new LocalThemePreferenceRepository();
