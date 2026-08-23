import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { planGoalLabel, trainingAvailabilityLabel, trainingEnvironmentLabel } from '@/domain/plan-conversation';
import type { PlanConversation, PlanConversationMessage } from '@/domain/plan-conversation';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface PlanConversationViewProps {
  conversation: PlanConversation;
  isSaving: boolean;
  onRespond: (text: string, suggestionId?: string) => void;
  onRestart: () => void;
}

export function PlanConversationView({ conversation, isSaving, onRespond, onRestart }: PlanConversationViewProps) {
  const { theme } = useAppTheme();
  const [response, setResponse] = useState('');
  const activeMessageId = conversation.messages.at(-1)?.id;

  function sendFreeResponse() {
    const trimmedResponse = response.trim();

    if (!trimmedResponse) {
      return;
    }

    onRespond(trimmedResponse);
    setResponse('');
  }

  return (
    <View style={styles.content}>
      <View style={styles.messages}>
        {conversation.messages.map((message) => {
          const isAssistant = message.role === 'assistant';
          const isActiveQuestion = message.id === activeMessageId && conversation.status === 'in-progress';

          return (
            <View key={message.id} style={isAssistant ? styles.assistantRow : styles.userRow}>
              <View
                accessibilityLabel={isAssistant ? 'Mensaje del asistente' : 'Tu respuesta'}
                style={[
                  styles.bubble,
                  isAssistant
                    ? { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                    : { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primarySoft },
                ]}>
                {isAssistant ? (
                  <AppText tone="primary" variant="label">
                    Asistente del plan
                  </AppText>
                ) : null}
                <AppText>{message.text}</AppText>
              </View>
              {isActiveQuestion && message.suggestions?.length ? (
                <Suggestions message={message} disabled={isSaving} onRespond={onRespond} />
              ) : null}
            </View>
          );
        })}
      </View>

      {conversation.status === 'in-progress' ? (
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Tu respuesta para el asistente"
            editable={!isSaving}
            multiline
            onChangeText={setResponse}
            placeholder="Escribe tu respuesta"
            placeholderTextColor={theme.colors.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            textAlignVertical="top"
            value={response}
          />
          <PrimaryButton disabled={isSaving || response.trim().length === 0} label="Enviar respuesta" onPress={sendFreeResponse} />
        </View>
      ) : (
        <PlanRequestSummary conversation={conversation} onRestart={onRestart} />
      )}
    </View>
  );
}

interface SuggestionsProps {
  message: PlanConversationMessage;
  disabled: boolean;
  onRespond: (text: string, suggestionId?: string) => void;
}

function Suggestions({ message, disabled, onRespond }: SuggestionsProps) {
  const { theme } = useAppTheme();

  return (
    <View accessibilityLabel="Respuestas sugeridas" style={styles.suggestions}>
      {message.suggestions?.map((suggestion) => (
        <Pressable
          key={suggestion.id}
          accessibilityLabel={suggestion.label}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onRespond(suggestion.label, suggestion.id)}
          style={({ pressed }) => [
            styles.suggestion,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primaryStrong,
              opacity: pressed || disabled ? 0.72 : 1,
            },
          ]}>
          <AppText tone="primary" variant="bodyStrong">
            {suggestion.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

interface PlanRequestSummaryProps {
  conversation: PlanConversation;
  onRestart: () => void;
}

function PlanRequestSummary({ conversation, onRestart }: PlanRequestSummaryProps) {
  const { request } = conversation;
  const availability = `${trainingAvailabilityLabel(request.availability)}${request.availabilityDetails ? ` · ${request.availabilityDetails}` : ''}`;
  const environment = trainingEnvironmentLabel(request.environment, request.environmentDetails);

  return (
    <Card style={styles.summary}>
      <View style={styles.summaryHeading}>
        <AppText variant="heading">Resumen para tu próximo ciclo</AppText>
        <AppText tone="secondary" variant="caption">
          Revísalo antes de pedir una propuesta.
        </AppText>
      </View>
      <SummaryRow label="Objetivo" value={planGoalLabel(request.goal, request.goalDetails)} />
      <SummaryRow label="Disponibilidad" value={availability} />
      <SummaryRow
        label="Duración"
        value={`${request.sessionDurationMinutes} min${request.sessionDurationDetails ? ` · ${request.sessionDurationDetails}` : ''}`}
      />
      <SummaryRow label="Entorno" value={environment} />
      <SummaryRow label="Prioridad" value={request.priorities || 'Sin prioridad concreta'} />
      <SummaryRow label="Ejercicios" value={request.exercisePreferences || 'Sin preferencias concretas'} />
      {request.additionalContext ? <SummaryRow label="Contexto adicional" value={request.additionalContext} /> : null}
      {request.declaredLimitations ? <SummaryRow label="Limitaciones declaradas" value={request.declaredLimitations} /> : null}
      <AppText tone="secondary" variant="caption">
        Este borrador se guarda solo en este dispositivo. La conexión con el asistente remoto se añadirá después.
      </AppText>
      <PrimaryButton label="Empezar de nuevo" onPress={onRestart} variant="secondary" />
    </Card>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  messages: {
    gap: spacing.md,
  },
  assistantRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  userRow: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bubble: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xxs,
    maxWidth: '92%',
    padding: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestion: {
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  composer: {
    gap: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 104,
    padding: spacing.sm,
  },
  summary: {
    gap: spacing.sm,
  },
  summaryHeading: {
    gap: spacing.xxs,
  },
  summaryRow: {
    gap: spacing.xxs,
  },
});
