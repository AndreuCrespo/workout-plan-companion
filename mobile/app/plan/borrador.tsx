import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { toLocalPublishedProposal, type RemotePlanProposal } from '@/domain/remote-plan-proposal';
import { notifyPlanPublication } from '@/notifications/plan-publication-notification';
import { usePlan } from '@/plan/plan-context';
import { remotePlanProposalRepository } from '@/repositories/remote-plan-proposal-repository';
import { spacing } from '@/theme/tokens';

export default function RemotePlanDraftScreen() {
  const router = useRouter();
  const { proposalId } = useLocalSearchParams<{ proposalId: string }>();
  const { plan, publishProposal } = usePlan();
  const [draft, setDraft] = useState<RemotePlanProposal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isServerPublished, setIsServerPublished] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!proposalId) {
        if (mounted) {
          setErrorMessage('No se indicó ningún borrador para revisar.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const loadedDraft = await remotePlanProposalRepository.getReviewable(proposalId);
        if (mounted) setDraft(loadedDraft);
      } catch (error) {
        if (mounted) setErrorMessage(error instanceof Error ? error.message : 'No pudimos cargar el borrador.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [proposalId]);

  function requestPublication() {
    Alert.alert(
      'Activar este plan mensual',
      'Al confirmar, este borrador se publicará como una nueva versión. Los planes y entrenamientos anteriores no se modificarán.',
      [
        { style: 'cancel', text: 'Seguir revisando' },
        { style: 'default', text: 'Confirmar plan', onPress: () => void publish() },
      ],
    );
  }

  async function publish() {
    if (!draft || isPublishing) return;
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      if (!isServerPublished) {
        await remotePlanProposalRepository.publish(draft.id);
        setIsServerPublished(true);
      }
      await publishProposal(toLocalPublishedProposal(draft, plan));
      void notifyPlanPublication(draft.name).catch(() => undefined);
      router.replace('/plan');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos activar el plan.');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader description="Comprueba las cuatro semanas antes de activar una versión nueva." onBack={() => router.back()} title="Revisar borrador" />
      {isLoading ? <Card><AppText variant="heading">Cargando borrador…</AppText></Card> : null}
      {errorMessage ? <Card><AppText tone="secondary">{errorMessage}</AppText></Card> : null}
      {draft ? <>
        <Card style={styles.card}>
          <AppText variant="heading">{draft.name}</AppText>
          <AppText tone="secondary">Este borrador no está activo hasta que lo confirmes.</AppText>
        </Card>
        <Card style={styles.card}>
          <AppText variant="bodyStrong">Cambios propuestos</AppText>
          {draft.changes.map((change) => <AppText key={change} tone="secondary">• {change}</AppText>)}
        </Card>
        <Card style={styles.card}>
          <AppText variant="bodyStrong">Antes de confirmar</AppText>
          {draft.reviewItems.map((item) => <AppText key={item} tone="secondary">• {item}</AppText>)}
        </Card>
        {draft.weeks.map((week) => <Card key={week.number} style={styles.card}>
          <AppText variant="heading">Semana {week.number}</AppText>
          <AppText tone="secondary">{week.goal}</AppText>
          {week.sessions.map((session) => <View key={`${week.number}-${session.title}`} style={styles.session}>
            <AppText variant="bodyStrong">{session.dayLabel} · {session.title}</AppText>
            <AppText tone="secondary">{session.focus} · {session.estimatedMinutes} min</AppText>
            {session.exercises.map((exercise, index) => {
              const name = draft.assistantExercises.find((candidate) => candidate.key === exercise.assistantExerciseKey)?.name ?? 'Ejercicio nuevo';
              return <AppText key={`${name}-${index}`} tone="secondary">• {name}: {exercise.sets.map((set) => set.target).join(' · ')}</AppText>;
            })}
          </View>)}
        </Card>)}
        <Card style={styles.card}>
          <AppText tone="secondary">Al confirmar, se crea una versión nueva. El plan anterior y los registros terminados se conservan.</AppText>
          <PrimaryButton disabled={isPublishing} label={isPublishing ? 'Activando plan…' : isServerPublished ? 'Reintentar guardar en este dispositivo' : 'Confirmar y activar plan'} onPress={isServerPublished ? () => void publish() : requestPublication} />
        </Card>
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  session: { gap: spacing.xs, paddingTop: spacing.sm },
});
