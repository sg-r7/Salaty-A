import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Surah {
  id: number;
  name: string;
  verses: number;
}

interface Juz {
  id: number;
  name: string;
  start: string;
}

const surahs: Surah[] = [
  { id: 1, name: "الفاتحة", verses: 7 },
  { id: 2, name: "البقرة", verses: 286 },
  { id: 3, name: "آل عمران", verses: 200 },
  { id: 4, name: "النساء", verses: 176 },
  { id: 5, name: "المائدة", verses: 120 },
  { id: 6, name: "الأنعام", verses: 165 },
  { id: 7, name: "الأعراف", verses: 206 },
  { id: 8, name: "الأنفال", verses: 75 },
  { id: 9, name: "التوبة", verses: 129 },
  { id: 10, name: "يونس", verses: 109 },
  { id: 11, name: "هود", verses: 123 },
  { id: 12, name: "يوسف", verses: 111 },
  { id: 13, name: "الرعد", verses: 43 },
  { id: 14, name: "إبراهيم", verses: 52 },
  { id: 15, name: "الحجر", verses: 99 },
  { id: 16, name: "النحل", verses: 128 },
  { id: 17, name: "الإسراء", verses: 111 },
  { id: 18, name: "الكهف", verses: 110 },
  { id: 19, name: "مريم", verses: 98 },
  { id: 20, name: "طه", verses: 135 },
  { id: 21, name: "الأنبياء", verses: 112 },
  { id: 22, name: "الحج", verses: 78 },
  { id: 23, name: "المؤمنون", verses: 118 },
  { id: 24, name: "النور", verses: 64 },
  { id: 25, name: "الفرقان", verses: 77 },
  { id: 26, name: "الشعراء", verses: 227 },
  { id: 27, name: "النمل", verses: 93 },
  { id: 28, name: "القصص", verses: 88 },
  { id: 29, name: "العنكبوت", verses: 69 },
  { id: 30, name: "الروم", verses: 60 },
  { id: 31, name: "لقمان", verses: 34 },
  { id: 32, name: "السجدة", verses: 30 },
  { id: 33, name: "الأحزاب", verses: 73 },
  { id: 34, name: "سبأ", verses: 54 },
  { id: 35, name: "فاطر", verses: 45 },
  { id: 36, name: "يس", verses: 83 },
  { id: 37, name: "الصافات", verses: 182 },
  { id: 38, name: "ص", verses: 88 },
  { id: 39, name: "الزمر", verses: 75 },
  { id: 40, name: "غافر", verses: 85 },
  { id: 41, name: "فصلت", verses: 54 },
  { id: 42, name: "الشورى", verses: 53 },
  { id: 43, name: "الزخرف", verses: 89 },
  { id: 44, name: "الدخان", verses: 59 },
  { id: 45, name: "الجاثية", verses: 37 },
  { id: 46, name: "الأحقاف", verses: 35 },
  { id: 47, name: "محمد", verses: 38 },
  { id: 48, name: "الفتح", verses: 29 },
  { id: 49, name: "الحجرات", verses: 18 },
  { id: 50, name: "ق", verses: 45 },
  { id: 51, name: "الذاريات", verses: 60 },
  { id: 52, name: "الطور", verses: 49 },
  { id: 53, name: "النجم", verses: 62 },
  { id: 54, name: "القمر", verses: 55 },
  { id: 55, name: "الرحمن", verses: 78 },
  { id: 56, name: "الواقعة", verses: 96 },
  { id: 57, name: "الحديد", verses: 29 },
  { id: 58, name: "المجادلة", verses: 22 },
  { id: 59, name: "الحشر", verses: 24 },
  { id: 60, name: "الممتحنة", verses: 13 },
  { id: 61, name: "الصف", verses: 14 },
  { id: 62, name: "الجمعة", verses: 11 },
  { id: 63, name: "المنافقون", verses: 11 },
  { id: 64, name: "التغابن", verses: 18 },
  { id: 65, name: "الطلاق", verses: 12 },
  { id: 66, name: "التحريم", verses: 12 },
  { id: 67, name: "الملك", verses: 30 },
  { id: 68, name: "القلم", verses: 52 },
  { id: 69, name: "الحاقة", verses: 52 },
  { id: 70, name: "المعارج", verses: 44 },
  { id: 71, name: "نوح", verses: 28 },
  { id: 72, name: "الجن", verses: 28 },
  { id: 73, name: "المزمل", verses: 20 },
  { id: 74, name: "المدثر", verses: 56 },
  { id: 75, name: "القيامة", verses: 40 },
  { id: 76, name: "الإنسان", verses: 31 },
  { id: 77, name: "المرسلات", verses: 50 },
  { id: 78, name: "النبأ", verses: 40 },
  { id: 79, name: "النازعات", verses: 46 },
  { id: 80, name: "عبس", verses: 42 },
  { id: 81, name: "التكوير", verses: 29 },
  { id: 82, name: "الانفطار", verses: 19 },
  { id: 83, name: "المطففين", verses: 36 },
  { id: 84, name: "الانشقاق", verses: 25 },
  { id: 85, name: "البروج", verses: 22 },
  { id: 86, name: "الطارق", verses: 17 },
  { id: 87, name: "الأعلى", verses: 19 },
  { id: 88, name: "الغاشية", verses: 26 },
  { id: 89, name: "الفجر", verses: 30 },
  { id: 90, name: "البلد", verses: 20 },
  { id: 91, name: "الشمس", verses: 15 },
  { id: 92, name: "الليل", verses: 21 },
  { id: 93, name: "الضحى", verses: 11 },
  { id: 94, name: "الشرح", verses: 8 },
  { id: 95, name: "التين", verses: 8 },
  { id: 96, name: "العلق", verses: 19 },
  { id: 97, name: "القدر", verses: 5 },
  { id: 98, name: "البينة", verses: 8 },
  { id: 99, name: "الزلزلة", verses: 8 },
  { id: 100, name: "العاديات", verses: 11 },
  { id: 101, name: "القارعة", verses: 11 },
  { id: 102, name: "التكاثر", verses: 8 },
  { id: 103, name: "العصر", verses: 3 },
  { id: 104, name: "الهمزة", verses: 9 },
  { id: 105, name: "الفيل", verses: 5 },
  { id: 106, name: "قريش", verses: 4 },
  { id: 107, name: "الماعون", verses: 7 },
  { id: 108, name: "الكوثر", verses: 3 },
  { id: 109, name: "الكافرون", verses: 6 },
  { id: 110, name: "النصر", verses: 3 },
  { id: 111, name: "المسد", verses: 5 },
  { id: 112, name: "الإخلاص", verses: 4 },
  { id: 113, name: "الفلق", verses: 5 },
  { id: 114, name: "الناس", verses: 6 },
];

