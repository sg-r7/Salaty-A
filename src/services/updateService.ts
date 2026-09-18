import { Alert, Linking } from "react-native";
import Constants from "expo-constants";

const VERSION_URL = "https://raw.githubusercontent.com/sg-r7/Salaty-App/main/version.json";

interface RemoteVersionData {
  latestVersion: string;
  versionCode: number;
  downloadUrl: string;
  releaseNotes?: string;
}

export async function checkAppUpdate(): Promise<void> {
  try {
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`);
    if (!response.ok) return;

    const data: RemoteVersionData = await response.json();
    const currentVersionCode =
      Constants.expoConfig?.android?.versionCode ??
      (Constants.manifest as any)?.android?.versionCode ??
      8;

    if (data.versionCode > currentVersionCode) {
      const updateMessage = data.releaseNotes
        ? `${data.releaseNotes}\n\nالإصدار الجديد: ${data.latestVersion}`
        : `يتوفر إصدار جديد (${data.latestVersion}) لتطبيق صلاتي.`;

      Alert.alert(
        "تحديث جديد متوفر 🚀",
        updateMessage,
        [
          { text: "ذكرني لاحقاً", style: "cancel" },
          {
            text: "حدّث الآن",
            onPress: () => {
              if (data.downloadUrl) {
                Linking.openURL(data.downloadUrl);
              }
            },
          },
        ]
      );
    }
  } catch (error) {
    // تجاهل الأخطاء لضمان استمرار عمل التطبيق في وضع عدم الاتصال
  }
}
