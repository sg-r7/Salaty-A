import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from "adhan";
import {
  cancelAllNotifications,
  registerForPushNotificationsAsync,
  schedulePrayerNotification,
} from "../lib/notifications";

interface PrayerItem {
  name: string;
  time: string;
  isNext?: boolean;
}

interface NextPrayerInfo {
  name: string;
  time: string;
}

export default function PrayerHomeScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState(
    "جاري تحديد الموقع بدقة..."
  );
  const [prayersList, setPrayersList] = useState<PrayerItem[]>([]);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<NextPrayerInfo>({
    name: "...",
    time: "...",
  });

  useEffect(() => {
    let isMounted = true;

    const loadPrayerData = async () => {
      try {
        await registerForPushNotificationsAsync();

        let latitude = 33.385;
        let longitude = 43.91;

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            latitude = location.coords.latitude;
            longitude = location.coords.longitude;

            const reverseGeocode = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

            if (reverseGeocode.length > 0) {
              const place = reverseGeocode[0];
              const city =
                place.district ||
                place.city ||
                place.subregion ||
                "الأنبار";

              if (isMounted) {
                setLocationName(`📍 ${city} (GPS)`);
              }
            } else if (isMounted) {
              setLocationName("📍 الموقع الحالي (GPS)");
            }
          } catch {
            if (isMounted) {
              setLocationName("📍 الكرمة / الفلوجة (افتراضي)");
            }
          }
        } else if (isMounted) {
          setLocationName("📍 الكرمة / الفلوجة (افتراضي)");
        }

        const coordinates = new Coordinates(latitude, longitude);

        const calculationParameters =
          CalculationMethod.MuslimWorldLeague();

        calculationParameters.madhab = Madhab.Shafi;
        calculationParameters.adjustments.fajr = 0;
        calculationParameters.adjustments.dhuhr = 1;
        calculationParameters.adjustments.maghrib = 2;

        const date = new Date();
        const prayerTimes = new PrayerTimes(
          coordinates,
          date,
          calculationParameters
        );

        const formatTime = (time: Date): string => {
          return time.toLocaleTimeString("ar-IQ", {
            hour: "2-digit",
            minute: "2-digit",
          });
        };

        const prayerMap: Record<
          string,
          {
            name: string;
            date: Date;
          }
        > = {
          fajr: {
            name: "الفجر",
            date: prayerTimes.fajr,
          },
          sunrise: {
            name: "الشروق",
            date: prayerTimes.sunrise,
          },
          dhuhr: {
            name: "الظهر",
            date: prayerTimes.dhuhr,
          },
          asr: {
            name: "العصر",
            date: prayerTimes.asr,
          },
          maghrib: {
            name: "المغرب",
            date: prayerTimes.maghrib,
          },
          isha: {
            name: "العشاء",
            date: prayerTimes.isha,
          },
        };

        const prayers: PrayerItem[] = [
          {
            name: "الفجر",
            time: formatTime(prayerTimes.fajr),
          },
          {
            name: "الشروق",
            time: formatTime(prayerTimes.sunrise),
          },
          {
            name: "الظهر",
            time: formatTime(prayerTimes.dhuhr),
          },
          {
            name: "العصر",
            time: formatTime(prayerTimes.asr),
          },
          {
            name: "المغرب",
            time: formatTime(prayerTimes.maghrib),
          },
          {
            name: "العشاء",
            time: formatTime(prayerTimes.isha),
          },
        ];

        await cancelAllNotifications();

        const nextPrayer = prayerTimes.nextPrayer();

        let nextPrayerName = "الفجر";
        let nextPrayerTime = formatTime(prayerTimes.fajr);

        if (nextPrayer && prayerMap[nextPrayer]) {
          nextPrayerName = prayerMap[nextPrayer].name;
          nextPrayerTime = formatTime(prayerMap[nextPrayer].date);
        }

        for (const prayerKey of Object.keys(prayerMap)) {
          const prayer = prayerMap[prayerKey];

          await schedulePrayerNotification(prayer.name, prayer.date);
        }

        const updatedPrayers = prayers.map((prayer) => ({
          ...prayer,
          isNext: prayer.name === nextPrayerName,
        }));

        if (isMounted) {
          setPrayersList(updatedPrayers);
          setNextPrayerInfo({
            name: nextPrayerName,
            time: nextPrayerTime,
          });
        }
      } catch (error) {
        console.error("Failed to load prayer data:", error);

        if (isMounted) {
          setLocationName("📍 الكرمة / الفلوجة (افتراضي)");
          setPrayersList([]);
          setNextPrayerInfo({
            name: "غير متاح",
            time: "--:--",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPrayerData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>صلاتي | SALATY</Text>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#48cae4"
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            <View style={styles.nextPrayerCard}>
              <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>

              <Text style={styles.nextPrayerName}>
                صلاة {nextPrayerInfo.name}
              </Text>

              <Text style={styles.nextPrayerTime}>
                {nextPrayerInfo.time}
              </Text>
            </View>

            <View style={styles.listCard}>
              {prayersList.map((prayer, index) => (
                <View
                  key={`${prayer.name}-${index}`}
                  style={[
                    styles.prayerRow,
                    prayer.isNext && styles.activePrayerRow,
                    index === prayersList.length - 1 &&
                      styles.lastPrayerRow,
                  ]}
                >
                  <Text
                    style={[
                      styles.prayerName,
                      prayer.isNext && styles.activeText,
                    ]}
                  >
                    {prayer.name}
                  </Text>

                  <Text
                    style={[
                      styles.prayerTime,
                      prayer.isNext && styles.activeText,
                    ]}
                  >
                    {prayer.time}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.navButton}
            onPress={() => router.push("/qibla")}
          >
            <Text style={styles.navButtonText}>🧭 اتجاه القبلة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.navButton}
            onPress={() => router.push("/tasbeeh")}
          >
            <Text style={styles.navButtonText}>📿 المسبحة والأذكار</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b132b",
  },

  content: {
    padding: 20,
    paddingBottom: 32,
  },

  header: {
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "#6fffe9",
    fontSize: 24,
    fontWeight: "bold",
  },

  locationText: {
    color: "#a0aec0",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },

  loadingIndicator: {
    marginVertical: 30,
  },

  nextPrayerCard: {
    alignItems: "center",
    backgroundColor: "#1c2541",
    borderColor: "#3a506b",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    padding: 20,
  },

  nextPrayerLabel: {
    color: "#a0aec0",
    fontSize: 13,
  },

  nextPrayerName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },

  nextPrayerTime: {
    color: "#48cae4",
    fontSize: 28,
    fontWeight: "bold",
  },

  listCard: {
    backgroundColor: "#1c2541",
    borderRadius: 14,
    marginBottom: 20,
    paddingHorizontal: 16,
  },

  prayerRow: {
    alignItems: "center",
    borderBottomColor: "#2d3748",
    borderBottomWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  lastPrayerRow: {
    borderBottomWidth: 0,
  },

  activePrayerRow: {
    backgroundColor: "rgba(72, 202, 228, 0.12)",
    borderRadius: 8,
    marginHorizontal: -10,
    paddingHorizontal: 10,
  },

  prayerName: {
    color: "#edf2f7",
    fontSize: 16,
    fontWeight: "600",
  },

  prayerTime: {
    color: "#cbd5e0",
    fontSize: 16,
  },

  activeText: {
    color: "#48cae4",
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  navButton: {
    alignItems: "center",
    backgroundColor: "#1f4068",
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },

  navButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
});

