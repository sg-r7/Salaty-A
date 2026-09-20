import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PRAYER_CHANNEL_ID = "salaty-prayer-adhan-v4";
export const PRAYER_SOUND = "azan.mp3";
const STORAGE_KEY_SETTINGS = "salaty_notification_settings";

export interface NotificationSettings {
  prayerNotifications: boolean;
  athkarNotifications: boolean;
  fridayReminder: boolean;
}

export interface PrayerScheduleItem {
  id: string;
  name: string;
  date: Date;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurePrayerNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
    name: "أذان ومواقيت الصلاة",
    importance: Notifications.AndroidImportance.MAX,
    sound: PRAYER_SOUND,
    vibrationPattern: [0, 500, 250, 500],
    enableVibrate: true,
    lightColor: "#72efdd",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
  });
}

export async function registerForNotifications(): Promise<boolean> {
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

const DEFAULT_SETTINGS: NotificationSettings = {
  prayerNotifications: true,
  athkarNotifications: true,
  fridayReminder: true,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export async function cancelPrayerNotifications(): Promise<void> {
  const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();
  for (const item of scheduled) {
    const data = item.content.data;
    const isPrayer =
      data?.type === "prayer" ||
      typeof data?.prayerName === "string" ||
      typeof data?.prayerId === "string" ||
      item.identifier.startsWith("prayer_");

    if (isPrayer) {
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

let schedulingQueue: Promise<unknown> = Promise.resolve();

export function replaceScheduledPrayerNotifications(
  prayers: PrayerScheduleItem[],
  enabled: boolean
): Promise<string[]> {
  const task = schedulingQueue.then(async () => {
    await cancelPrayerNotifications();

    if (!enabled || prayers.length === 0) {
      return [];
    }

    await configurePrayerNotificationChannel();

    const scheduledIds: string[] = [];
    const now = Date.now();

    for (const prayer of prayers) {
      const time = prayer.date.getTime();
      if (!Number.isFinite(time) || time <= now) {
        continue;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "حي على الصلاة.. 🕋",
          body: `حان الآن وقت صلاة ${prayer.name}`,
          sound: PRAYER_SOUND,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            type: "prayer",
            prayerId: prayer.id,
            prayerName: prayer.name,
          },
        },
        trigger: {
          date: prayer.date,
          channelId: PRAYER_CHANNEL_ID,
        },
      });

      if (id) {
        scheduledIds.push(id);
      }
    }

    return scheduledIds;
  });

  schedulingQueue = task.catch(() => {});
  return task;
}
