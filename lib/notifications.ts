import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PRAYER_CHANNEL_ID = "prayer_notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// دالة لضمان وجود القناة في أندرويد دون تكرار
async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
      name: "تنبيهات الصلاة",
      description: "تنبيهات مواقيت الصلاة حسب توقيت مكة المكرمة",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#72efdd",
      sound: "default",
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  try {
    await ensureNotificationChannel();

    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;

    if (finalStatus !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("خطأ في تسجيل أذونات الإشعارات:", error);
    return false;
  }
}

export async function schedulePrayerNotification(
  prayerName: string,
  prayerDate: Date | string | number
): Promise<void> {
  try {
    // 1. تحويل التاريخ والتحقق من صحته لتفادي قيمة NaN
    const parsedDate = prayerDate instanceof Date ? prayerDate : new Date(prayerDate);
    const targetTimestamp = parsedDate.getTime();

    if (isNaN(targetTimestamp)) {
      console.warn(`تاريخ صلاة غير صالح لـ ${prayerName}`);
      return;
    }

    const remainingMilliseconds = targetTimestamp - Date.now();

    // إذا فات وقت الصلاة، نتجاهل جدولتها
    if (remainingMilliseconds <= 0) {
      return;
    }

    const triggerSeconds = Math.max(1, Math.ceil(remainingMilliseconds / 1000));

    // 2. التأكد من تهيئة القناة قبل الجدولة
    await ensureNotificationChannel();

    // 3. جدولة الإشعار
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "حي على الصلاة..",
        body: `حان الآن وقت صلاة ${prayerName} حسب توقيت مكة المكرمة`,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        channelId: PRAYER_CHANNEL_ID,
      },
    });
  } catch (error) {
    console.error(`تعذر جدولة إشعار صلاة ${prayerName}:`, error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("خطأ في إلغاء الإشعارات:", error);
  }
}
