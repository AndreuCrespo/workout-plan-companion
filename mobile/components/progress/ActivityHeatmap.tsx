import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { ActivityDay } from '@/domain/models';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface ActivityHeatmapProps {
  days: ActivityDay[];
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const { theme } = useAppTheme();
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, (index + 1) * 7));

  return (
    <View accessibilityLabel="Actividad de las últimas doce semanas" style={styles.container}>
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.week}>
            {week.map((day) => {
              const level = day.completedSessions === 0 ? 0 : day.completedSessions === 1 ? 1 : 2;
              const backgroundColor = level === 0 ? theme.colors.surfaceElevated : level === 1 ? theme.colors.primarySoft : theme.colors.primary;
              const text = day.completedSessions === 0 ? 'sin sesiones' : `${day.completedSessions} ${day.completedSessions === 1 ? 'sesión' : 'sesiones'}`;

              return (
                <View
                  accessibilityLabel={`${day.date}: ${text}`}
                  key={day.date}
                  style={[styles.day, { backgroundColor, borderColor: level === 0 ? theme.colors.border : theme.colors.primaryStrong }]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <AppText tone="secondary" variant="caption">Menos actividad</AppText>
        <View style={styles.legendSwatches}>
          {[theme.colors.surfaceElevated, theme.colors.primarySoft, theme.colors.primary].map((color, index) => (
            <View key={`${color}-${index}`} style={[styles.legendDay, { backgroundColor: color, borderColor: theme.colors.border }]} />
          ))}
        </View>
        <AppText tone="secondary" variant="caption">Más actividad</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'space-between',
  },
  week: {
    gap: 3,
  },
  day: {
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  legendSwatches: {
    flexDirection: 'row',
    gap: 3,
  },
  legendDay: {
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 14,
    width: 14,
  },
});
