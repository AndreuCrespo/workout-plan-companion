import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { ExerciseFeedback } from '@/domain/models';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface ExerciseFeedbackControlProps {
  feedback: ExerciseFeedback;
  editable: boolean;
  onChange: (changes: Partial<Pick<ExerciseFeedback, 'reaction' | 'note'>>) => void;
}

export function ExerciseFeedbackControl({ feedback, editable, onChange }: ExerciseFeedbackControlProps) {
  const { theme } = useAppTheme();
  const [isNoteRequested, setIsNoteRequested] = useState(false);
  const isNoteVisible = isNoteRequested || feedback.note.length > 0;

  if (!editable && !feedback.reaction && !feedback.note) {
    return null;
  }

  function selectReaction(reaction: Exclude<ExerciseFeedback['reaction'], null>) {
    onChange({ reaction: feedback.reaction === reaction ? null : reaction });
    setIsNoteRequested(true);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
      <View style={styles.copy}>
        <AppText variant="bodyStrong">Notas sobre este ejercicio</AppText>
        <AppText tone="secondary" variant="caption">
          Escribe lo que quieras sobre este ejercicio.
        </AppText>
      </View>

      {editable ? (
        <View accessibilityLabel={`Feedback de ${feedback.exerciseName}`} accessibilityRole="radiogroup" style={styles.reactions}>
          <Pressable
            accessibilityLabel="Me ha ido bien"
            accessibilityRole="radio"
            accessibilityState={{ selected: feedback.reaction === 'up' }}
            onPress={() => selectReaction('up')}
            style={({ pressed }) => [
              styles.reaction,
              {
                backgroundColor: feedback.reaction === 'up' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.primaryStrong,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <AppText style={{ color: feedback.reaction === 'up' ? theme.colors.onPrimary : theme.colors.onSoft }} variant="bodyStrong">
              👍 Me ha ido bien
            </AppText>
          </Pressable>
          <Pressable
            accessibilityLabel="No me ha encajado"
            accessibilityRole="radio"
            accessibilityState={{ selected: feedback.reaction === 'down' }}
            onPress={() => selectReaction('down')}
            style={({ pressed }) => [
              styles.reaction,
              {
                backgroundColor: feedback.reaction === 'down' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.primaryStrong,
                opacity: pressed ? 0.72 : 1,
              },
            ]}>
            <AppText style={{ color: feedback.reaction === 'down' ? theme.colors.onPrimary : theme.colors.onSoft }} variant="bodyStrong">
              👎 No me ha encajado
            </AppText>
          </Pressable>
        </View>
      ) : feedback.reaction ? (
        <AppText tone="secondary" variant="caption">
          {feedback.reaction === 'up' ? 'Te ha ido bien.' : 'Marcado para revisarlo en un plan futuro.'}
        </AppText>
      ) : null}

      {isNoteVisible || feedback.note ? (
        <TextInput
          accessibilityLabel={`Nota sobre ${feedback.exerciseName}`}
          editable={editable}
          multiline
          onChangeText={(note) => onChange({ note })}
          placeholder="Escribe lo que quieras sobre este ejercicio"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.noteInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          textAlignVertical="top"
          value={feedback.note}
        />
      ) : editable ? (
        <Pressable
          accessibilityLabel="Añadir una nota sobre este ejercicio"
          accessibilityRole="button"
          onPress={() => setIsNoteRequested(true)}
          style={({ pressed }) => [styles.addNote, { opacity: pressed ? 0.72 : 1 }]}>
          <AppText tone="primary" variant="bodyStrong">Añadir una nota</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  copy: {
    gap: spacing.xxs,
  },
  reactions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  reaction: {
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  noteInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 96,
    padding: spacing.sm,
  },
  addNote: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
});
