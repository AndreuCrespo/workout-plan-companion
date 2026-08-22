import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/theme-context';
import { radius } from '@/theme/tokens';

interface ProgressBarProps {
  value: number;
  accessibilityLabel: string;
}

export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const { theme } = useAppTheme();
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <View accessibilityLabel={`${accessibilityLabel}: ${clampedValue}%`} accessibilityRole="progressbar" style={[styles.track, { backgroundColor: theme.colors.primarySoft }]}>
      <View style={[styles.value, { backgroundColor: theme.colors.primary, width: `${clampedValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.pill,
    width: '100%',
  },
  value: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
