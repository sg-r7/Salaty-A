import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ضبط إعدادات استقبال الإشعارات أثناء فتح التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// طلب الإذن للإشعارات
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("prayer_notifications", {
      name: "تنبيهات الصلاة",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6fffe9",
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

// جدولة إشعار لصلاة معينة
export async function schedulePrayerNotification(
  prayerName: string,
  prayerDate: Date
) {
  const triggerSeconds = (prayerDate.getTime() - Date.now()) / 1000;

  // إذا كان وقت الصلاة لم يفت بعد
  if (triggerSeconds > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `حان الآن وقت صلاة ${prayerName}`,
        body: `حي على الصلاة، حي على الفلاح`,
        sound: "default",
      },
      trigger: {
        seconds: triggerSeconds,
        channelId: "prayer_notifications",
      },
    });
  }
}

// إلغاء كافة الإشعارات المجدولة لإعادة ضبطها
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

