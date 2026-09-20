import { Alert, Linking } from "react-native";
import Constants from "expo-constants";

export const VERSION_CHECK_URL =
  "https://raw.githubusercontent.com/sg-r7/MIDO/main/version.json";

export interface VersionManifest {
  latestVersion: string;
  versionCode: number;
  downloadUrl: string;
  releaseNotes?: string;
}

export async function checkForAppUpdates(silent: boolean = true): Promise<void> {
  try {
    const response = await fetch(VERSION_CHECK_URL, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return;
    }

    const data: VersionManifest = await response.json();
    const currentVersionCode =
      Constants.expoConfig?.android?.versionCode ?? 10;

    if (data.versionCode > currentVersionCode) {
      Alert.alert(
        `تحديث جديد متاح (${data.latestVersion}) 🚀`,
        data.releaseNotes ||
          "يتوفر إصدار جديد من تطبيق صلاتي، يرجى التحديث للحصول على أحدث الميزات والإصلاحات.",
        [
          { text: "لاحقاً", style: "cancel" },
          {
            text: "تحديث الآن",
            onPress: () => {
              if (data.downloadUrl) {
                Linking.openURL(data.downloadUrl);
              }
            },
          },
        ]
      );
    } else if (!silent) {
      Alert.alert("أنت على أحدث إصدار", "تطبيق صلاتي محدث إلى آخر نسخة.");
    }
  } catch (error) {
    if (!silent) {
      Alert.alert("خطأ", "تعذر التحقق من التحديثات في الوقت الحالي.");
    }
  }
}

// تصدير دوال مرادفة لضمان التوافق مع أي استدعاء داخل _layout.tsx
export const checkForUpdates = checkForAppUpdates;
export const checkAppVersion = checkForAppUpdates;
// Keep the name used by RootLayout as an explicit named export.
export const checkAppUpdate = checkForAppUpdates;
export default checkForAppUpdates;
