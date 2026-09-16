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

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      PRAYER_CHANNEL_ID,
      {
        name: "تنبيهات الصلاة",
        description:
          "تنبيهات مواقيت الصلاة حسب توقيت مكة المكرمة",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#72efdd",
        sound: "default",
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      }
    );
  }

  const permissions =
    await Notifications.getPermissionsAsync();

  let finalStatus = permissions.status;

  if (finalStatus !== "granted") {
    const requested =
      await Notifications.requestPermissionsAsync();

    finalStatus = requested.status;
  }

  return finalStatus === "granted";
}

export async function schedulePrayerNotification(
  prayerName: string,
  prayerDate: Date
): Promise<void> {
  const remainingMilliseconds =
    prayerDate.getTime() - Date.now();

  if (remainingMilliseconds <= 0) {
    return;
  }

  const triggerSeconds = Math.max(
    1,
    Math.ceil(remainingMilliseconds / 1000)
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "حي على الصلاة..",
      body: `حان الآن وقت صلاة ${prayerName} حسب توقيت مكة المكرمة`,
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      seconds: triggerSeconds,
      channelId: PRAYER_CHANNEL_ID,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
