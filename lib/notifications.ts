import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// تغيير المعرف يضمن إنشاء قناة جديدة كلياً بالصوت المخصص وتجاوز كاش القناة القديمة
const PRAYER_CHANNEL_ID = "prayer_makkah";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// دالة لإنشاء وضمان وجود قناة أذان مكة في أندرويد
async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
      name: "Prayer Alert - Makkah",
      description: "تنبيهات مواقيت الصلاة بصوت أذان الحرم المكي الشريف",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: "#72efdd",
      sound: "makkah", // اسم الملف بدون .mp3 ليرتبط بـ assets/makkah.mp3
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
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
    const parsedDate = prayerDate instanceof Date ? prayerDate : new Date(prayerDate);
    const targetTimestamp = parsedDate.getTime();

    if (isNaN(targetTimestamp)) {
      console.warn(`تاريخ صلاة غير صالح لـ ${prayerName}`);
      return;
    }

    const remainingMilliseconds = targetTimestamp - Date.now();

    if (remainingMilliseconds <= 0) {
      return;
    }

    const triggerSeconds = Math.max(1, Math.ceil(remainingMilliseconds / 1000));

    await ensureNotificationChannel();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "حي على الصلاة.. 🕋",
        body: `حان الآن وقت صلاة ${prayerName}`,
        sound: "makkah", // نغمة الأذان
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
