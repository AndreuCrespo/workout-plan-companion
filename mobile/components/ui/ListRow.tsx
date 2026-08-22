import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface ListRowProps {
  label: string;
  value: string;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function ListRow({ label, value, onPress, accessibilityHint }: ListRowProps) {
  const { theme } = useAppTheme();
  const content = (
    <>
      <View style={styles.textBlock}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText tone="secondary" variant="caption">
          {value}
        </AppText>
      </View>
      {onPress ? <AppText style={{ color: theme.colors.primaryStrong }} variant="heading">›</AppText> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={`${label}. ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.72 : 1 },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
