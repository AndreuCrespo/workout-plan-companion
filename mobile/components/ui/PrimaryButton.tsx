import { Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  accessibilityHint,
  disabled = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const { theme } = useAppTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.colors.primary : theme.colors.primarySoft,
          borderColor: theme.colors.primaryStrong,
          opacity: pressed || disabled ? 0.72 : 1,
        },
        style,
      ]}>
      <AppText
        variant="bodyStrong"
        style={{ color: isPrimary ? theme.colors.onPrimary : theme.colors.onSoft, textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
