import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { loadForDisplay } from '@/domain/measurements';
import { calculateWorkoutSummary } from '@/domain/workout-summary';
import type { MeasurementUnits, WorkoutLog } from '@/domain/models';
import { spacing } from '@/theme/tokens';

interface SessionCompletionSummaryProps {
  log: WorkoutLog;
  displayUnits: MeasurementUnits;
  onOpenProgress: () => void;
}

export function SessionCompletionSummary({ log, displayUnits, onOpenProgress }: SessionCompletionSummaryProps) {
  const summary = calculateWorkoutSummary(log);
  const loadUnit = displayUnits === 'imperial' ? 'lb' : 'kg';

  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <AppText variant="heading">Resumen de la sesión</AppText>
        <AppText tone="secondary">Tu registro ya forma parte del historial de este plan.</AppText>
      </View>
      <View style={styles.metrics}>
        <Metric label="Series" value={`${summary.completedSets}/${summary.totalSets}`} />
        <Metric
          label="Volumen"
          value={`${loadForDisplay(summary.volumeKg, displayUnits).toLocaleString('es-ES')} ${loadUnit}`}
        />
        <Metric label="Feedback" value={`${summary.feedbackCount}`} />
      </View>
      {summary.durationMinutes ? (
        <AppText tone="secondary" variant="caption">Duración registrada: {summary.durationMinutes} min</AppText>
      ) : null}
      <PrimaryButton label="Ver mi progreso" onPress={onOpenProgress} variant="secondary" />
    </Card>
  );
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <AppText variant="bodyStrong">{value}</AppText>
      <AppText tone="secondary" variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  copy: {
    gap: spacing.xxs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    gap: spacing.xxs,
  },
});
