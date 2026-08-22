import type { ThemeName } from '@/domain/models';

/**
 * Contrato local preparado para sustituirse por el perfil remoto cuando exista cuenta.
 */
export interface ThemePreferenceRepository {
  getTheme(): Promise<ThemeName | null>;
  saveTheme(themeName: ThemeName): Promise<void>;
}
