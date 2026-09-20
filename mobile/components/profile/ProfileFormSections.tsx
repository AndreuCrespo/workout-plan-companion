import { StyleSheet, View } from 'react-native';

import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { ProfileTextField } from '@/components/ui/ProfileTextField';
import {
  availabilityOptions,
  durationOptions,
  equipmentAccessOptions,
  primaryGoalOptions,
  trainingEmphasisOptions,
  trainingExperienceOptions,
  unitOptions,
} from '@/data/profile-options';
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

export function GoalsAndExperienceProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
      <ChoiceGroup
        label="Objetivo principal"
        onValueChange={(primaryGoal) => onChange({ primaryGoal })}
        options={primaryGoalOptions}
        value={draft.primaryGoal}
      />
      <ChoiceGroup
        label="Experiencia de entrenamiento"
        onValueChange={(trainingExperience) => onChange({ trainingExperience })}
        options={trainingExperienceOptions}
        value={draft.trainingExperience}
      />
    </View>
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
      <ChoiceGroup
        description="Esta prioridad no promete cambios hormonales; el plan se ajusta a tu objetivo, equipo y limitaciones declaradas."
        label="Prioridad de entrenamiento"
        onValueChange={(trainingEmphasis) => onChange({ trainingEmphasis })}
        options={trainingEmphasisOptions}
        value={draft.trainingEmphasis}
      />
      <ChoiceGroup
        label="Material principal disponible"
        onValueChange={(equipmentAccess) => onChange({ equipmentAccess })}
        options={equipmentAccessOptions}
        value={draft.equipmentAccess}
      />
      <ProfileTextField
        description="Por ejemplo: repartir tren inferior, empuje, tracción y un día de cardio. El asistente lo tendrá en cuenta en los próximos borradores."
        label="Información adicional para tus planes"
        maxLength={1_000}
        multiline
        onChangeText={(trainingPreferences) => onChange({ trainingPreferences })}
        placeholder="Cómo te gustaría organizar o priorizar tus sesiones"
        value={draft.trainingPreferences}
      />
    </View>
  );
}

export function DetailsProfileFields({ draft, onChange }: ProfileFieldsProps) {
  return (
    <View style={styles.section}>
      <ProfileTextField
        description="Comparte solo lo que quieras tener presente al planificar. Ante dolor agudo, lesión o una condición clínica, pausa y consulta a un profesional."
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
