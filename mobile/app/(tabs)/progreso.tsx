import { StyleSheet, View } from 'react-native';

import { ActivityHeatmap } from '@/components/progress/ActivityHeatmap';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { convertKilogramsForDisplay } from '@/domain/progress';
import { useProfile } from '@/profile/profile-context';
import { useProgressSnapshot } from '@/progress/use-progress-snapshot';
import { trainingRepository } from '@/repositories/local-training-repository';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

function formatRecordedDate(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function ProgressScreen() {
  const { theme } = useAppTheme();
  const { profile } = useProfile();
  const plan = trainingRepository.getPlan();
  const { progress, isLoading, hasError } = useProgressSnapshot(plan);

  if (!profile) {
    return null;
  }

  const loadUnit = profile.units === 'imperial' ? 'lb' : 'kg';
  const maxLoadKg = Math.max(...(progress?.exerciseTrend.map((point) => point.loadKg) ?? [1]), 1);

  return (
    <Screen>
      <ScreenHeader description="Tus datos se actualizan al guardar una sesión." title="Progreso" />

      {isLoading ? (
        <Card style={styles.card}>
          <AppText variant="heading">Cargando tu progreso</AppText>
          <AppText tone="secondary">Leemos las sesiones guardadas en este dispositivo.</AppText>
        </Card>
      ) : null}

      {hasError ? (
        <Card style={styles.card}>
          <AppText variant="heading">No pudimos cargar el progreso</AppText>
          <AppText tone="secondary">Vuelve a abrir esta pestaña para intentarlo de nuevo.</AppText>
        </Card>
      ) : null}

      {progress && !isLoading && !hasError ? (
        <>
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

          {progress.completedSessions === 0 ? (
            <Card style={styles.emptyCard}>
              <AppText variant="heading">Tu progreso empezará aquí</AppText>
              <AppText tone="secondary">
                Completa una sesión y guarda cargas, repeticiones o una nota para ver tu evolución real.
              </AppText>
            </Card>
          ) : (
            <>
              <Card style={styles.card}>
                <View style={styles.copyBlock}>
                  <AppText variant="heading">Actividad reciente</AppText>
                  <AppText tone="secondary" variant="caption">Sesiones completadas en las últimas 12 semanas</AppText>
                </View>
                <ActivityHeatmap days={progress.activityDays} />
              </Card>

              <View style={styles.metrics}>
                <Card style={styles.metricCard}>
                  <AppText variant="title">
                    {convertKilogramsForDisplay(progress.monthlyVolumeKg, profile.units).toLocaleString('es-ES')} {loadUnit}
                  </AppText>
                  <AppText tone="secondary" variant="caption">
                    Volumen registrado
                  </AppText>
                </Card>
                <Card style={styles.metricCard}>
                  <AppText variant="title">{progress.completedSessions}</AppText>
                  <AppText tone="secondary" variant="caption">
                    Sesiones guardadas
                  </AppText>
                </Card>
              </View>

              {progress.personalRecords.length > 0 ? (
                <Card style={styles.card}>
                  <View style={styles.copyBlock}>
                    <AppText variant="heading">Mejores marcas</AppText>
                    <AppText tone="secondary" variant="caption">Estimación basada en una serie registrada de 1 a 12 repeticiones</AppText>
                  </View>
                  {progress.personalRecords.slice(0, 3).map((record) => (
                    <View key={record.exerciseId} style={[styles.recordRow, { borderTopColor: theme.colors.border }]}>
                      <View style={styles.copyBlock}>
                        <AppText variant="bodyStrong">{record.exerciseName}</AppText>
                        <AppText tone="secondary" variant="caption">
                          {convertKilogramsForDisplay(record.loadKg, profile.units)} {loadUnit} × {record.repetitions} · {formatRecordedDate(record.recordedAt)}
                        </AppText>
                      </View>
                      <View style={styles.recordValue}>
                        <AppText variant="bodyStrong">{convertKilogramsForDisplay(record.estimatedOneRepMaxKg, profile.units)} {loadUnit}</AppText>
                        <AppText tone="secondary" variant="caption">1RM est.</AppText>
                      </View>
                    </View>
                  ))}
                </Card>
              ) : null}

              {progress.exerciseName && progress.exerciseTrend.length > 0 ? (
                <Card style={styles.card}>
                  <AppText variant="heading">Evolución por ejercicio</AppText>
                  <AppText tone="secondary" variant="caption">
                    {progress.exerciseName} · mejor serie registrada en cada sesión
                  </AppText>
                  <View accessibilityLabel={`Evolución de ${progress.exerciseName}`} style={styles.chart}>
                    {progress.exerciseTrend.map((point) => {
                      const displayedLoad = convertKilogramsForDisplay(point.loadKg, profile.units);

                      return (
                        <View key={point.id} style={styles.chartColumn}>
                          <AppText variant="caption">{displayedLoad} {loadUnit}</AppText>
                          <View style={[styles.barTrack, { backgroundColor: theme.colors.primarySoft }]}>
                            <View
                              style={[
                                styles.bar,
                                {
                                  backgroundColor: theme.colors.primary,
                                  height: `${Math.max((point.loadKg / maxLoadKg) * 100, 8)}%`,
                                },
                              ]}
                            />
                          </View>
                          <AppText tone="secondary" variant="caption">
                            {point.label}
                          </AppText>
                        </View>
                      );
                    })}
                  </View>
                  {progress.exerciseTrend.at(-1)?.estimatedOneRepMaxKg ? (
                    <AppText tone="secondary" variant="caption">
                      Última mejor serie: {convertKilogramsForDisplay(progress.exerciseTrend.at(-1)?.loadKg ?? 0, profile.units)} {loadUnit} ×{' '}
                      {progress.exerciseTrend.at(-1)?.repetitions} · 1RM estimado {convertKilogramsForDisplay(progress.exerciseTrend.at(-1)?.estimatedOneRepMaxKg ?? 0, profile.units)} {loadUnit}
                    </AppText>
                  ) : null}
                </Card>
              ) : null}

              <Card style={styles.emptyCard}>
                <AppText variant="heading">Notas de entrenamiento</AppText>
                <AppText tone="secondary">
                  {progress.latestNote ?? 'Aún no has añadido una nota al terminar una sesión.'}
                </AppText>
              </Card>
            </>
          )}
        </>
      ) : null}
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
  recordRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  recordValue: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
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
