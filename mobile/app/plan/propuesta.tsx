import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { PlanConversationView } from '@/components/plan/PlanConversationView';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { createPlanProposal } from '@/domain/plan-proposal';
import { usePlan } from '@/plan/plan-context';
import { useProfile } from '@/profile/profile-context';
import { usePlanConversation } from '@/plan-conversation/use-plan-conversation';
import { planProposalRepository } from '@/repositories/local-plan-proposal-repository';
import { spacing } from '@/theme/tokens';

export default function PlanProposalScreen() {
  const router = useRouter();
  const { plan } = usePlan();
  const { profile } = useProfile();
  const { conversation, hasError, isLoading, isSaving, respond, restart } = usePlanConversation(plan, profile);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [generationError, setGenerationError] = useState(false);

  if (!profile) {
    return null;
  }

  async function generateProposal() {
    if (!conversation || conversation.status !== 'ready') {
      return;
    }

    setIsGeneratingProposal(true);
    setGenerationError(false);

    try {
      const proposal = createPlanProposal(conversation, plan);
      await planProposalRepository.save(proposal);
      router.push('/plan/borrador');
    } catch {
      setGenerationError(true);
    } finally {
      setIsGeneratingProposal(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        description="Comparte el contexto que debe respetar tu próximo ciclo."
        onBack={() => router.back()}
        title="Preparar próximo ciclo"
      />

      {isLoading ? (
        <Card style={styles.card}>
          <AppText variant="heading">Cargando tu conversación</AppText>
          <AppText tone="secondary">Recuperamos el borrador guardado en este dispositivo.</AppText>
        </Card>
      ) : null}

      {hasError || generationError ? (
        <Card style={styles.card}>
          <AppText variant="heading">No pudimos guardar el borrador</AppText>
          <AppText tone="secondary">Puedes volver a intentarlo; tus respuestas visibles no se han eliminado.</AppText>
        </Card>
      ) : null}

      {conversation && !isLoading ? (
        <PlanConversationView
          conversation={conversation}
          isGeneratingProposal={isGeneratingProposal}
          isSaving={isSaving}
          onGenerateProposal={() => void generateProposal()}
          onRestart={restart}
          onRespond={respond}
        />
      ) : null}

      {!conversation && !isLoading ? (
        <Card style={styles.card}>
          <AppText variant="heading">No pudimos iniciar la conversación</AppText>
          <PrimaryButton label="Volver a Mi plan" onPress={() => router.back()} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
});
