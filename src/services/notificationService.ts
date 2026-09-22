import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type AdhanSound = "makkah" | "madinah" | "quds" | "default";

export interface NotificationSettings {
  prayerNotifications: boolean;
  athkarNotifications: boolean;
  fridayReminder: boolean;
  adhanSound: AdhanSound;
}

const NOTIFICATIONS_STORAGE_KEY = "salaty_notification_settings";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  prayerNotifications: true,
  athkarNotifications: true,
  fridayReminder: true,
  adhanSound: "makkah",
};

// تهيئة معالج استقبال الإشعارات أثناء فتح التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * طلب الصلاحيات اللازمة لإرسال الإشعارات
 */
export async function registerForNotifications(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("prayer-times", {
      name: "أوقات الصلاة والأذان",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1A5D1A",
      sound: "makkah.wav", // تأكد من إضافة الملف الصوتي في مجلد الأصول التابع لنظام Android
    });
  }

  return true;
}

/**
 * جلب إعدادات الإشعارات المخزنة محلياً
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * حفظ إعدادات الإشعارات
 */
export async function saveNotificationSettings(
  settings: NotificationSettings
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}

/**
 * إلغاء جميع الإشعارات المجدولة مسبقاً
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * جدولة إشعارات أوقات الصلاة القادمة
 */
export async function schedulePrayerNotifications(
  prayers: Array<{ id: string; name: string; date: Date }>,
  options: { enabled: boolean; sound: AdhanSound }
): Promise<string[]> {
  if (!options.enabled) return [];

  const scheduledIds: string[] = [];
  const now = Date.now();

  for (const prayer of prayers) {
    const triggerTime = prayer.date.getTime();

    // تأكد من أن الموعد في المستقبل
    if (triggerTime <= now) continue;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `حان الآن موعد صلاة ${prayer.name}`,
        body: `حي على الصلاة، حي على الفلاح (${prayer.name})`,
        sound: options.sound !== "default" ? `${options.sound}.wav` : true,
        data: { prayerId: prayer.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: prayer.date,
      },
    });

    scheduledIds.push(id);
  }

  return scheduledIds;
}
