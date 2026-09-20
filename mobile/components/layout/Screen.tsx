import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
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
  const internalScrollViewRef = useRef<ScrollView>(null);
  const resolvedScrollViewRef = scrollViewRef ?? internalScrollViewRef;

  function revealFocusedInput(target: number) {
    setTimeout(() => {
      resolvedScrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(target, spacing.md, true);
    }, 300);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView
          ref={resolvedScrollViewRef}
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          onFocus={(event) => revealFocusedInput(event.target as unknown as number)}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
