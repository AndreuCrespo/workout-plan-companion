import { StyleSheet, View } from 'react-native';

import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { ProfileTextField } from '@/components/ui/ProfileTextField';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import {
  availabilityOptions,
  durationOptions,
  equipmentOptions,
  experienceOptions,
  primaryGoalOptions,
  trainingPreferenceOptions,
  unitOptions,
} from '@/data/profile-options';
import type { ProfileDraft } from '@/domain/models';
import { useAppTheme } from '@/theme/theme-context';
import { spacing } from '@/theme/tokens';

interface ProfileFieldsProps {
  draft: ProfileDraft;
  onChange: (changes: Partial<ProfileDraft>) => void;
}

export function BasicsProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
      <ProfileTextField
        description="Solo se usa para saludarte en la app."
        label="¿Cómo te llamamos?"
        onChangeText={(firstName) => onChange({ firstName })}
        placeholder="Tu nombre (opcional)"
        value={draft.firstName}
      />
      <ChoiceGroup
        label="Objetivo principal"
        onValueChange={(primaryGoal) => onChange({ primaryGoal })}
        options={primaryGoalOptions}
        value={draft.primaryGoal}
      />
    </View>
  );
}

export function TrainingProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
      <ChoiceGroup
        label="Experiencia"
        onValueChange={(experience) => onChange({ experience })}
        options={experienceOptions}
        value={draft.experience}
      />
      <ChoiceGroup
        label="Disponibilidad"
        onValueChange={(availability) => onChange({ availability })}
        options={availabilityOptions}
        value={draft.availability}
      />
      <ChoiceGroup
        label="Duración habitual"
        onValueChange={(sessionDurationMinutes) => onChange({ sessionDurationMinutes })}
        options={durationOptions}
        value={draft.sessionDurationMinutes}
      />
    </View>
  );
}

export function EquipmentProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
      <ChoiceGroup
        label="Equipamiento"
        onValueChange={(equipment) => onChange({ equipment })}
        options={equipmentOptions}
        value={draft.equipment}
      />
      <ChoiceGroup
        label="Cómo prefieres entrenar"
        onValueChange={(trainingPreference) => onChange({ trainingPreference })}
        options={trainingPreferenceOptions}
        value={draft.trainingPreference}
      />
    </View>
  );
}

export function SafetyProfileFields({ draft, onChange }: ProfileFieldsProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.section}>
      <ProfileTextField
        description="Comparte solo lo que quieras tener presente al planificar."
        label="Limitaciones declaradas"
        multiline
        onChangeText={(limitations) => onChange({ limitations })}
        placeholder="Por ejemplo: prefiero evitar impactos"
        value={draft.limitations}
      />
      <Card style={[styles.safetyCard, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}>
        <AppText variant="bodyStrong">Entrena con atención</AppText>
        <AppText tone="secondary" variant="caption">
          Si aparece dolor agudo, una lesión o una condición clínica, pausa el ejercicio y consulta a un profesional. La app no sustituye orientación sanitaria.
        </AppText>
      </Card>
      <ChoiceGroup
        label="Unidades"
        onValueChange={(units) => onChange({ units })}
        options={unitOptions}
        value={draft.units}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  safetyCard: {
    gap: spacing.xs,
  },
});
