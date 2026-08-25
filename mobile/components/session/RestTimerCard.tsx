import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { formatDuration } from '@/domain/rest-timer';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface RestTimerCardProps {
  exerciseName: string;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onDismiss: () => void;
}

export function RestTimerCard({
  exerciseName,
  remainingSeconds,
  isRunning,
  isFinished,
  onPause,
  onResume,
  onRestart,
  onDismiss,
}: RestTimerCardProps) {
  const { theme } = useAppTheme();

  return (
    <View accessibilityLiveRegion="polite" style={[styles.card, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
      <View style={styles.heading}>
        <View style={styles.copy}>
          <AppText tone="primary" variant="label">Descanso</AppText>
          <AppText variant="bodyStrong">{isFinished ? 'Listo para tu siguiente serie' : exerciseName}</AppText>
        </View>
        <AppText accessibilityLabel={`${formatDuration(remainingSeconds)} restantes`} variant="title">
          {formatDuration(remainingSeconds)}
        </AppText>
      </View>
      <View style={styles.actions}>
        <TimerAction label={isRunning ? 'Pausar' : 'Reanudar'} onPress={isRunning ? onPause : onResume} />
        <TimerAction label="Reiniciar" onPress={onRestart} />
        <TimerAction label="Omitir" onPress={onDismiss} />
      </View>
    </View>
  );
}

interface TimerActionProps {
  label: string;
  onPress: () => void;
}

function TimerAction({ label, onPress }: TimerActionProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, { borderColor: theme.colors.primaryStrong, opacity: pressed ? 0.72 : 1 }]}>
      <AppText tone="primary" variant="bodyStrong">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  action: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
});
