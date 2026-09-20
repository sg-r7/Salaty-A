import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AzkarCategory = "morning" | "evening" | "after_prayer" | "sleep";

interface Zikr {
  id: string;
  category: AzkarCategory;
  text: string;
  targetCount: number;
  reward?: string;
  reference?: string;
}

const STORAGE_KEY_AZKAR = "@salaty_azkar_counts";

const CATEGORIES: Array<{
  id: AzkarCategory;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  { id: "morning", title: "أذكار الصباح", icon: "sunny-outline", color: "#f6c667" },
  { id: "evening", title: "أذكار المساء", icon: "moon-outline", color: "#72efdd" },
  { id: "after_prayer", title: "بعد الصلاة", icon: "sparkles-outline", color: "#a78bfa" },
  { id: "sleep", title: "أذكار النوم", icon: "bed-outline", color: "#77b8e8" },
];

const AZKAR_DATA: Zikr[] = [
  // Morning
  {
    id: "m1",
    category: "morning",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    targetCount: 1,
    reference: "رواه مسلم",
  },
  {
    id: "m2",
    category: "morning",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
    targetCount: 1,
    reward: "من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح.",
    reference: "سيد الاستغفار - رواه البخاري",
  },
  {
    id: "m3",
    category: "morning",
    text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    targetCount: 3,
    reward: "لم يضره شيء.",
    reference: "رواه الترمذي وأبو داود",
  },
  {
    id: "m4",
    category: "morning",
    text: "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً.",
    targetCount: 3,
    reward: "كان حقاً على الله أن يرضيه.",
    reference: "رواه الترمذي",
  },
  {
    id: "m5",
    category: "morning",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
    targetCount: 3,
    reference: "رواه مسلم",
  },
  {
    id: "m6",
    category: "morning",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    targetCount: 100,
    reward: "حُطّت خطاياه وإن كانت مثل زبد البحر.",
    reference: "رواه البخاري ومسلم",
  },

  // Evening
  {
    id: "e1",
    category: "evening",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    targetCount: 1,
    reference: "رواه مسلم",
  },
  {
    id: "e2",
    category: "evening",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    targetCount: 3,
    reward: "لم تضره حمة تلك الليلة.",
    reference: "رواه مسلم",
  },
  {
    id: "e3",
    category: "evening",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
    targetCount: 1,
    reference: "رواه الترمذي",
  },
  {
    id: "e4",
    category: "evening",
    text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    targetCount: 3,
    reference: "رواه الترمذي",
  },

  // After Prayer
  {
    id: "ap1",
    category: "after_prayer",
    text: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.",
    targetCount: 1,
    reference: "رواه مسلم",
  },
  {
    id: "ap2",
    category: "after_prayer",
    text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
    targetCount: 1,
    reference: "رواه مسلم",
  },
  {
    id: "ap3",
    category: "after_prayer",
    text: "سُبْحَانَ اللَّهِ.",
    targetCount: 33,
    reference: "التسبيح بعد الصلاة",
  },
  {
    id: "ap4",
    category: "after_prayer",
    text: "الْحَمْدُ لِلَّهِ.",
    targetCount: 33,
    reference: "التحميد بعد الصلاة",
  },
  {
    id: "ap5",
    category: "after_prayer",
    text: "اللَّهُ أَكْبَرُ.",
    targetCount: 33,
    reference: "التكبير بعد الصلاة",
  },
  {
    id: "ap6",
    category: "after_prayer",
    text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
    targetCount: 1,
    reward: "تمام المائة - غفرت خطاياه وإن كانت مثل زبد البحر.",
    reference: "رواه مسلم",
  },

  // Sleep
  {
    id: "s1",
    category: "sleep",
    text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِن أَمْسَكْتَ نَفْسِي فارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
    targetCount: 1,
    reference: "رواه البخاري ومسلم",
  },
  {
    id: "s2",
    category: "sleep",
    text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.",
    targetCount: 3,
    reference: "رواه أبو داود والترمذي",
  },
  {
    id: "s3",
    category: "sleep",
    text: "سُبْحَانَ اللَّهِ (٣٣)، وَالْحَمْدُ لِلَّهِ (٣٣)، وَاللَّهُ أَكْبَرُ (٣٤).",
    targetCount: 1,
    reward: "خير لكما من خادم.",
    reference: "رواه البخاري ومسلم",
  },
];

