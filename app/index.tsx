import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PrayerTime {
  name: string;
  time: string;
  isNext?: boolean;
}

export default function PrayerHomeScreen() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ar-IQ", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayers: PrayerTime[] = [
    { name: "الفجر", time: "04:35 ص" },
    { name: "الشروق", time: "05:58 ص" },
    { name: "الظهر", time: "12:08 م", isNext: true },
    { name: "العصر", time: "03:38 م" },
    { name: "المغرب", time: "06:17 م" },
    { name: "العشاء", time: "07:45 م" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* الترويسة والوقت الحالي */}
        <View style={styles.header}>
          <Text style={styles.title}>صلاتي | SALATY</Text>
          <Text style={styles.clockText}>{currentTime}</Text>
          <Text style={styles.dateText}>مواقيت الصلاة اليومية</Text>
        </View>

        {/* بطاقة الصلاة القادمة */}
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
          <Text style={styles.nextPrayerName}>صلاة الظهر</Text>
          <Text style={styles.nextPrayerTime}>12:08 م</Text>
        </View>

        {/* قائمة مواقيت الصلوات */}
        <View style={styles.listCard}>
          {prayers.map((prayer, index) => (
            <View
              key={index}
              style={[
                styles.prayerRow,
                prayer.isNext && styles.activePrayerRow,
                index === prayers.length - 1 && { borderBottomWidth: 0 },
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

        {/* زر التنبيهات والأذكار */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>الأذكار والتسابيح 📿</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b132b" },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#6fffe9" },
  clockText: { fontSize: 36, fontWeight: "bold", color: "#ffffff", marginVertical: 6 },
  dateText: { fontSize: 14, color: "#a0aec0" },
  nextPrayerCard: {
    backgroundColor: "#1c2541",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3a506b",
  },
  nextPrayerLabel: { color: "#a0aec0", fontSize: 13 },
  nextPrayerName: { color: "#ffffff", fontSize: 24, fontWeight: "bold", marginVertical: 4 },
  nextPrayerTime: { color: "#48cae4", fontSize: 28, fontWeight: "bold" },
  listCard: {
    backgroundColor: "#1c2541",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  prayerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3748",
  },
  activePrayerRow: {
    backgroundColor: "rgba(72, 202, 228, 0.1)",
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  prayerName: { color: "#edf2f7", fontSize: 16, fontWeight: "600" },
  prayerTime: { color: "#cbd5e0", fontSize: 16 },
  activeText: { color: "#48cae4", fontWeight: "bold" },
  actionBtn: {
    backgroundColor: "#1f4068",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

