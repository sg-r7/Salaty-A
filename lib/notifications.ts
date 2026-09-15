import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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
      "prayer_notifications",
      {
        name: "تنبيهات الصلاة",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6fffe9",
        sound: "default",
      }
    );
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
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
      title: `حان الآن وقت صلاة ${prayerName}`,
      body: "حي على الصلاة، حي على الفلاح",
      sound: "default",
    },
    trigger: {
      seconds: triggerSeconds,
      channelId: "prayer_notifications",
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

