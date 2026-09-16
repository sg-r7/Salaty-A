import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface IslamicEvent {
  id: string;
  title: string;
  hijriDate: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const ARABIC_WEEKDAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: "ashura",
    title: "يوم عاشوراء",
    hijriDate: "10 محرم",
    description: "يُستحب صيام يوم عاشوراء.",
    icon: "moon-outline",
    color: "#72efdd",
  },
  {
    id: "mawlid",
    title: "المولد النبوي الشريف",
    hijriDate: "12 ربيع الأول",
    description: "مناسبة للتذكير بسيرة النبي صلى الله عليه وسلم.",
    icon: "star-outline",
    color: "#f6c667",
  },
  {
    id: "isra",
    title: "ذكرى الإسراء والمعراج",
    hijriDate: "27 رجب",
    description: "ذكرى رحلة الإسراء والمعراج.",
    icon: "sparkles-outline",
    color: "#a78bfa",
  },
  {
    id: "shaban",
    title: "ليلة النصف من شعبان",
    hijriDate: "15 شعبان",
    description: "ليلة مباركة عند كثير من المسلمين.",
    icon: "moon-outline",
    color: "#77b8e8",
  },
  {
    id: "ramadan",
    title: "بداية شهر رمضان",
    hijriDate: "1 رمضان",
    description: "بداية شهر الصيام والقرآن.",
    icon: "moon",
    color: "#72efdd",
  },
  {
    id: "badre",
    title: "غزوة بدر الكبرى",
    hijriDate: "17 رمضان",
    description: "ذكرى غزوة بدر الكبرى.",
    icon: "flag-outline",
    color: "#e8a87c",
  },
  {
    id: "laylat-al-qadr",
    title: "ليلة القدر",
    hijriDate: "27 رمضان تقريباً",
    description: "ليلة خير من ألف شهر.",
    icon: "sparkles",
    color: "#f6c667",
  },
  {
    id: "eid-fitr",
    title: "عيد الفطر المبارك",
    hijriDate: "1 شوال",
    description: "أول أيام عيد الفطر المبارك.",
    icon: "gift-outline",
    color: "#7dd3a8",
  },
  {
    id: "arafah",
    title: "يوم عرفة",
    hijriDate: "9 ذو الحجة",
    description: "يُستحب صيامه لغير الحاج.",
    icon: "location-outline",
    color: "#72efdd",
  },
  {
    id: "eid-adha",
    title: "عيد الأضحى المبارك",
    hijriDate: "10 ذو الحجة",
    description: "أول أيام عيد الأضحى المبارك.",
    icon: "gift-outline",
    color: "#7dd3a8",
  },
  {
    id: "tashreeq",
    title: "أيام التشريق",
    hijriDate: "11 - 13 ذو الحجة",
    description: "أيام ذكر وشكر لله تعالى.",
    icon: "sunny-outline",
    color: "#e8a87c",
  },
];

function getDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isSameDay(first: Date, second: Date): boolean {
  return getDateKey(first) === getDateKey(second);
}

function getMonthDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const days: CalendarDay[] = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    const dayNumber = daysInPreviousMonth - index;

    days.push({
      date: new Date(year, month - 1, dayNumber),
      dayNumber,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const date = new Date(year, month, dayNumber);

    days.push({
      date,
      dayNumber,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  const remainingDays = (7 - (days.length % 7)) % 7;

  for (let dayNumber = 1; dayNumber <= remainingDays; dayNumber += 1) {
    days.push({
      date: new Date(year, month + 1, dayNumber),
      dayNumber,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
}

function formatHijriDate(date: Date): string {
  return date.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortHijriDate(date: Date): string {
  return date.toLocaleDateString("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getTodayDate(): Date {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

export default function CalendarScreen() {
  const router = useRouter();
  const today = useMemo(() => getTodayDate(), []);

  const [displayedMonth, setDisplayedMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(today);

  const monthDays = useMemo(
    () => getMonthDays(displayedMonth),
    [displayedMonth]
  );

  const selectedHijriDate = formatHijriDate(selectedDate);
  const selectedGregorianDate = formatGregorianDate(selectedDate);

  const moveMonth = (direction: number) => {
    setDisplayedMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + direction,
          1
        )
    );
  };

  const goToToday = () => {
    setDisplayedMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setSelectedDate(today);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="العودة"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-forward"
              size={23}
              color="#dce8f3"
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>التقويم الهجري</Text>
            <Text style={styles.subtitle}>
              المناسبات والأيام الإسلامية
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar-outline"
              size={25}
              color="#72efdd"
            />
          </View>
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayIconContainer}>
            <Ionicons
              name="today-outline"
              size={26}
              color="#72efdd"
            />
          </View>

          <View style={styles.todayTextContainer}>
            <Text style={styles.todayTitle}>تاريخ اليوم</Text>
            <Text style={styles.todayHijri}>
              {formatShortHijriDate(today)}
            </Text>
            <Text style={styles.todayGregorian}>
              {formatGregorianDate(today)}
            </Text>
          </View>

          <Pressable
            onPress={goToToday}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>اليوم</Text>
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الشهر السابق"
              onPress={() => moveMonth(-1)}
              style={styles.monthArrow}
            >
              <Ionicons
                name="chevron-forward"
                size={21}
                color="#72efdd"
              />
            </Pressable>

            <View style={styles.monthTitleContainer}>
              <Text style={styles.monthTitle}>
                {ARABIC_MONTHS[displayedMonth.getMonth()]}
              </Text>
              <Text style={styles.monthYear}>
                {displayedMonth.getFullYear()}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="الشهر التالي"
              onPress={() => moveMonth(1)}
              style={styles.monthArrow}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#72efdd"
              />
            </Pressable>
          </View>

          <View style={styles.weekHeader}>
            {ARABIC_WEEKDAYS.map((weekday) => (
              <Text key={weekday} style={styles.weekdayText}>
                {weekday.slice(0, 2)}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {monthDays.map((day) => {
              const selected = isSameDay(day.date, selectedDate);

              return (
                <Pressable
                  key={getDateKey(day.date)}
                  onPress={() => setSelectedDate(day.date)}
                  style={[
                    styles.dayCell,
                    !day.isCurrentMonth &&
                      styles.outsideMonthCell,
                    day.isToday && styles.todayCell,
                    selected && styles.selectedDayCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      !day.isCurrentMonth &&
                        styles.outsideMonthText,
                      day.isToday && styles.todayText,
                      selected && styles.selectedDayText,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>

                  {day.isToday ? (
                    <View
                      style={[
                        styles.todayDot,
                        selected && styles.selectedTodayDot,
                      ]}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.selectedDateCard}>
          <View style={styles.selectedDateIcon}>
            <Ionicons
              name="moon-outline"
              size={24}
              color="#a78bfa"
            />
          </View>

          <View style={styles.selectedDateTextContainer}>
            <Text style={styles.selectedDateLabel}>
              التاريخ المحدد
            </Text>
            <Text style={styles.selectedDateHijri}>
              {selectedHijriDate}
            </Text>
            <Text style={styles.selectedDateGregorian}>
              {selectedGregorianDate}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            المناسبات الإسلامية
          </Text>
          <Text style={styles.sectionHint}>
            حسب التقويم الهجري
          </Text>
        </View>

        <View style={styles.eventsCard}>
          {ISLAMIC_EVENTS.map((event, index) => (
            <View
              key={event.id}
              style={[
                styles.eventRow,
                index === ISLAMIC_EVENTS.length - 1 &&
                  styles.lastEventRow,
              ]}
            >
              <View
                style={[
                  styles.eventIconContainer,
                  { backgroundColor: `${event.color}20` },
                ]}
              >
                <Ionicons
                  name={event.icon}
                  size={22}
                  color={event.color}
                />
              </View>

              <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>
                  {event.title}
                </Text>
                <Text style={styles.eventDescription}>
                  {event.description}
                </Text>
              </View>

              <View style={styles.eventDateBadge}>
                <Text
                  style={[
                    styles.eventDateText,
                    { color: event.color },
                  ]}
                >
                  {event.hijriDate}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#72efdd"
          />

          <Text style={styles.noteText}>
            قد تختلف تواريخ المناسبات الهجرية بيوم واحد حسب رؤية
            الهلال والجهة الرسمية المعتمدة في بلدك. التواريخ
            المعروضة للتذكير العام.
          </Text>
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
    paddingBottom: 45,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    alignItems: "center",
    backgroundColor: "#172946",
    borderColor: "#2e4668",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerTextContainer: {
    alignItems: "flex-end",
    flex: 1,
    marginHorizontal: 12,
  },

  title: {
    color: "#f5f7fb",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "right",
  },

  subtitle: {
    color: "#72efdd",
    fontSize: 13,
    marginTop: 5,
    textAlign: "right",
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.13)",
    borderColor: "#2b6e7d",
    borderRadius: 13,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  todayCard: {
    alignItems: "center",
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 18,
    padding: 15,
  },

  todayIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    width: 50,
  },

  todayTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  todayTitle: {
    color: "#a8cdd1",
    fontSize: 11,
    textAlign: "right",
  },

  todayHijri: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "right",
  },

  todayGregorian: {
    color: "#72efdd",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  todayButton: {
    backgroundColor: "#72efdd",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  todayButtonText: {
    color: "#102337",
    fontSize: 11,
    fontWeight: "800",
  },

  calendarCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 19,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },

  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  monthArrow: {
    alignItems: "center",
    backgroundColor: "#1a2d49",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  monthTitleContainer: {
    alignItems: "center",
  },

  monthTitle: {
    color: "#f1f6fa",
    fontSize: 18,
    fontWeight: "800",
  },

  monthYear: {
    color: "#72efdd",
    fontSize: 12,
    marginTop: 3,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 7,
  },

  weekdayText: {
    color: "#8290a7",
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    alignItems: "center",
    height: 47,
    justifyContent: "center",
    position: "relative",
    width: "14.285%",
  },

  outsideMonthCell: {
    opacity: 0.35,
  },

  todayCell: {
    backgroundColor: "rgba(114, 239, 221, 0.12)",
    borderRadius: 12,
  },

  selectedDayCell: {
    backgroundColor: "#72efdd",
    borderRadius: 12,
  },

  dayNumber: {
    color: "#e7eef6",
    fontSize: 14,
    fontWeight: "700",
  },

  outsideMonthText: {
    color: "#62718a",
  },

  todayText: {
    color: "#72efdd",
    fontWeight: "900",
  },

  selectedDayText: {
    color: "#102337",
    fontWeight: "900",
  },

  todayDot: {
    backgroundColor: "#72efdd",
    borderRadius: 2,
    bottom: 5,
    height: 4,
    position: "absolute",
    width: 4,
  },

  selectedTodayDot: {
    backgroundColor: "#102337",
  },

  selectedDateCard: {
    alignItems: "center",
    backgroundColor: "#15243d",
    borderColor: "#2b4565",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 22,
    padding: 14,
  },

  selectedDateIcon: {
    alignItems: "center",
    backgroundColor: "rgba(167, 139, 250, 0.15)",
    borderRadius: 12,
    height: 45,
    justifyContent: "center",
    width: 45,
  },

  selectedDateTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  selectedDateLabel: {
    color: "#8290a7",
    fontSize: 11,
    textAlign: "right",
  },

  selectedDateHijri: {
    color: "#f0f5fb",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "right",
  },

  selectedDateGregorian: {
    color: "#a78bfa",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitle: {
    color: "#eaf0f7",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
  },

  sectionHint: {
    color: "#8290a7",
    fontSize: 10,
  },

  eventsCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 17,
    paddingHorizontal: 14,
  },

  eventRow: {
    alignItems: "center",
    borderBottomColor: "#263a56",
    borderBottomWidth: 1,
    flexDirection: "row-reverse",
    minHeight: 78,
  },

  lastEventRow: {
    borderBottomWidth: 0,
  },

  eventIconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 43,
    justifyContent: "center",
    width: 43,
  },

  eventTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },

  eventTitle: {
    color: "#edf3f9",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  eventDescription: {
    color: "#8290a7",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 4,
    textAlign: "right",
  },

  eventDateBadge: {
    backgroundColor: "#1b2c47",
    borderRadius: 8,
    maxWidth: 78,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },

  eventDateText: {
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  noteCard: {
    alignItems: "flex-start",
    backgroundColor: "#12283a",
    borderColor: "#235064",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    padding: 13,
  },

  noteText: {
    color: "#a9bfca",
    flex: 1,
    fontSize: 11,
    lineHeight: 19,
    marginRight: 9,
    textAlign: "right",
  },
});