const juzs: Juz[] = [
  { id: 1, name: "الجزء الأول", start: "الفاتحة 1" },
  { id: 2, name: "الجزء الثاني", start: "البقرة 142" },
  { id: 3, name: "الجزء الثالث", start: "البقرة 253" },
  { id: 4, name: "الجزء الرابع", start: "آل عمران 93" },
  { id: 5, name: "الجزء الخامس", start: "النساء 24" },
  { id: 6, name: "الجزء السادس", start: "النساء 148" },
  { id: 7, name: "الجزء السابع", start: "المائدة 82" },
  { id: 8, name: "الجزء الثامن", start: "الأنعام 111" },
  { id: 9, name: "الجزء التاسع", start: "الأعراف 88" },
  { id: 10, name: "الجزء العاشر", start: "الأنفال 41" },
  { id: 11, name: "الجزء الحادي عشر", start: "التوبة 94" },
  { id: 12, name: "الجزء الثاني عشر", start: "هود 6" },
  { id: 13, name: "الجزء الثالث عشر", start: "يوسف 53" },
  { id: 14, name: "الجزء الرابع عشر", start: "الحجر 1" },
  { id: 15, name: "الجزء الخامس عشر", start: "الإسراء 1" },
  { id: 16, name: "الجزء السادس عشر", start: "الكهف 75" },
  { id: 17, name: "الجزء السابع عشر", start: "الأنبياء 1" },
  { id: 18, name: "الجزء الثامن عشر", start: "المؤمنون 1" },
  { id: 19, name: "الجزء التاسع عشر", start: "الفرقان 21" },
  { id: 20, name: "الجزء العشرون", start: "النمل 56" },
  { id: 21, name: "الجزء الحادي والعشرون", start: "العنكبوت 46" },
  { id: 22, name: "الجزء الثاني والعشرون", start: "الأحزاب 31" },
  { id: 23, name: "الجزء الثالث والعشرون", start: "يس 22" },
  { id: 24, name: "الجزء الرابع والعشرون", start: "الزمر 32" },
  { id: 25, name: "الجزء الخامس والعشرون", start: "فصلت 47" },
  { id: 26, name: "الجزء السادس والعشرون", start: "الأحقاف 1" },
  { id: 27, name: "الجزء السابع والعشرون", start: "الذاريات 31" },
  { id: 28, name: "الجزء الثامن والعشرون", start: "المجادلة 1" },
  { id: 29, name: "الجزء التاسع والعشرون", start: "الملك 1" },
  { id: 30, name: "الجزء الثلاثون", start: "النبأ 1" },
];

