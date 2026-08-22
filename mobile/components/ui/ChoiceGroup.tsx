import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

export interface ChoiceGroupOption<TValue extends string | number> {
  value: TValue;
  label: string;
  description: string;
}

interface ChoiceGroupProps<TValue extends string | number> {
  label: string;
  description?: string;
  options: readonly ChoiceGroupOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}

export function ChoiceGroup<TValue extends string | number>({
  label,
  description,
  options,
  value,
  onValueChange,
}: ChoiceGroupProps<TValue>) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.group}>
      <View style={styles.heading}>
        <AppText variant="heading">{label}</AppText>
        {description ? <AppText tone="secondary" variant="caption">{description}</AppText> : null}
      </View>

      <View accessibilityLabel={label} accessibilityRole="radiogroup" style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={String(option.value)}
              accessibilityHint={option.description}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onValueChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: selected ? theme.colors.primaryStrong : theme.colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}>
              <View style={styles.copy}>
                <AppText variant="bodyStrong">{option.label}</AppText>
                <AppText tone="secondary" variant="caption">{option.description}</AppText>
              </View>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no"
                style={[
                  styles.indicator,
                  {
                    borderColor: theme.colors.primaryStrong,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  },
                ]}>
                {selected ? <AppText style={{ color: theme.colors.onPrimary }} variant="caption">✓</AppText> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  heading: {
    gap: spacing.xxs,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  indicator: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
});
