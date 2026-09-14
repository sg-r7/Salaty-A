import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const ATHKAR = [
  "سُبْحَانَ اللَّهِ",
  "الْحَمْدُ لِلَّهِ",
  "لَا إِلَهَ إِلَّا اللَّهُ",
  "اللَّهُ أَكْبَرُ",
  "أَسْتَغْفِرُ اللَّهَ",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
  "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
];

export default function TasbeehScreen() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentThikrIndex, setCurrentThikrIndex] = useState(0);

  const handleIncrement = () => {
    Vibration.vibrate(40);
    setCount((prev) => prev + 1);
    setTotalCount((prev) => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const nextThikr = () => {
    setCurrentThikrIndex((prev) => (prev + 1) % ATHKAR.length);
    setCount(0);
  };

  const prevThikr = () => {
    setCurrentThikrIndex((prev) => (prev - 1 + ATHKAR.length) % ATHKAR.length);
    setCount(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← عودة</Text>
        </TouchableOpacity>
        <Text style={styles.title}>المسبحة الإلكترونية</Text>
      </View>

      <View style={styles.body}>
        {/* اختيار الذكر */}
        <View style={styles.thikrCard}>
          <TouchableOpacity onPress={prevThikr} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.thikrText}>{ATHKAR[currentThikrIndex]}</Text>
          <TouchableOpacity onPress={nextThikr} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* المجموع الكلي */}
        <Text style={styles.totalText}>إجمالي التسابيح: {totalCount}</Text>

        {/* زر التسبيح الدائري */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleIncrement}
          style={styles.counterCircle}
        >
          <Text style={styles.counterText}>{count}</Text>
          <Text style={styles.tapText}>اضغط للتسبيح</Text>
        </TouchableOpacity>

        {/* زر التصفير */}
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>إعادة ضبط العداد الحالي</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b132b" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  backBtn: { padding: 8 },
  backText: { color: "#6fffe9", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
  body: { flex: 1, alignItems: "center", justifyContent: "space-around", paddingBottom: 30 },
  thikrCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1c2541",
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 14,
    width: "88%",
  },
  arrowBtn: { paddingHorizontal: 12 },
  arrowText: { color: "#48cae4", fontSize: 28, fontWeight: "bold" },
  thikrText: { color: "#edf2f7", fontSize: 18, fontWeight: "bold", textAlign: "center", flex: 1 },
  totalText: { color: "#a0aec0", fontSize: 15 },
  counterCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#1c2541",
    borderWidth: 6,
    borderColor: "#48cae4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#48cae4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  counterText: { fontSize: 56, fontWeight: "bold", color: "#6fffe9" },
  tapText: { color: "#a0aec0", fontSize: 13, marginTop: 4 },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(220, 38, 38, 0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  resetText: { color: "#fca5a5", fontSize: 14, fontWeight: "600" },
});
