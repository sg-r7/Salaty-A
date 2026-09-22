import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type AdhanSound =
  | "default"
  | "makkah"
  | "madinah"
  | "aqsa"
  | "takbeer";

export interface PrayerNotificationItem {
  id: string;
  name: string;
  date: Date;
}

export interface NotificationSettings {
  prayerNotifications: boolean;
  athkarNotifications: boolean;
  fridayReminder: boolean;
  adhanSound: AdhanSound;
}

const NOTIFICATION_SETTINGS_KEY = "salaty_notification_settings";

const PRAYER_CHANNEL_ID = "prayer-adhan-v3-2026";
const ATHKAR_CHANNEL_ID = "salaty_athkar_notifications";
const FRIDAY_CHANNEL_ID = "salaty_friday_notifications";

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  prayerNotifications: true,
  athkarNotifications: true,
  fridayReminder: true,
  adhanSound: "makkah",
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getSoundFileName(sound: AdhanSound): string {
  if (sound === "default") {
    return "default";
  }

  return "azan.mp3";
}

function isValidAdhanSound(value: unknown): value is AdhanSound {
  return (
    value === "default" ||
    value === "makkah" ||
    value === "madinah" ||
    value === "aqsa" ||
    value === "takbeer"
  );
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const storedValue = await import(
    "@react-native-async-storage/async-storage"
  ).then((module) => module.default.getItem(NOTIFICATION_SETTINGS_KEY));

  if (!storedValue) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<NotificationSettings>;

    return {
      prayerNotifications:
        typeof parsed.prayerNotifications === "boolean"
          ? parsed.prayerNotifications
          : DEFAULT_NOTIFICATION_SETTINGS.prayerNotifications,
      athkarNotifications:
        typeof parsed.athkarNotifications === "boolean"
          ? parsed.athkarNotifications
          : DEFAULT_NOTIFICATION_SETTINGS.athkarNotifications,
      fridayReminder:
        typeof parsed.fridayReminder === "boolean"
          ? parsed.fridayReminder
          : DEFAULT_NOTIFICATION_SETTINGS.fridayReminder,
      adhanSound: isValidAdhanSound(parsed.adhanSound)
        ? parsed.adhanSound
        : DEFAULT_NOTIFICATION_SETTINGS.adhanSound,
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  const AsyncStorage = (
    await import("@react-native-async-storage/async-storage")
  ).default;

  await AsyncStorage.setItem(
    NOTIFICATION_SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
    name: "أذان ومواقيت الصلاة",
    description: "تنبيهات مواقيت الصلاة بصوت الأذان المدمج",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: "#72efdd",
    sound: "azan.mp3",
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: true,
  });

  await Notifications.setNotificationChannelAsync(ATHKAR_CHANNEL_ID, {
    name: "تنبيهات الأذكار",
    description: "تذكيرات الأذكار اليومية",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 150, 150],
    lightColor: "#72efdd",
    sound: "default",
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync(FRIDAY_CHANNEL_ID, {
    name: "تذكير سورة الكهف",
    description: "تذكير قراءة سورة الكهف يوم الجمعة",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 150],
    lightColor: "#72efdd",
    sound: "default",
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await createNotificationChannels();

  const currentPermission = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermission.status;

  if (finalStatus !== "granted") {
    const requestedPermission =
      await Notifications.requestPermissionsAsync();

    finalStatus = requestedPermission.status;
  }

  return finalStatus === "granted";
}

export async function registerForNotifications(): Promise<boolean> {
  return requestNotificationPermission();
}

function getNotificationSound(sound: AdhanSound): string {
  return getSoundFileName(sound);
}

export async function schedulePrayerNotification(
  prayer: PrayerNotificationItem,
  sound: AdhanSound = "makkah"
): Promise<string | null> {
  if (!(prayer.date instanceof Date)) {
    return null;
  }

  const prayerTime = prayer.date.getTime();

  if (!Number.isFinite(prayerTime)) {
    return null;
  }

  if (prayerTime <= Date.now()) {
    return null;
  }

  const selectedSound = getNotificationSound(sound);

  await createNotificationChannels();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "حي على الصلاة.. 🕋",
      body: `حان الآن وقت صلاة ${prayer.name}`,
      sound: selectedSound,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        type: "prayer",
        prayerId: prayer.id,
        prayerName: prayer.name,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: prayer.date,
      channelId: PRAYER_CHANNEL_ID,
    },
  });
}

export async function schedulePrayerNotifications(
  prayers: PrayerNotificationItem[],
  options?: {
    enabled?: boolean;
    sound?: AdhanSound;
  }
): Promise<string[]> {
  if (options?.enabled === false) {
    return [];
  }

  const sound = options?.sound || "makkah";
  const identifiers: string[] = [];

  for (const prayer of prayers) {
    const identifier = await schedulePrayerNotification(prayer, sound);

    if (identifier) {
      identifiers.push(identifier);
    }
  }

  return identifiers;
}

export async function scheduleDailyAthkarNotification(
  hour = 8,
  minute = 0
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "وردك اليومي",
      body: "حافظ على ذكر الله، وابدأ يومك بالأذكار.",
      sound: "default",
      data: {
        type: "athkar",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ATHKAR_CHANNEL_ID,
    },
  });
}

export async function scheduleFridayKahfNotification(): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "تذكير سورة الكهف",
      body: "جمعة مباركة. لا تنس قراءة سورة الكهف.",
      sound: "default",
      data: {
        type: "friday-kahf",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 6,
      hour: 9,
      minute: 0,
      channelId: FRIDAY_CHANNEL_ID,
    },
  });
}

export async function cancelNotification(
  identifier: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelAllNotifications(): Promise<void> {
  await cancelAllScheduledNotifications();
}
