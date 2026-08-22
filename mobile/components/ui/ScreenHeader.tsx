import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, eyebrow, description, onBack }: ScreenHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable accessibilityLabel="Volver" accessibilityRole="button" hitSlop={8} onPress={onBack} style={styles.backButton}>
          <AppText style={{ color: theme.colors.primaryStrong }} variant="bodyStrong">
            ‹ Volver
          </AppText>
        </Pressable>
      ) : null}
      {eyebrow ? <AppText tone="secondary" variant="label">{eyebrow}</AppText> : null}
      <AppText variant="title">{title}</AppText>
      {description ? <AppText tone="secondary">{description}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
  },
});