export default function QuranTab() {
  const [activeTab, setActiveTab] = useState<"surahs" | "juzs">(
    "surahs"
  );
  const [bookmarkedSurah, setBookmarkedSurah] = useState<number | null>(
    null
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>القرآن الكريم</Text>
          <Text style={styles.subtitle}>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</Text>
        </View>

        <View style={styles.lastReadCard}>
          <View>
            <Text style={styles.lastReadLabel}>آخر قراءة</Text>
            <Text style={styles.lastReadTitle}>سورة الكهف</Text>
            <Text style={styles.lastReadSubtitle}>الآية 12 من 110</Text>
          </View>

          <View style={styles.continueButton}>
            <Text style={styles.continueText}>متابعة</Text>
            <Text style={styles.continueArrow}>←</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setActiveTab("juzs")}
            style={[
              styles.tab,
              activeTab === "juzs" && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "juzs" && styles.activeTabText,
              ]}
            >
              أجزاء
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("surahs")}
            style={[
              styles.tab,
              activeTab === "surahs" && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "surahs" && styles.activeTabText,
              ]}
            >
              سور
            </Text>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          {activeTab === "surahs"
            ? surahs.map((surah) => (
                <View key={surah.id} style={styles.itemRow}>
                  <View style={styles.numberBox}>
                    <Text style={styles.numberText}>{surah.id}</Text>
                  </View>

                  <View style={styles.itemTextBox}>
                    <Text style={styles.itemTitle}>{surah.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      {surah.verses} آية
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setBookmarkedSurah(
                        bookmarkedSurah === surah.id ? null : surah.id
                      )
                    }
                    style={styles.bookmarkButton}
                  >
                    <Text
                      style={[
                        styles.bookmark,
                        bookmarkedSurah === surah.id &&
                          styles.bookmarkActive,
                      ]}
                    >
                      {bookmarkedSurah === surah.id ? "★" : "☆"}
                    </Text>
                  </Pressable>
                </View>
              ))
            : juzs.map((juz) => (
                <View key={juz.id} style={styles.itemRow}>
                  <View style={styles.numberBox}>
                    <Text style={styles.numberText}>{juz.id}</Text>
                  </View>

                  <View style={styles.itemTextBox}>
                    <Text style={styles.itemTitle}>{juz.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      يبدأ من {juz.start}
                    </Text>
                  </View>

                  <Pressable style={styles.bookmarkButton}>
                    <Text style={styles.bookmark}>›</Text>
                  </Pressable>
                </View>
              ))}
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
    paddingBottom: 35,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#f5f7fb",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    color: "#72efdd",
    fontSize: 14,
    marginTop: 6,
    textAlign: "right",
  },
  lastReadCard: {
    alignItems: "center",
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 22,
    padding: 18,
  },
  lastReadLabel: {
    color: "#a6cdd1",
    fontSize: 12,
    textAlign: "right",
  },
  lastReadTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "right",
  },
  lastReadSubtitle: {
    color: "#72efdd",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: "#72efdd",
    borderRadius: 12,
    flexDirection: "row-reverse",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  continueText: {
    color: "#102337",
    fontSize: 12,
    fontWeight: "800",
  },
  continueArrow: {
    color: "#102337",
    fontSize: 17,
    fontWeight: "800",
  },
  tabs: {
    backgroundColor: "#121e35",
    borderRadius: 13,
    flexDirection: "row-reverse",
    marginBottom: 15,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingVertical: 11,
  },
  activeTab: {
    backgroundColor: "#244b57",
  },
  tabText: {
    color: "#8492a9",
    fontSize: 14,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#72efdd",
  },
  listCard: {
    backgroundColor: "#121e35",
    borderColor: "#223654",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  itemRow: {
    alignItems: "center",
    borderBottomColor: "#263750",
    borderBottomWidth: 1,
    flexDirection: "row-reverse",
    minHeight: 70,
  },
  numberBox: {
    alignItems: "center",
    backgroundColor: "#1e3150",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  numberText: {
    color: "#72efdd",
    fontSize: 13,
    fontWeight: "800",
  },
  itemTextBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemTitle: {
    color: "#edf2f8",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  itemSubtitle: {
    color: "#8290a7",
    fontSize: 11,
    marginTop: 5,
    textAlign: "right",
  },
  bookmarkButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 35,
  },
  bookmark: {
    color: "#8090a8",
    fontSize: 25,
  },
  bookmarkActive: {
    color: "#72efdd",
  },
});

