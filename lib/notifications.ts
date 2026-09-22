import {
  cancelAllScheduledNotifications,
  configureNotificationChannels,
  PRAYER_CHANNEL_ID,
  PRAYER_SOUND,
  registerForNotifications,
  replaceScheduledPrayerNotifications,
} from "../src/services/notificationService";

// Compatibility exports for older integrations. All notification work is
// delegated to one canonical service to prevent duplicate channels and schedules.
export const PRAYER_NOTIFICATION_CHANNEL_ID = PRAYER_CHANNEL_ID;
export const PRAYER_NOTIFICATION_SOUND = PRAYER_SOUND;

export async function configurePrayerNotificationChannel(): Promise<void> {
  await configureNotificationChannels();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return registerForNotifications();
}

export async function schedulePrayerNotification(
  prayerName: string,
  prayerDate: Date
): Promise<string | null> {
  if (!(prayerDate instanceof Date)) {
    return null;
  }

  const time = prayerDate.getTime();
  if (!Number.isFinite(time) || time <= Date.now()) {
    return null;
  }

  const identifiers = await replaceScheduledPrayerNotifications(
    [
      {
        id: `legacy-prayer-${time}`,
        name: prayerName,
        date: prayerDate,
      },
    ],
    true
  );

  return identifiers[0] ?? null;
}

export async function cancelAllNotifications(): Promise<void> {
  await cancelAllScheduledNotifications();
}
