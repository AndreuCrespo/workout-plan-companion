import type { ReactNode, RefObject } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

interface ScreenProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewRef?: RefObject<ScrollView | null>;
}

export function Screen({ children, contentContainerStyle, scrollViewRef }: ScreenProps) {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});
