import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

export function ExerciseIllustrationPlaceholder() {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel="Zona reservada para la ilustración o animación del ejercicio"
      style={[styles.container, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
      <AppText variant="heading">Ilustración del ejercicio</AppText>
      <AppText style={styles.text} tone="secondary" variant="caption">
        Espacio seguro para sustituir por una animación o imagen revisada.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 190,
    padding: spacing.lg,
  },
  text: {
    textAlign: 'center',
  },
});
