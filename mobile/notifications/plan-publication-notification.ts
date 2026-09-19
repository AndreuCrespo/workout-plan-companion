import * as Notifications from 'expo-notifications';

export async function notifyPlanPublication(planName: string): Promise<boolean> {
  const existingPermission = await Notifications.getPermissionsAsync();
  const permission = existingPermission.granted
    ? existingPermission
    : await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body: `“${planName}” ya es tu plan activo. Revísalo antes de tu próxima sesión.`,
      data: { type: 'plan-published' },
      title: 'Nuevo plan mensual activo',
    },
    trigger: null,
  });

  return true;
}
