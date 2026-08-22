import { StyleSheet, Text } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/theme-context';

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label';
type TextTone = 'default' | 'secondary' | 'primary';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  const { theme } = useAppTheme();

  const colorByTone: Record<TextTone, TextStyle> = {
    default: { color: theme.colors.text },
    secondary: { color: theme.colors.textSecondary },
    primary: { color: theme.colors.primaryStrong }
  };

  return <Text {...props} style={[styles[variant], colorByTone[tone], style]} />;
}

const styles = StyleSheet.create({
  display: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 23,
  },
  bodyStrong: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
});
