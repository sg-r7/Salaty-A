import { Alert, Linking } from "react-native";
import Constants from "expo-constants";

// استبدل هذا الرابط لاحقاً برابط ملف version.json على موقعك
const VERSION_URL = "https://raw.githubusercontent.com/sg-r7/Salaty-App/main/version.json";

export async function checkAppUpdate(): Promise<void> {
  try {
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`);
    if (!response.ok) return;

    const data = await response.json();
    const currentVersionCode = Constants.expoConfig?.android?.versionCode ?? 7;

    if (data.versionCode > currentVersionCode) {
      Alert.alert(
        "تحديث جديد متوفر 🚀",
        data.message || `يتوفر إصدار جديد (${data.versionName}) لتطبيق صلاتي.`,
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
    // تجاهل الأخطاء لضمان فتح التطبيق دون مشاكل في حال انقطاع الشبكة
  }
}

