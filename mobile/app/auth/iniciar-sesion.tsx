import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { usePlan } from '@/plan/plan-context';
import { useTrainingHistoryBackup } from '@/plan/use-training-history-backup';
import { usePrivateProfileBackup } from '@/profile/use-private-profile-backup';
import { useProfile } from '@/profile/profile-context';
import { workoutLogRepository } from '@/repositories/local-workout-log-repository';
import { useAppTheme } from '@/theme/theme-context';
import { radius, spacing } from '@/theme/tokens';

function backupDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'fecha no disponible' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SignInScreen() {
  const router = useRouter();
  const { authError, isConfigured, isSendingMagicLink, sendMagicLink, signOut, user } = useAuth();
  const { profile } = useProfile();
  const { history } = usePlan();
  const { backup, errorMessage: backupError, isLoading: isBackupLoading, isSaving: isBackingUp, lastBackupAt } = usePrivateProfileBackup(user?.id);
  const {
    backup: backupTrainingHistory,
    errorMessage: trainingHistoryBackupError,
    isLoading: isTrainingHistoryBackupLoading,
    isSaving: isBackingUpTrainingHistory,
    status: trainingHistoryBackupStatus,
  } = useTrainingHistoryBackup(user?.id);
  const { theme, themeName } = useAppTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function requestLink() {
    setMessage(null);
    setActionError(null);
    const result = await sendMagicLink(email);

    if (result.errorMessage) {
      setActionError(result.errorMessage);
      return;
    }

    setMessage('Revisa tu correo y abre el enlace en este dispositivo. No se ha subido todavía tu perfil ni tu historial.');
  }

  function confirmBackup() {
    if (!profile) {
      return;
    }

    Alert.alert(
      'Guardar copia privada',
      'Se subirán tu nombre, disponibilidad, duración, limitaciones declaradas, unidades y tema. No se subirán planes, entrenamientos, notas ni progreso.',
      [
        { style: 'cancel', text: 'Ahora no' },
        { text: 'Guardar copia', onPress: () => void backup(profile, themeName) },
      ],
    );
  }

  async function confirmTrainingHistoryBackup() {
    const completedLogs = await workoutLogRepository.getCompletedLogs();
    const planLabel = history.length === 1 ? '1 plan publicado' : `${history.length} planes publicados`;
    const logLabel = completedLogs.length === 1 ? '1 registro terminado' : `${completedLogs.length} registros terminados`;

    Alert.alert(
      'Guardar planes y registros',
      `Se subirán ${planLabel} y ${logLabel}, incluidas sus series, cargas, RPE, feedback y notas, como historial inmutable. No se subirán borradores en curso ni se reemplazarán datos remotos.`,
      [
        { style: 'cancel', text: 'Ahora no' },
        { text: 'Guardar copia', onPress: () => void backupTrainingHistory(history, completedLogs) },
      ],
    );
  }

  async function closeSession() {
    setIsSigningOut(true);
    setActionError(null);
    const result = await signOut();

    if (result.errorMessage) {
      setActionError(result.errorMessage);
    }
    setIsSigningOut(false);
  }

  return (
    <Screen>
      <ScreenHeader description="Conecta tu cuenta sin contraseña." onBack={() => router.back()} title="Cuenta" />

      {!isConfigured ? (
        <Card style={styles.card}>
          <AppText variant="heading">Acceso no configurado</AppText>
          <AppText tone="secondary">
            Esta instalación no tiene la configuración pública de Supabase. Tus datos locales siguen disponibles solo en este dispositivo.
          </AppText>
        </Card>
      ) : user && !profile ? (
        <Card style={styles.card}>
          <AppText variant="heading">Cuenta conectada</AppText>
          <AppText tone="secondary">{user.email ?? 'Cuenta con correo verificado'}</AppText>
          <AppText tone="secondary" variant="caption">
            Puedes recuperar la copia privada asociada a esta cuenta antes de crear un perfil nuevo en este dispositivo.
          </AppText>
          <PrimaryButton label="Recuperar mi copia privada" onPress={() => router.push('/auth/recuperar-copia')} />
          <PrimaryButton disabled={isSigningOut} label={isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'} onPress={() => void closeSession()} variant="secondary" />
        </Card>
      ) : user ? (
        <Card style={styles.card}>
          <AppText variant="heading">Sesión conectada</AppText>
          <AppText tone="secondary">{user.email ?? 'Cuenta con correo verificado'}</AppText>
          <AppText tone="secondary" variant="caption">
            Puedes guardar por separado una copia privada de tu perfil, tema, planes publicados y registros terminados. Los borradores siguen solo en este dispositivo.
          </AppText>
          {isBackupLoading ? <AppText tone="secondary" variant="caption">Comprobando si ya existe una copia privada…</AppText> : null}
          {lastBackupAt ? <AppText tone="secondary" variant="caption">Última copia guardada: {backupDateLabel(lastBackupAt)}.</AppText> : null}
          {backupError ? <AppText tone="secondary" variant="caption">{backupError}</AppText> : null}
          <PrimaryButton
            disabled={isBackingUp || !profile}
            label={isBackingUp ? 'Guardando copia…' : 'Guardar copia privada del perfil'}
            onPress={confirmBackup}
          />
          {isTrainingHistoryBackupLoading ? <AppText tone="secondary" variant="caption">Comprobando la copia de planes y registros…</AppText> : null}
          {trainingHistoryBackupStatus ? (
            <AppText tone="secondary" variant="caption">
              Última copia de historial: {backupDateLabel(trainingHistoryBackupStatus.lastImportedAt)}. {trainingHistoryBackupStatus.planCount} {trainingHistoryBackupStatus.planCount === 1 ? 'plan publicado' : 'planes publicados'} y {trainingHistoryBackupStatus.completedLogCount} {trainingHistoryBackupStatus.completedLogCount === 1 ? 'registro terminado' : 'registros terminados'}.
            </AppText>
          ) : null}
          {trainingHistoryBackupError ? <AppText tone="secondary" variant="caption">{trainingHistoryBackupError}</AppText> : null}
          <PrimaryButton
            disabled={isBackingUpTrainingHistory || history.length === 0}
            label={isBackingUpTrainingHistory ? 'Guardando historial…' : 'Guardar copia de planes y registros'}
            onPress={() => void confirmTrainingHistoryBackup()}
          />
          <PrimaryButton disabled={isSigningOut} label={isSigningOut ? 'Cerrando sesión…' : 'Cerrar sesión'} onPress={() => void closeSession()} variant="secondary" />
        </Card>
      ) : (
        <Card style={styles.card}>
          <AppText variant="heading">Entrar con un enlace</AppText>
          <AppText tone="secondary">
            Te enviaremos un enlace de acceso a tu correo. No necesitas crear ni recordar una contraseña.
          </AppText>
          <View style={styles.field}>
            <AppText variant="bodyStrong">Correo electrónico</AppText>
            <TextInput
              accessibilityLabel="Correo electrónico para recibir el enlace de acceso"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={email}
            />
          </View>
          {message ? <AppText tone="secondary" variant="caption">{message}</AppText> : null}
          {actionError || authError ? <AppText tone="secondary" variant="caption">{actionError ?? authError}</AppText> : null}
          <PrimaryButton
            disabled={isSendingMagicLink || email.trim().length === 0}
            label={isSendingMagicLink ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
            onPress={() => void requestLink()}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
