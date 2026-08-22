import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SessionSummaryCard } from '@/components/ui/SessionSummaryCard';
import { useProfile } from '@/profile/profile-context';
import { trainingRepository } from '@/repositories/local-training-repository';
import { spacing } from '@/theme/tokens';

export default function TodayScreen() {
  const router = useRouter();
  const { profile } = useProfile();

  if (!profile) {
    return null;
  }

  const plan = trainingRepository.getPlan();
  const progress = trainingRepository.getProgress();
  const nextSession = trainingRepository.getNextSession();

  function openNextSession() {
    router.push({ pathname: '/sesion/[sessionId]', params: { sessionId: nextSession.id } });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText tone="secondary" variant="label">
          Hoy · {plan.version}
        </AppText>
        <AppText variant="display">{profile.firstName ? `Hola, ${profile.firstName}` : 'Hola'}</AppText>
        <AppText tone="secondary">Tu próxima sesión ya está preparada.</AppText>
      </View>

      <SessionSummaryCard actionLabel="Empezar sesión" featured onPress={openNextSession} session={nextSession} />

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="heading">Tu ritmo</AppText>
          <AppText tone="secondary" variant="caption">
            Ciclo actual
          </AppText>
        </View>
        <View style={styles.metrics}>
          <Card style={styles.metricCard}>
            <AppText variant="title">{progress.adherencePercent}%</AppText>
            <AppText tone="secondary" variant="caption">
              Adherencia
            </AppText>
          </Card>
          <Card style={styles.metricCard}>
            <AppText variant="title">2 días</AppText>
            <AppText tone="secondary" variant="caption">
              Racha actual
            </AppText>
          </Card>
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    gap: spacing.xxs,
    minHeight: 100,
    justifyContent: 'center',
  },
});
