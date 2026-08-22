import { StyleSheet, View } from 'react-native';

import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { ProfileTextField } from '@/components/ui/ProfileTextField';
import { availabilityOptions, durationOptions, unitOptions } from '@/data/profile-options';
import type { ProfileDraft } from '@/domain/models';
import { spacing } from '@/theme/tokens';

interface ProfileFieldsProps {
  draft: ProfileDraft;
  onChange: (changes: Partial<ProfileDraft>) => void;
}

export function BasicsProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <ProfileTextField
      description="Solo se usa para saludarte en la app."
      label="¿Cómo te llamamos?"
      onChangeText={(firstName) => onChange({ firstName })}
      placeholder="Tu nombre (opcional)"
      value={draft.firstName}
    />
  );
}

export function TrainingProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
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

export function DetailsProfileFields({ draft, onChange }: ProfileFieldsProps) {
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
});
