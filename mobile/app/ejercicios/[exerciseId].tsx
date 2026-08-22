import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ExerciseIllustrationPlaceholder } from '@/components/ui/ExerciseIllustrationPlaceholder';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { trainingRepository } from '@/repositories/local-training-repository';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const exercise = trainingRepository.getExercise(exerciseId);

  if (!exercise) {
    return (
      <Screen>
        <ScreenHeader onBack={() => router.back()} title="Ejercicio no disponible" />
        <Card style={styles.card}>
          <AppText variant="heading">No encontramos este ejercicio.</AppText>
          <PrimaryButton label="Volver a la sesión" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader description={exercise.equipment} onBack={() => router.back()} title={exercise.name} />
      <ExerciseIllustrationPlaceholder />

      <Card style={styles.card}>
        <Pill label="Punto técnico" tone="accent" />
        <AppText variant="bodyStrong">{exercise.coachingCue}</AppText>
      </Card>

      <View style={styles.section}>
        <AppText variant="heading">Cómo hacerlo</AppText>
        <Card style={styles.card}>
          <TechniqueRow label="Preparación" text={exercise.preparation} />
          <TechniqueRow label="Ejecución" text={exercise.execution} />
          <TechniqueRow label="Respiración" text={exercise.breathing} />
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Errores frecuentes</AppText>
        <Card style={styles.card}>
          {exercise.commonMistakes.map((mistake) => (
            <View key={mistake} style={styles.mistakeRow}>
              <AppText style={{ color: theme.colors.primaryStrong }} variant="bodyStrong">
                ·
              </AppText>
              <AppText style={styles.mistakeText}>{mistake}</AppText>
            </View>
          ))}
        </Card>
      </View>

    </Screen>
  );
}

interface TechniqueRowProps {
  label: string;
  text: string;
}

function TechniqueRow({ label, text }: TechniqueRowProps) {
  return (
    <View style={styles.techniqueRow}>
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText tone="secondary">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
  },
  techniqueRow: {
    gap: spacing.xxs,
  },
  mistakeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mistakeText: {
    flex: 1,
  },
});
