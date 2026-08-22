import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

interface ProfileTextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  description?: string;
  multiline?: boolean;
}

export function ProfileTextField({
  label,
  value,
  onChangeText,
  placeholder,
  description,
  multiline = false,
}: ProfileTextFieldProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.field}>
      <View style={styles.heading}>
        <AppText variant="heading">{label}</AppText>
        {description ? <AppText tone="secondary" variant="caption">{description}</AppText> : null}
      </View>
      <TextInput
        accessibilityHint={description}
        accessibilityLabel={label}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        selectionColor={theme.colors.primary}
        style={[
          styles.input,
          multiline ? styles.multilineInput : undefined,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  heading: {
    gap: spacing.xxs,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 23,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    minHeight: 112,
  },
});
