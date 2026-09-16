import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ZikrCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: string[];
}

const categories: ZikrCategory[] = [
  {
    id: "morning",
    title: "أذكار الصباح",
    subtitle: "من بعد صلاة الفجر إلى شروق الشمس",
    icon: "☀",
    color: "#c79643",
    items: [
      "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
      "اللهم بك أصبحنا وبك أمسينا، وبك نحيا وبك نموت وإليك النشور.",
      "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.",
    ],
  },
  {
    id: "evening",
    title: "أذكار المساء",
    subtitle: "من بعد صلاة العصر إلى غروب الشمس",
    icon: "☾",
    color: "#72a4d4",
    items: [
      "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
      "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
      "حسبي الله لا إله إلا هو، عليه توكلت وهو رب العرش العظيم.",
    ],
  },
  {
    id: "sleep",
    title: "أذكار النوم",
    subtitle: "قبل الخلود إلى النوم",
    icon: "☽",
    color: "#a487d6",
    items: [
      "باسمك اللهم أموت وأحيا.",
      "اللهم قني عذابك يوم تبعث عبادك.",
      "اللهم أسلمت نفسي إليك، ووجهت وجهي إليك، وفوضت أمري إليك.",
    ],
  },
  {
    id: "mosque",
    title: "أذكار المسجد",
    subtitle: "عند الذهاب إلى المسجد ودخوله",
    icon: "⌂",
    color: "#72c7b6",
    items: [
      "اللهم اجعل في قلبي نوراً، وفي بصري نوراً، وفي سمعي نوراً.",
      "اللهم افتح لي أبواب رحمتك.",
      "بسم الله، والصلاة والسلام على رسول الله.",
    ],
  },
];

export default function AzkarTab() {
  const [openCategory, setOpenCategory] = useState<string | null>(
    "morning"
  );
  const [completedItems, setCompletedItems] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (id: string) => {
    setOpenCategory((current) => (current === id ? null : id));
  };

  const toggleItem = (key: string) => {
    setCompletedItems((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>الأدعية والأذكار</Text>
          <Text style={styles.subtitle}>وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ</Text>
        </View>

        <View style={styles.dailyCard}>
          <View style={styles.dailyIconCircle}>
            <Text style={styles.dailyIcon}>✦</Text>
          </View>

          <View style={styles.dailyTextBox}>
            <Text style={styles.dailyTitle}>وردك اليومي</Text>
            <Text style={styles.dailySubtitle}>
              اجعل لسانك رطباً بذكر الله
            </Text>
          </View>

          <Text style={styles.dailyCount}>
            {Object.values(completedItems).filter(Boolean).length} / 12
          </Text>
        </View>

        <View style={styles.categories}>
          {categories.map((category) => {
            const isOpen = openCategory === category.id;

            return (
              <View key={category.id} style={styles.categoryWrapper}>
                <Pressable
                  onPress={() => toggleCategory(category.id)}
                  style={styles.categoryHeader}
                >
                  <View
                    style={[
                      styles.categoryIconBox,
                      { backgroundColor: `${category.color}25` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryIcon,
                        { color: category.color },
                      ]}
                    >
                      {category.icon}
                    </Text>
                  </View>

                  <View style={styles.categoryTextBox}>
                    <Text style={styles.categoryTitle}>
                      {category.title}
                    </Text>
                    <Text style={styles.categorySubtitle}>
                      {category.subtitle}
                    </Text>
                  </View>

                  <Text style={styles.categoryArrow}>
                    {isOpen ? "⌃" : "⌄"}
                  </Text>
                </Pressable>

                {isOpen ? (
                  <View style={styles.zikrList}>
                    {category.items.map((item, index) => {
                      const itemKey = `${category.id}-${index}`;
                      const completed = Boolean(completedItems[itemKey]);

                      return (
                        <Pressable
                          key={itemKey}
                          onPress={() => toggleItem(itemKey)}
                          style={[
                            styles.zikrItem,
                            completed && styles.completedItem,
                          ]}
                        >
                          <View
                            style={[
                              styles.zikrCheck,
                              completed && styles.zikrCheckCompleted,
                            ]}
                          >
                            {completed ? (
                              <Text style={styles.checkText}>✓</Text>
                            ) : (
                              <Text style={styles.itemNumber}>
                                {index + 1}
                              </Text>
                            )}
                          </View>

                          <Text
                            style={[
                              styles.zikrText,
                              completed && styles.completedText,
                            ]}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
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
  dailyCard: {
    alignItems: "center",
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 20,
    padding: 16,
  },
  dailyIconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.16)",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  dailyIcon: {
    color: "#72efdd",
    fontSize: 25,
  },
  dailyTextBox: {
    flex: 1,
    marginHorizontal: 11,
  },
  dailyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
  },
  dailySubtitle: {
    color: "#a8ced2",
    fontSize: 11,
    marginTop: 5,
    textAlign: "right",
  },
  dailyCount: {
    color: "#72efdd",
    fontSize: 14,
    fontWeight: "800",
  },
  categories: {
    gap: 12,
  },
  categoryWrapper: {
    backgroundColor: "#121e35",
    borderColor: "#223654",
    borderRadius: 17,
    borderWidth: 1,
    overflow: "hidden",
  },
  categoryHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    minHeight: 78,
    paddingHorizontal: 14,
  },
  categoryIconBox: {
    alignItems: "center",
    borderRadius: 13,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  categoryIcon: {
    fontSize: 23,
  },
  categoryTextBox: {
    flex: 1,
    marginHorizontal: 11,
  },
  categoryTitle: {
    color: "#edf2f8",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  categorySubtitle: {
    color: "#8290a7",
    fontSize: 10,
    marginTop: 5,
    textAlign: "right",
  },
  categoryArrow: {
    color: "#72efdd",
    fontSize: 22,
    fontWeight: "800",
  },
  zikrList: {
    borderTopColor: "#263750",
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  zikrItem: {
    alignItems: "flex-start",
    borderBottomColor: "#24344c",
    borderBottomWidth: 1,
    flexDirection: "row-reverse",
    paddingVertical: 14,
  },
  completedItem: {
    opacity: 0.55,
  },
  zikrCheck: {
    alignItems: "center",
    borderColor: "#62738c",
    borderRadius: 7,
    borderWidth: 1,
    height: 25,
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 2,
    width: 25,
  },
  zikrCheckCompleted: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },
  checkText: {
    color: "#102337",
    fontSize: 16,
    fontWeight: "900",
  },
  itemNumber: {
    color: "#9aa8ba",
    fontSize: 11,
    fontWeight: "800",
  },
  zikrText: {
    color: "#dce5f0",
    flex: 1,
    fontSize: 14,
    lineHeight: 25,
    textAlign: "right",
  },
  completedText: {
    color: "#8da4a9",
    textDecorationLine: "line-through",
  },
});

