import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { WorkoutSession } from '@/domain/models';
import { spacing } from '@/theme/tokens';

interface SessionSummaryCardProps {
  session: WorkoutSession;
  actionLabel: string;
  onPress: () => void;
  featured?: boolean;
}

export function SessionSummaryCard({ session, actionLabel, onPress, featured = false }: SessionSummaryCardProps) {
  return (
    <Card elevated={featured} style={styles.card}>
      <View style={styles.content}>
        <Pill label={session.dayLabel} tone={featured ? 'accent' : 'primary'} />
        <View style={styles.titleBlock}>
          <AppText variant={featured ? 'heading' : 'bodyStrong'}>{session.title}</AppText>
          <AppText tone="secondary" variant="caption">
            {session.focus}
          </AppText>
        </View>
        <AppText tone="secondary" variant="caption">
          {session.estimatedMinutes} min · {session.exercises.length} ejercicios
        </AppText>
      </View>
      <PrimaryButton accessibilityHint={`Abre ${session.title}`} label={actionLabel} onPress={onPress} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  titleBlock: {
    gap: spacing.xxs,
  },
});
