import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

type PillTone = 'primary' | 'accent' | 'neutral';

interface PillProps {
  label: string;
  tone?: PillTone;
}

export function Pill({ label, tone = 'neutral' }: PillProps) {
  const { theme } = useAppTheme();
  const backgroundColor =
    tone === 'primary' ? theme.colors.primarySoft : tone === 'accent' ? theme.colors.accent : theme.colors.surfaceElevated;
  const color = tone === 'primary' ? theme.colors.primaryStrong : tone === 'accent' ? theme.colors.onAccent : theme.colors.textSecondary;

  return (
    <View accessibilityLabel={label} style={[styles.pill, { backgroundColor }]}>
      <AppText style={{ color }} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
