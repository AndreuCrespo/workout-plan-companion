import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { ExerciseTechniqueStep } from '@/domain/models';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface ExerciseStepGuideProps {
  steps: ExerciseTechniqueStep[];
}

export function ExerciseStepGuide({ steps }: ExerciseStepGuideProps) {
  const { theme } = useAppTheme();

  return (
    <Card accessibilityLabel="Guía paso a paso del ejercicio" style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <AppText variant="heading">Guía paso a paso</AppText>
          <AppText tone="secondary" variant="caption">
            Recorre el movimiento con calma y control.
          </AppText>
        </View>
        <AppText tone="secondary" variant="caption">
          {steps.length} pasos
        </AppText>
      </View>

      <View style={styles.steps}>
        {steps.map((step, index) => (
          <View key={step.label} style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.accent }]}>
              <AppText style={{ color: theme.colors.onAccent }} variant="bodyStrong">
                {index + 1}
              </AppText>
            </View>
            <View style={styles.stepCopy}>
              <AppText variant="bodyStrong">{step.label}</AppText>
              <AppText tone="secondary" variant="caption">
                {step.description}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  headingCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  steps: {
    gap: spacing.md,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepNumber: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepCopy: {
    flex: 1,
    gap: spacing.xxs,
    paddingTop: spacing.xxs,
  },
});
