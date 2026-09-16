import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayer } from "../../src/context/PrayerContext";

interface PrayerIconMap {
  [key: string]: string;
}

const prayerIcons: PrayerIconMap = {
  fajr: "☀",
  sunrise: "◒",
  dhuhr: "☼",
  asr: "◐",
  maghrib: "☾",
  isha: "☽",
};

function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatHijriDate(date: Date, offset: number): string {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + offset);

  return adjustedDate.toLocaleDateString(
    "ar-SA-u-ca-islamic-umalqura",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getCurrentPrayerId(
  prayerTimes: Array<{
    id: string;
    date: Date;
  }>,
  now: Date
): string | null {
  const elapsedPrayers = prayerTimes.filter(
    (prayer) => prayer.date.getTime() <= now.getTime()
  );

  if (elapsedPrayers.length === 0) {
    return null;
  }

  return elapsedPrayers[elapsedPrayers.length - 1].id;
}

function getPrayerGreeting(hour: number): string {
  if (hour >= 4 && hour < 12) {
    return "صباح الخير";
  }

  if (hour >= 12 && hour < 17) {
    return "مساء الخير";
  }

  if (hour >= 17 && hour < 23) {
    return "مساء النور";
  }

  return "طاب مساؤك";
}

export default function HomeTab() {
  const {
    prayerTimes,
    location,
    nextPrayer,
    hijriDateOffset,
    loading,
    error,
    refreshPrayerData,
  } = usePrayer();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [completedPrayers, setCompletedPrayers] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const currentPrayerId = useMemo(
    () => getCurrentPrayerId(prayerTimes, currentTime),
    [currentTime, prayerTimes]
  );

  const countdown = useMemo(() => {
    if (!nextPrayer) {
      return "--:--:--";
    }

    return formatCountdown(
      nextPrayer.date.getTime() - currentTime.getTime()
    );
  }, [currentTime, nextPrayer]);

  const completedCount = useMemo(
    () =>
      prayerTimes.filter(
        (prayer) =>
          prayer.id !== "sunrise" &&
          completedPrayers[prayer.id] === true
      ).length,
    [completedPrayers, prayerTimes]
  );

  const trackablePrayers = useMemo(
    () => prayerTimes.filter((prayer) => prayer.id !== "sunrise"),
    [prayerTimes]
  );

  const progressPercentage =
    trackablePrayers.length === 0
      ? 0
      : Math.round(
          (completedCount / trackablePrayers.length) * 100
        );

  const greeting = getPrayerGreeting(currentTime.getHours());

  const togglePrayerCompletion = (prayerId: string) => {
    setCompletedPrayers((current) => ({
      ...current,
      [prayerId]: !current[prayerId],
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refreshPrayerData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#72efdd"
            colors={["#72efdd"]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.title}>السلام عليكم</Text>
            <Text style={styles.subtitle}>
              أهلاً بك في تطبيق صلاتي
            </Text>
          </View>

          <View style={styles.kaabaBadge}>
            <Text style={styles.kaabaIcon}>🕋</Text>
            <Text style={styles.kaabaLabel}>صلاتي</Text>
          </View>
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>التاريخ الميلادي</Text>
            <Text style={styles.dateValue}>
              {formatGregorianDate(currentTime)}
            </Text>
          </View>

          <View style={styles.dateDivider} />

          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>التاريخ الهجري</Text>
            <Text style={styles.dateValue}>
              {formatHijriDate(currentTime, hijriDateOffset)}
            </Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationIconContainer}>
            <Text style={styles.locationIcon}>⌖</Text>
          </View>

          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>
              {location.city}
            </Text>
            <Text style={styles.locationSubtitle}>
              مواقيت الصلاة حسب موقعك المحفوظ
            </Text>
          </View>

          <View style={styles.locationStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.locationStatusText}>
              {location.source === "gps" ? "GPS" : "محفوظ"}
            </Text>
          </View>
        </View>

        {loading && prayerTimes.length === 0 ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#72efdd" />
            <Text style={styles.loadingText}>
              جارٍ حساب مواقيت الصلاة...
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>!</Text>

            <View style={styles.errorTextContainer}>
              <Text style={styles.errorTitle}>
                تعذر تحديث بعض البيانات
              </Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>

            <Pressable
              onPress={handleRefresh}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>إعادة</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.nextPrayerCard}>
          <View style={styles.nextPrayerHeader}>
            <View>
              <Text style={styles.nextPrayerLabel}>
                الصلاة القادمة
              </Text>
              <Text style={styles.nextPrayerHint}>
                الوقت المتبقي
              </Text>
            </View>

            <View style={styles.nextPrayerBadge}>
              <Text style={styles.nextPrayerBadgeText}>
                توقيت محلي
              </Text>
            </View>
          </View>

          {nextPrayer ? (
            <View style={styles.nextPrayerContent}>
              <View style={styles.nextPrayerDetails}>
                <Text style={styles.nextPrayerName}>
                  {nextPrayer.name}
                </Text>

                <Text style={styles.nextPrayerTime}>
                  {nextPrayer.formattedTime}
                </Text>

                <Text style={styles.countdownLabel}>
                  متبقي على الأذان
                </Text>

                <Text style={styles.countdown}>{countdown}</Text>
              </View>

              <View style={styles.nextPrayerIconCircle}>
                <Text style={styles.nextPrayerIcon}>
                  {prayerIcons[nextPrayer.id] || "☾"}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.finishedDayContainer}>
              <Text style={styles.finishedDayIcon}>✓</Text>
              <Text style={styles.finishedDayText}>
                انتهت مواقيت اليوم
              </Text>
              <Text style={styles.finishedDayHint}>
                ستظهر مواقيت الغد عند تحديث البيانات
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>مواقيت اليوم</Text>

          <Text style={styles.sectionAction}>
            {completedCount} / {trackablePrayers.length} مكتملة
          </Text>
        </View>

        <ScrollView
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prayerCarousel}
        >
          {prayerTimes.map((prayer) => {
            const isCompleted =
              completedPrayers[prayer.id] === true;
            const isCurrent = prayer.id === currentPrayerId;
            const isNext = prayer.id === nextPrayer?.id;
            const isSunrise = prayer.id === "sunrise";

            return (
              <View
                key={prayer.id}
                style={[
                  styles.prayerCard,
                  isCurrent && styles.currentPrayerCard,
                  isNext && styles.nextPrayerCardBorder,
                  isSunrise && styles.sunriseCard,
                ]}
              >
                <View style={styles.prayerCardTop}>
                  <View
                    style={[
                      styles.prayerIconContainer,
                      isCurrent &&
                        styles.currentPrayerIconContainer,
                    ]}
                  >
                    <Text style={styles.prayerIcon}>
                      {prayerIcons[prayer.id] || "◉"}
                    </Text>
                  </View>

                  {!isSunrise ? (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={`تسجيل أداء صلاة ${prayer.name}`}
                      accessibilityState={{
                        checked: isCompleted,
                      }}
                      onPress={() =>
                        togglePrayerCompletion(prayer.id)
                      }
                      style={[
                        styles.checkbox,
                        isCompleted && styles.checkedBox,
                      ]}
                    >
                      {isCompleted ? (
                        <Text style={styles.checkmark}>✓</Text>
                      ) : null}
                    </Pressable>
                  ) : (
                    <View style={styles.checkboxPlaceholder} />
                  )}
                </View>

                <Text style={styles.prayerName}>
                  {prayer.name}
                </Text>

                <Text
                  style={[
                    styles.prayerTime,
                    isCurrent && styles.currentPrayerTime,
                    isCompleted && styles.completedPrayerTime,
                  ]}
                >
                  {prayer.formattedTime}
                </Text>

                <View style={styles.prayerStatusContainer}>
                  {isCurrent ? (
                    <Text style={styles.currentStatus}>الآن</Text>
                  ) : null}

                  {!isCurrent && isNext ? (
                    <Text style={styles.nextStatus}>التالي</Text>
                  ) : null}

                  {isCompleted ? (
                    <Text style={styles.completedStatus}>
                      تمت
                    </Text>
                  ) : null}

                  {isSunrise ? (
                    <Text style={styles.sunriseStatus}>
                      الشروق
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                إنجازك اليوم
              </Text>
              <Text style={styles.progressSubtitle}>
                حافظ على صلاتك في وقتها
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>
                {progressPercentage}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressFooter}>
            بارك الله فيك، استمر في المحافظة على صلواتك
          </Text>
        </View>

        <View style={styles.quickActionsHeader}>
          <Text style={styles.sectionTitle}>اختصارات سريعة</Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.quickActionCard}>
            <View
              style={[
                styles.quickActionIcon,
                styles.qiblaIconBackground,
              ]}
            >
              <Text style={styles.quickActionEmoji}>🧭</Text>
            </View>
            <Text style={styles.quickActionTitle}>
              اتجاه القبلة
            </Text>
            <Text style={styles.quickActionSubtitle}>
              تحديد الاتجاه
            </Text>
          </Pressable>

          <Pressable style={styles.quickActionCard}>
            <View
              style={[
                styles.quickActionIcon,
                styles.quranIconBackground,
              ]}
            >
              <Text style={styles.quickActionEmoji}>📖</Text>
            </View>
            <Text style={styles.quickActionTitle}>
              القرآن الكريم
            </Text>
            <Text style={styles.quickActionSubtitle}>
              قراءة واستماع
            </Text>
          </Pressable>

          <Pressable style={styles.quickActionCard}>
            <View
              style={[
                styles.quickActionIcon,
                styles.azkarIconBackground,
              ]}
            >
              <Text style={styles.quickActionEmoji}>✦</Text>
            </View>
            <Text style={styles.quickActionTitle}>
              الأذكار
            </Text>
            <Text style={styles.quickActionSubtitle}>
              وردك اليومي
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },

  container: {
    padding: 20,
    paddingBottom: 42,
  },

  header: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
  },

  greeting: {
    color: "#72efdd",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "right",
  },

  title: {
    color: "#f5f7fb",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "right",
  },

  subtitle: {
    color: "#8997ad",
    fontSize: 13,
    marginTop: 5,
    textAlign: "right",
  },

  kaabaBadge: {
    alignItems: "center",
    backgroundColor: "#172946",
    borderColor: "#2f486c",
    borderRadius: 17,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    marginLeft: 15,
    width: 68,
  },

  kaabaIcon: {
    fontSize: 28,
  },

  kaabaLabel: {
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },

  dateCard: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 13,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  dateItem: {
    flex: 1,
  },

  dateLabel: {
    color: "#7f8da5",
    fontSize: 11,
    marginBottom: 5,
    textAlign: "center",
  },

  dateValue: {
    color: "#e9eef7",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  dateDivider: {
    backgroundColor: "#2b3e5c",
    height: 36,
    width: 1,
  },

  locationCard: {
    alignItems: "center",
    backgroundColor: "#15243d",
    borderColor: "#263e60",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 18,
    padding: 13,
  },

  locationIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.14)",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  locationIcon: {
    color: "#72efdd",
    fontSize: 25,
  },

  locationTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  locationTitle: {
    color: "#f0f5fb",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  locationSubtitle: {
    color: "#8492a9",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  locationStatus: {
    alignItems: "center",
    flexDirection: "row-reverse",
  },

  statusDot: {
    backgroundColor: "#72efdd",
    borderRadius: 4,
    height: 8,
    marginLeft: 5,
    width: 8,
  },

  locationStatusText: {
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "700",
  },

  loadingCard: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 18,
    padding: 22,
  },

  loadingText: {
    color: "#9eafc3",
    fontSize: 13,
    marginTop: 11,
  },

  errorCard: {
    alignItems: "center",
    backgroundColor: "#3a2631",
    borderColor: "#784454",
    borderRadius: 16,
    flexDirection: "row-reverse",
    marginBottom: 18,
    padding: 13,
  },

  errorIcon: {
    alignItems: "center",
    backgroundColor: "#c66b7e",
    borderRadius: 15,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    height: 30,
    lineHeight: 30,
    textAlign: "center",
    width: 30,
  },

  errorTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },

  errorTitle: {
    color: "#ffe5e9",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  errorMessage: {
    color: "#dcb6be",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  retryButton: {
    backgroundColor: "#c66b7e",
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  retryButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },

  nextPrayerCard: {
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 24,
    padding: 19,
  },

  nextPrayerHeader: {
    alignItems: "flex-start",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  nextPrayerLabel: {
    color: "#c1e1e1",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  nextPrayerHint: {
    color: "#81aeb6",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  nextPrayerBadge: {
    backgroundColor: "rgba(114, 239, 221, 0.14)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  nextPrayerBadgeText: {
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
  },

  nextPrayerContent: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 17,
  },

  nextPrayerDetails: {
    alignItems: "flex-end",
  },

  nextPrayerName: {
    color: "#ffffff",
    fontSize: 29,
    fontWeight: "800",
  },

  nextPrayerTime: {
    color: "#72efdd",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  countdownLabel: {
    color: "#9fc5c9",
    fontSize: 11,
    marginTop: 12,
  },

  countdown: {
    color: "#ffffff",
    fontSize: 21,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 3,
  },

  nextPrayerIconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderColor: "rgba(114, 239, 221, 0.28)",
    borderRadius: 43,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    width: 86,
  },

  nextPrayerIcon: {
    color: "#72efdd",
    fontSize: 44,
  },

  finishedDayContainer: {
    alignItems: "center",
    paddingVertical: 22,
  },

  finishedDayIcon: {
    color: "#72efdd",
    fontSize: 32,
    fontWeight: "800",
  },

  finishedDayText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 9,
  },

  finishedDayHint: {
    color: "#9fc5c9",
    fontSize: 11,
    marginTop: 5,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    color: "#f4f7fb",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },

  sectionAction: {
    color: "#72efdd",
    fontSize: 11,
    fontWeight: "700",
  },

  prayerCarousel: {
    paddingBottom: 5,
  },

  prayerCard: {
    backgroundColor: "#15223b",
    borderColor: "#263b5e",
    borderRadius: 18,
    borderWidth: 1,
    marginLeft: 12,
    minHeight: 178,
    padding: 15,
    width: 137,
  },

  currentPrayerCard: {
    backgroundColor: "#174958",
    borderColor: "#5acdc5",
  },

  nextPrayerCardBorder: {
    borderColor: "#72efdd",
  },

  sunriseCard: {
    opacity: 0.82,
  },

  prayerCardTop: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  prayerIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.11)",
    borderRadius: 11,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  currentPrayerIconContainer: {
    backgroundColor: "rgba(114, 239, 221, 0.22)",
  },

  prayerIcon: {
    color: "#72efdd",
    fontSize: 21,
  },

  checkbox: {
    alignItems: "center",
    borderColor: "#6d7d96",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },

  checkboxPlaceholder: {
    height: 22,
    width: 22,
  },

  checkedBox: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },

  checkmark: {
    color: "#102337",
    fontSize: 15,
    fontWeight: "900",
  },

  prayerName: {
    color: "#eaf0f8",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    textAlign: "right",
  },

  prayerTime: {
    color: "#afbdd0",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "right",
  },

  currentPrayerTime: {
    color: "#72efdd",
  },

  completedPrayerTime: {
    color: "#72efdd",
  },

  prayerStatusContainer: {
    alignItems: "flex-start",
    minHeight: 24,
    paddingTop: 10,
  },

  currentStatus: {
    backgroundColor: "rgba(114, 239, 221, 0.18)",
    borderRadius: 7,
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  nextStatus: {
    backgroundColor: "rgba(114, 239, 221, 0.12)",
    borderRadius: 7,
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  completedStatus: {
    color: "#72efdd",
    fontSize: 10,
    fontWeight: "800",
  },

  sunriseStatus: {
    color: "#8492a9",
    fontSize: 10,
    fontWeight: "700",
  },

  progressCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
    padding: 17,
  },

  progressHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  progressTitle: {
    color: "#edf2f8",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  progressSubtitle: {
    color: "#8190a8",
    fontSize: 11,
    marginTop: 5,
    textAlign: "right",
  },

  progressCircle: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.13)",
    borderColor: "#72efdd",
    borderRadius: 27,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },

  progressPercentage: {
    color: "#72efdd",
    fontSize: 13,
    fontWeight: "800",
  },

  progressTrack: {
    backgroundColor: "#293952",
    borderRadius: 5,
    height: 8,
    marginTop: 15,
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: "#72efdd",
    borderRadius: 5,
    height: "100%",
  },

  progressFooter: {
    color: "#8290a7",
    fontSize: 11,
    marginTop: 11,
    textAlign: "right",
  },

  quickActionsHeader: {
    marginBottom: 13,
    marginTop: 24,
  },

  quickActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  quickActionCard: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 13,
    width: "31.5%",
  },

  quickActionIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 45,
    justifyContent: "center",
    width: 45,
  },

  qiblaIconBackground: {
    backgroundColor: "rgba(114, 164, 212, 0.18)",
  },

  quranIconBackground: {
    backgroundColor: "rgba(199, 150, 67, 0.18)",
  },

  azkarIconBackground: {
    backgroundColor: "rgba(114, 199, 182, 0.18)",
  },

  quickActionEmoji: {
    fontSize: 22,
  },

  quickActionTitle: {
    color: "#e9eef7",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 9,
    textAlign: "center",
  },

  quickActionSubtitle: {
    color: "#7f8da5",
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },
});
