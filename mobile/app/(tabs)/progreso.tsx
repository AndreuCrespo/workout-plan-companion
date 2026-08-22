import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { trainingRepository } from '@/repositories/local-training-repository';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

export default function ProgressScreen() {
  const { theme } = useAppTheme();
  const progress = trainingRepository.getProgress();
  const maxLoad = Math.max(...progress.exerciseTrend.map((point) => point.load));

  return (
    <Screen>
      <ScreenHeader description="Una vista simple de tu constancia y cargas registradas." title="Progreso" />

      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.copyBlock}>
            <AppText variant="heading">Adherencia del ciclo</AppText>
            <AppText tone="secondary" variant="caption">
              {progress.completedSessions} de {progress.plannedSessions} sesiones completadas
            </AppText>
          </View>
          <AppText variant="title">{progress.adherencePercent}%</AppText>
        </View>
        <ProgressBar accessibilityLabel="Adherencia del ciclo" value={progress.adherencePercent} />
      </Card>

      <View style={styles.metrics}>
        <Card style={styles.metricCard}>
          <AppText variant="title">{progress.monthlyVolumeKg.toLocaleString('es-ES')} kg</AppText>
          <AppText tone="secondary" variant="caption">
            Volumen registrado
          </AppText>
        </Card>
        <Card style={styles.metricCard}>
          <AppText variant="title">+{progress.volumeChangePercent}%</AppText>
          <AppText tone="secondary" variant="caption">
            Frente al ciclo anterior
          </AppText>
        </Card>
      </View>

      <Card style={styles.card}>
        <AppText variant="heading">Evolución por ejercicio</AppText>
        <AppText tone="secondary" variant="caption">
          {progress.exerciseName} · mejor serie registrada
        </AppText>
        <View accessibilityLabel={`Evolución de ${progress.exerciseName}`} style={styles.chart}>
          {progress.exerciseTrend.map((point) => (
            <View key={point.label} style={styles.chartColumn}>
              <AppText variant="caption">{point.load} kg</AppText>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.primarySoft }]}>
                <View style={[styles.bar, { backgroundColor: theme.colors.primary, height: `${(point.load / maxLoad) * 100}%` }]} />
              </View>
              <AppText tone="secondary" variant="caption">
                {point.label}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.emptyCard}>
        <AppText variant="heading">Notas de entrenamiento</AppText>
        <AppText tone="secondary">
          {progress.latestNote ?? 'Aún no hay notas registradas. Podrás añadir una al terminar una sesión.'}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  copyBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    gap: spacing.xxs,
    minHeight: 108,
    justifyContent: 'center',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 176,
    paddingTop: spacing.sm,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    borderRadius: 6,
    height: 108,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    borderRadius: 6,
    width: '100%',
  },
  emptyCard: {
    gap: spacing.xs,
  },
});
