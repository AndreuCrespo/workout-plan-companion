import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SessionSummaryCard } from '@/components/ui/SessionSummaryCard';
import { usePlan } from '@/plan/plan-context';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

function publishedDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PlanScreen() {
  const router = useRouter();
  const { history, plan } = usePlan();
  const { theme } = useAppTheme();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const selectedWeek = plan.weeks[selectedWeekIndex];

  function openSession(sessionId: string) {
    router.push({ pathname: '/sesion/[sessionId]', params: { sessionId } });
  }

  function openPlanConversation() {
    router.push('/plan/propuesta');
  }

  return (
    <Screen>
      <ScreenHeader description={plan.version} title="Mi plan" />

      <View style={styles.planMeta}>
        <Pill label={plan.name} tone="primary" />
        <AppText tone="secondary" variant="caption">
          Publicado · Tu historial no se modifica
        </AppText>
      </View>

      {history.length > 1 ? (
        <View style={styles.section}>
          <AppText variant="heading">Historial de planes</AppText>
          {history.slice(0, -1).reverse().map((publication) => (
            <Card key={publication.id} style={styles.historyCard}>
              <AppText variant="bodyStrong">{publication.plan.version}</AppText>
              <AppText tone="secondary" variant="caption">
                {publication.plan.name} · Publicado {publishedDateLabel(publication.publishedAt)}
              </AppText>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={[styles.planConversationCard, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
        <View style={styles.planConversationCopy}>
          <AppText variant="heading">Prepara tu próximo ciclo</AppText>
          <AppText tone="secondary">Habla con el asistente sobre lo que quieres cambiar o mantener.</AppText>
        </View>
        <PrimaryButton label="Hablar con el asistente" onPress={openPlanConversation} variant="secondary" />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Elige una semana</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekPicker}>
          {plan.weeks.map((week, index) => {
            const isSelected = index === selectedWeekIndex;
            return (
              <Pressable
                key={week.number}
                accessibilityLabel={`Semana ${week.number}. ${week.goal}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedWeekIndex(index)}
                style={({ pressed }) => [
                  styles.weekButton,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}>
                <AppText style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.text }} variant="bodyStrong">
                  Semana {week.number}
                </AppText>
                {isSelected ? (
                  <AppText style={{ color: theme.colors.onPrimary }} variant="caption">
                    Seleccionada
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <AppText variant="heading">Semana {selectedWeek.number}</AppText>
          <AppText tone="secondary" variant="caption">
            {selectedWeek.goal}
          </AppText>
        </View>
        {selectedWeek.sessions.map((session) => (
          <SessionSummaryCard key={session.id} actionLabel="Ver sesión" onPress={() => openSession(session.id)} session={session} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  planMeta: {
    gap: spacing.sm,
  },
  historyCard: {
    gap: spacing.xxs,
  },
  section: {
    gap: spacing.sm,
  },
  planConversationCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  planConversationCopy: {
    gap: spacing.xxs,
  },
  weekPicker: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  weekButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    minHeight: 72,
    minWidth: 118,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionHeading: {
    gap: spacing.xxs,
  },
});
