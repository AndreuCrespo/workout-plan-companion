import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { assistantConsentItems } from '@/domain/assistant-consent';
import { planAssistantRepository } from '@/repositories/supabase-plan-assistant-repository';
import { assistantConsentRepository } from '@/repositories/supabase-assistant-consent-repository';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

type ConversationMessage = {
  role: 'assistant' | 'user';
  text: string;
};

export default function PlanProposalScreen() {
  const router = useRouter();
  const { isConfigured, user } = useAuth();
  const { theme } = useAppTheme();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isConsentActive, setIsConsentActive] = useState(false);
  const [isConsentLoading, setIsConsentLoading] = useState(Boolean(user));
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConsent() {
      if (!user) {
        if (isMounted) {
          setIsConsentActive(false);
          setIsConsentLoading(false);
        }
        return;
      }

      setIsConsentLoading(true);

      try {
        const status = await assistantConsentRepository.getStatus(user.id);

        if (isMounted) {
          setIsConsentActive(status.isActive);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'No pudimos comprobar el consentimiento.');
        }
      } finally {
        if (isMounted) {
          setIsConsentLoading(false);
        }
      }
    }

    void loadConsent();

    return () => {
      isMounted = false;
    };
  }, [user]);

  function confirmConsent() {
    Alert.alert(
      'Usar el asistente IA',
      `Para preparar un borrador se enviarán:\n\n• ${assistantConsentItems.join('\n• ')}\n\nNo se envían notas, series individuales ni registros completos. Puedes retirar el consentimiento después.`,
      [
        { style: 'cancel', text: 'Ahora no' },
        { text: 'Aceptar y continuar', onPress: () => void grantConsent() },
      ],
    );
  }

  async function grantConsent() {
    setIsUpdatingConsent(true);
    setErrorMessage(null);

    try {
      await assistantConsentRepository.grant();
      setIsConsentActive(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos guardar el consentimiento.');
    } finally {
      setIsUpdatingConsent(false);
    }
  }

  async function revokeConsent() {
    setIsUpdatingConsent(true);
    setErrorMessage(null);

    try {
      await assistantConsentRepository.revoke();
      setConversationId(null);
      setIsConsentActive(false);
      setMessages([]);
      setProposalId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos retirar el consentimiento.');
    } finally {
      setIsUpdatingConsent(false);
    }
  }

  function revealComposer() {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 350);
  }

  async function sendMessage() {
    const message = draft.trim();

    if (!message || isSending) {
      return;
    }

    setDraft('');
    setErrorMessage(null);
    setMessages((currentMessages) => [...currentMessages, { role: 'user', text: message }]);
    setIsSending(true);

    try {
      const result = await planAssistantRepository.sendMessage({ conversationId, message });
      setConversationId(result.conversationId);
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', text: result.message }]);
      setProposalId(result.proposalId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos contactar con el asistente IA.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Screen scrollViewRef={scrollViewRef}>
      <ScreenHeader
        description="Explica qué quieres cambiar. La IA elegirá los ejercicios y preparará un borrador para que lo revises."
        onBack={() => router.back()}
        title="Asistente IA"
      />

      {!isConfigured ? (
        <Card style={styles.card}>
          <AppText variant="heading">Asistente IA no configurado</AppText>
          <AppText tone="secondary">
            Esta instalación no tiene la conexión remota necesaria. Tus planes y entrenamientos actuales siguen disponibles en este dispositivo.
          </AppText>
        </Card>
      ) : !user ? (
        <Card style={styles.card}>
          <AppText variant="heading">Conecta tu cuenta para continuar</AppText>
          <AppText tone="secondary">
            El asistente usa una sesión autenticada y solo enviará el contexto que aceptes de forma explícita.
          </AppText>
          <PrimaryButton label="Conectar con correo" onPress={() => router.push('/auth/iniciar-sesion')} />
        </Card>
      ) : isConsentLoading ? (
        <Card style={styles.card}>
          <AppText variant="heading">Comprobando tu consentimiento</AppText>
          <AppText tone="secondary">No enviaremos contexto hasta confirmarlo.</AppText>
        </Card>
      ) : !isConsentActive ? (
        <Card style={styles.card}>
          <AppText variant="heading">Tu confirmación es necesaria</AppText>
          <AppText tone="secondary">
            Antes de usar IA te mostraremos qué contexto se enviará. Podrás retirarlo cuando quieras.
          </AppText>
          <PrimaryButton disabled={isUpdatingConsent} label={isUpdatingConsent ? 'Guardando…' : 'Revisar y aceptar'} onPress={confirmConsent} />
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <AppText variant="heading">Describe tu próximo ciclo</AppText>
            <AppText tone="secondary">
              Por ejemplo: “quiero seguir ganando fuerza, pero cambiar el press de banca y entrenar solo tres días”.
            </AppText>
            <PrimaryButton
              disabled={isUpdatingConsent}
              label={isUpdatingConsent ? 'Actualizando…' : 'Retirar consentimiento'}
              onPress={() => void revokeConsent()}
              variant="secondary"
            />
          </Card>

          {messages.map((message, index) => (
            <Card
              key={`${message.role}-${index}`}
              style={[
                styles.message,
                {
                  backgroundColor: message.role === 'user' ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: message.role === 'user' ? theme.colors.primaryStrong : theme.colors.border,
                },
              ]}>
              <AppText tone="secondary" variant="caption">{message.role === 'user' ? 'Tú' : 'Asistente IA'}</AppText>
              <AppText>{message.text}</AppText>
            </Card>
          ))}

          {proposalId ? (
            <Card style={styles.card}>
              <AppText variant="heading">Borrador preparado</AppText>
              <AppText tone="secondary">
                Revísalo completo antes de confirmar. No cambiará tu plan activo hasta que lo actives expresamente.
              </AppText>
              <PrimaryButton label="Revisar borrador" onPress={() => router.push({ pathname: '/plan/borrador', params: { proposalId } })} variant="secondary" />
            </Card>
          ) : null}

          <Card style={styles.card}>
            <AppText variant="bodyStrong">Tu mensaje</AppText>
            <TextInput
              accessibilityLabel="Mensaje para el asistente IA"
              accessibilityHint="Describe qué quieres cambiar o mantener en tu próximo plan"
              multiline
              onFocus={revealComposer}
              onChangeText={setDraft}
              placeholder="Cuéntame qué necesitas para el próximo ciclo"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={draft}
            />
            {errorMessage ? <AppText tone="secondary" variant="caption">{errorMessage}</AppText> : null}
            <PrimaryButton
              disabled={isSending || draft.trim().length === 0}
              label={isSending ? 'Preparando borrador…' : 'Enviar al asistente'}
              onPress={() => void sendMessage()}
            />
          </Card>
        </>
      )}

      {errorMessage && (!user || !isConsentActive) ? (
        <Card style={styles.card}>
          <AppText tone="secondary" variant="caption">{errorMessage}</AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  message: {
    gap: spacing.xs,
  },
});