export default function AzkarTab() {
  const [activeCategory, setActiveCategory] = useState<AzkarCategory>("morning");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_AZKAR);
      if (stored) {
        setCounts(JSON.parse(stored));
      }
    } catch {
      // Ignored
    }
  };

  const saveCounts = async (updated: Record<string, number>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AZKAR, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const currentAzkar = useMemo(() => {
    return AZKAR_DATA.filter((z) => z.category === activeCategory);
  }, [activeCategory]);

  const categoryProgress = useMemo(() => {
    if (currentAzkar.length === 0) return 0;
    const completed = currentAzkar.filter((z) => {
      const current = counts[z.id] || 0;
      return current >= z.targetCount;
    }).length;
    return Math.round((completed / currentAzkar.length) * 100);
  }, [counts, currentAzkar]);

  const handleIncrement = (zikr: Zikr) => {
    const current = counts[zikr.id] || 0;
    if (current < zikr.targetCount) {
      const updated = { ...counts, [zikr.id]: current + 1 };
      setCounts(updated);
      saveCounts(updated);
    }
  };

  const handleResetCategory = () => {
    Alert.alert("إعادة ضبط", "هل تريد تصفير عداد أذكار هذا القسم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تصفير",
        style: "destructive",
        onPress: () => {
          const updated = { ...counts };
          currentAzkar.forEach((z) => {
            delete updated[z.id];
          });
          setCounts(updated);
          saveCounts(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>الأذكار والورد اليومي</Text>
            <Text style={styles.subtitle}>أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="heart-outline" size={26} color="#72efdd" />
          </View>
        </View>

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoriesScroll,
            styles.rtlHorizontalContent,
          ]}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={isSelected ? "#102337" : cat.color}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            <View>
              <Text style={styles.progressTitle}>إنجاز الورد</Text>
              <Text style={styles.progressSubtitle}>
                أتممت {currentAzkar.filter((z) => (counts[z.id] || 0) >= z.targetCount).length} من {currentAzkar.length} أذكار
              </Text>
            </View>

            <View style={styles.progressRightGroup}>
              <Text style={styles.progressPercentage}>{categoryProgress}%</Text>
              <Pressable onPress={handleResetCategory} style={styles.resetBtn}>
                <Ionicons name="refresh-outline" size={16} color="#72efdd" />
              </Pressable>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${categoryProgress}%` }]} />
          </View>
        </View>

        {/* Azkar List */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {currentAzkar.map((zikr, index) => {
            const current = counts[zikr.id] || 0;
            const isDone = current >= zikr.targetCount;
            const remaining = zikr.targetCount - current;

            return (
              <View
                key={zikr.id}
                style={[styles.zikrCard, isDone && styles.zikrCardDone]}
              >
                <View style={styles.zikrHeader}>
                  <View style={styles.zikrIndexBadge}>
                    <Text style={styles.zikrIndexText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.zikrTargetText}>
                    التكرار: {zikr.targetCount}
                  </Text>
                </View>

                <Text style={styles.zikrText}>{zikr.text}</Text>

                {zikr.reward ? (
                  <View style={styles.rewardBox}>
                    <Ionicons name="star" size={14} color="#f6c667" />
                    <Text style={styles.rewardText}>{zikr.reward}</Text>
                  </View>
                ) : null}

                {zikr.reference ? (
                  <Text style={styles.referenceText}>{zikr.reference}</Text>
                ) : null}

                {/* Counter Interactive Button */}
                <Pressable
                  disabled={isDone}
                  onPress={() => handleIncrement(zikr)}
                  style={({ pressed }) => [
                    styles.counterButton,
                    isDone && styles.counterButtonDone,
                    pressed && !isDone && styles.counterButtonPressed,
                  ]}
                >
                  {isDone ? (
                    <View style={styles.doneRow}>
                      <Ionicons name="checkmark-circle" size={20} color="#102337" />
                      <Text style={styles.doneText}>تم بحمد الله</Text>
                    </View>
                  ) : (
                    <View style={styles.countingRow}>
                      <Text style={styles.remainingText}>متبقي {remaining}</Text>
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>{current}</Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 8,
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
    marginTop: 4,
    textAlign: "right",
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.13)",
    borderColor: "#2b6e7d",
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  categoriesScroll: {
    gap: 10,
    paddingBottom: 14,
  },
  rtlHorizontalContent: {
    flexDirection: "row-reverse",
  },
  categoryChip: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row-reverse",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },
  categoryChipText: {
    color: "#8391a7",
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
  },
  categoryChipTextActive: {
    color: "#102337",
    fontWeight: "800",
  },
  progressCard: {
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  progressTopRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  progressTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  progressSubtitle: {
    color: "#a8cdd1",
    fontSize: 11,
    marginTop: 3,
    textAlign: "right",
  },
  progressRightGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  progressPercentage: {
    color: "#72efdd",
    fontSize: 18,
    fontWeight: "900",
  },
  resetBtn: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  progressBarBg: {
    backgroundColor: "#112637",
    borderRadius: 4,
    height: 7,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: "#72efdd",
    borderRadius: 4,
    height: "100%",
  },
  listContent: {
    paddingBottom: 35,
  },
  zikrCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 15,
  },
  zikrCardDone: {
    borderColor: "#337267",
    opacity: 0.85,
  },
  zikrHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  zikrIndexBadge: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.12)",
    borderRadius: 9,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  zikrIndexText: {
    color: "#72efdd",
    fontSize: 12,
    fontWeight: "800",
  },
  zikrTargetText: {
    color: "#8391a7",
    fontSize: 11,
    fontWeight: "700",
  },
  zikrText: {
    color: "#edf3f9",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 28,
    textAlign: "right",
  },
  rewardBox: {
    alignItems: "flex-start",
    backgroundColor: "rgba(246, 198, 103, 0.1)",
    borderColor: "rgba(246, 198, 103, 0.25)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginTop: 10,
    padding: 9,
  },
  rewardText: {
    color: "#f6c667",
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    marginRight: 6,
    textAlign: "right",
  },
  referenceText: {
    color: "#6b7c93",
    fontSize: 11,
    marginTop: 8,
    textAlign: "right",
  },
  counterButton: {
    alignItems: "center",
    backgroundColor: "#1b2f4a",
    borderColor: "#2f5379",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 12,
  },
  counterButtonPressed: {
    backgroundColor: "#223d60",
    transform: [{ scale: 0.99 }],
  },
  counterButtonDone: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },
  countingRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 10,
  },
  remainingText: {
    color: "#f5f7fb",
    fontSize: 14,
    fontWeight: "800",
  },
  currentBadge: {
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    color: "#72efdd",
    fontSize: 13,
    fontWeight: "900",
  },
  doneRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 6,
  },
  doneText: {
    color: "#102337",
    fontSize: 14,
    fontWeight: "800",
  },
});
