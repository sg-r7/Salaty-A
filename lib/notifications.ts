import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const PRAYER_NOTIFICATION_CHANNEL_ID = "prayer_notifications";
export const PRAYER_NOTIFICATION_SOUND = "azan.mp3";

if (typeof Notifications.setNotificationHandler === "function") {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn("Notification handler setup unavailable:", error);
  }
}

export async function configurePrayerNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    PRAYER_NOTIFICATION_CHANNEL_ID,
    {
      name: "أوقات الصلاة",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: "#72efdd",
      sound: PRAYER_NOTIFICATION_SOUND,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    }
  );
}

export async function requestNotificationPermissions(): Promise<boolean> {
  await configurePrayerNotificationChannel();

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
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

  await configurePrayerNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "حي على الصلاة.. 🕋",
      body: `حان الآن وقت صلاة ${prayerName}`,
      sound: PRAYER_NOTIFICATION_SOUND,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        prayerName,
      },
    },
    trigger: {
      date: prayerDate,
      channelId: PRAYER_NOTIFICATION_CHANNEL_ID,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
