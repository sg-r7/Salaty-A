import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const PRAYER_NOTIFICATION_CHANNEL_ID = 'prayer-adhan-v3-2026';
export const PRAYER_NOTIFICATION_SOUND = 'azan.mp3';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function logNotificationError(operation: string, error: unknown): void {
  console.error(`[notifications] ${operation} failed:`, error);
}

export async function configurePrayerNotificationChannel(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    await Notifications.setNotificationChannelAsync(PRAYER_NOTIFICATION_CHANNEL_ID, {
      name: 'أذان ومواقيت الصلاة',
      description: 'تنبيهات دخول أوقات الصلاة حسب مواقيت المدينة المحددة',
      importance: Notifications.AndroidImportance.MAX,
      sound: PRAYER_NOTIFICATION_SOUND,
      vibrationPattern: [0, 300, 200, 500],
      lightColor: '#72efdd',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
    console.log(`[notifications] channel created: ${PRAYER_NOTIFICATION_CHANNEL_ID}`);
    return true;
  } catch (error) {
    logNotificationError('setNotificationChannelAsync', error);
    return false;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      console.warn(`[notifications] permission not granted: ${finalStatus}`);
      return false;
    }

    if (Platform.OS === 'android') {
      await configurePrayerNotificationChannel();
    }

    return true;
  } catch (error) {
    logNotificationError('requestNotificationPermissions', error);
    return false;
  }
}

export async function schedulePrayerNotification(
  prayerName: string,
  prayerDate: Date
): Promise<string | null> {
  if (!prayerDate || isNaN(prayerDate.getTime()) || prayerDate.getTime() <= Date.now()) {
    console.warn(`[notifications] skipped past prayer date: ${prayerName}`);
    return null;
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.warn('[notifications] skipped scheduling: permission denied');
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'حان الآن وقت الصلاة',
        body: `حي على الصلاة.. حان الآن وقت صلاة ${prayerName}`,
        sound: PRAYER_NOTIFICATION_SOUND,
        data: {
          type: 'prayer',
          prayerName,
          prayerDate: prayerDate.toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: prayerDate,
        channelId: PRAYER_NOTIFICATION_CHANNEL_ID,
      },
    });

    console.log(`[notifications] scheduled ${prayerName}: ${notificationId}`);
    return notificationId;
  } catch (error) {
    logNotificationError(`scheduleNotificationAsync (${prayerName})`, error);
    return null;
  }
}

export async function cancelAllNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[notifications] all scheduled notifications cancelled');
    return true;
  } catch (error) {
    logNotificationError('cancelAllScheduledNotificationsAsync', error);
    return false;
  }
}
