import { StyleSheet, View } from 'react-native';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface CardProps extends PropsWithChildren, ViewProps {
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false, ...props }: CardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
