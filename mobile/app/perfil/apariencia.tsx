import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import type { ThemeName } from '@/domain/models';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing, themes } from '@/theme/tokens';

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, themeName, setThemeName } = useAppTheme();

  return (
    <Screen>
      <ScreenHeader
        description="El cambio se aplica al instante y se guarda en este dispositivo."
        onBack={() => router.back()}
        title="Apariencia"
      />

      <View style={styles.options} accessibilityRole="radiogroup">
        {(Object.keys(themes) as ThemeName[]).map((name) => {
          const option = themes[name];
          const selected = name === themeName;
          return (
            <Pressable
              key={name}
              accessibilityHint="Aplica este tema a toda la aplicación"
              accessibilityLabel={`${option.label}${selected ? ', seleccionado' : ''}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setThemeName(name)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}>
              <View style={styles.optionCopy}>
                <AppText variant="heading">{option.label}</AppText>
                <AppText tone="secondary">
                  {name === 'verde-activo' ? 'Tema predeterminado cálido y claro.' : 'Tema oscuro con acento naranja.'}
                </AppText>
                <AppText tone={selected ? 'primary' : 'secondary'} variant="caption">
                  {selected ? 'Seleccionado' : 'Toca para seleccionarlo'}
                </AppText>
              </View>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.radio,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.primary,
                  },
                ]}>
                {selected ? <AppText style={{ color: theme.colors.onPrimary }} variant="bodyStrong">✓</AppText> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.card}>
        <AppText variant="bodyStrong">Preferencia local</AppText>
        <AppText tone="secondary" variant="caption">
          Más adelante, esta preferencia se sincronizará con tu perfil cuando exista una cuenta. Cambiar de plan no la modifica.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 132,
    padding: spacing.md,
  },
  optionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  radio: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  card: {
    gap: spacing.xs,
  },
});
