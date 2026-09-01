import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { usePlan } from '@/plan/plan-context';
import { useProfile } from '@/profile/profile-context';
import { workoutLogRepository } from '@/repositories/local-workout-log-repository';
import {
  privateBackupRecoveryRepository,
  type PrivateBackupSummary,
} from '@/repositories/supabase-private-backup-recovery-repository';
import { useAppTheme } from '@/theme/theme-context';

function describeCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function RecoverPrivateBackupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { restoreHistory } = usePlan();
  const { profile, replaceProfile } = useProfile();
  const { restoreThemeName } = useAppTheme();
  const [summary, setSummary] = useState<PrivateBackupSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      await Promise.resolve();

      if (!user || profile) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const nextSummary = await privateBackupRecoveryRepository.getSummary(user.id);
        if (isMounted) {
          setSummary(nextSummary);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('No pudimos consultar la copia privada de esta cuenta.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [profile, user]);

  async function requestRecovery() {
    if (!user || !summary?.isAvailable) {
      return;
    }

    const localCompletedLogs = await workoutLogRepository.getCompletedLogs();
    if (localCompletedLogs.length > 0) {
      setErrorMessage('La recuperación solo está disponible antes de guardar registros locales en este dispositivo.');
      return;
    }

    const planLabel = describeCount(summary.planCount, 'plan publicado', 'planes publicados');
    const logLabel = describeCount(summary.completedLogCount, 'registro terminado', 'registros terminados');

    Alert.alert(
      'Recuperar copia privada',
      `Se restaurarán tu perfil, tema, ${planLabel} y ${logLabel}. Sustituirán el plan de muestra de este dispositivo; los borradores no se recuperan.`,
      [
        { style: 'cancel', text: 'Ahora no' },
        { text: 'Recuperar copia', onPress: () => void recoverBackup() },
      ],
    );
  }

  async function recoverBackup() {
    if (!user || profile) {
      return;
    }

    setIsRestoring(true);
    setErrorMessage(null);

    try {
      const snapshot = await privateBackupRecoveryRepository.getSnapshot(user.id);
      await restoreHistory(snapshot.publications);
      await workoutLogRepository.replaceCompletedLogs(snapshot.completedLogs);
      await restoreThemeName(snapshot.themeName);
      await replaceProfile(snapshot.profile);
      router.replace('/(tabs)/perfil');
    } catch {
      setErrorMessage('No pudimos recuperar la copia privada. Los datos locales de este dispositivo no se han sustituido.');
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader description="Recupera una copia privada antes de crear datos nuevos en este dispositivo." onBack={() => router.back()} title="Recuperar copia" />

      {!user ? (
        <Card>
          <AppText variant="heading">Inicia sesión primero</AppText>
          <AppText tone="secondary">Conecta la cuenta que contiene tu copia privada para poder revisarla.</AppText>
          <PrimaryButton label="Volver a Cuenta" onPress={() => router.replace('/auth/iniciar-sesion')} variant="secondary" />
        </Card>
      ) : profile ? (
        <Card>
          <AppText variant="heading">Este dispositivo ya tiene perfil</AppText>
          <AppText tone="secondary">
            La recuperación está reservada para una instalación antes del onboarding, para no sustituir datos locales existentes.
          </AppText>
          <PrimaryButton label="Volver al perfil" onPress={() => router.replace('/(tabs)/perfil')} variant="secondary" />
        </Card>
      ) : isLoading ? (
        <Card>
          <AppText variant="heading">Comprobando tu copia privada…</AppText>
        </Card>
      ) : !summary?.isAvailable ? (
        <Card>
          <AppText variant="heading">No hay una copia completa</AppText>
          <AppText tone="secondary">
            Esta cuenta necesita una copia de perfil, tema y al menos un plan publicado antes de poder recuperarse en otro dispositivo.
          </AppText>
          {errorMessage ? <AppText tone="secondary" variant="caption">{errorMessage}</AppText> : null}
          <PrimaryButton label="Volver a Cuenta" onPress={() => router.replace('/auth/iniciar-sesion')} variant="secondary" />
        </Card>
      ) : (
        <Card>
          <AppText variant="heading">Copia privada disponible</AppText>
          <AppText tone="secondary">
            Incluye tu perfil, tema, {describeCount(summary.planCount, 'plan publicado', 'planes publicados')} y {describeCount(summary.completedLogCount, 'registro terminado', 'registros terminados')}.
          </AppText>
          <AppText tone="secondary" variant="caption">
            Los planes y registros se recuperan como historial inmutable. Los borradores en curso no se incluyen.
          </AppText>
          {errorMessage ? <AppText tone="secondary" variant="caption">{errorMessage}</AppText> : null}
          <PrimaryButton
            disabled={isRestoring}
            label={isRestoring ? 'Recuperando copia…' : 'Recuperar mi copia privada'}
            onPress={() => void requestRecovery()}
          />
        </Card>
      )}
    </Screen>
  );
}
