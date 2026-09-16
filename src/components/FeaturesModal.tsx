import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export type FeatureKey =
  | "qibla"
  | "tasbeeh"
  | "namesOfAllah"
  | "zakat"
  | "calendar"
  | "hajjUmrah"
  | "periodMode"
  | "settings";

export interface FeaturesModalProps {
  visible: boolean;
  onClose: () => void;
  periodMode: boolean;
  onPeriodModeChange: (enabled: boolean) => void;
  onFeaturePress?: (feature: FeatureKey) => void;
}

interface FeatureItem {
  key: FeatureKey;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

const FEATURES: FeatureItem[] = [
  {
    key: "qibla",
    title: "القبلة",
    subtitle: "اتجاه الكعبة",
    icon: "compass-outline",
    color: "#72efdd",
    backgroundColor: "rgba(114, 239, 221, 0.14)",
  },
  {
    key: "tasbeeh",
    title: "المسبحة",
    subtitle: "عداد التسبيح",
    icon: "radio-button-on-outline",
    color: "#a78bfa",
    backgroundColor: "rgba(167, 139, 250, 0.14)",
  },
  {
    key: "namesOfAllah",
    title: "أسماء الله",
    subtitle: "الأسماء الحسنى",
    icon: "sparkles-outline",
    color: "#f6c667",
    backgroundColor: "rgba(246, 198, 103, 0.14)",
  },
  {
    key: "zakat",
    title: "الزكاة",
    subtitle: "حاسبة الزكاة",
    icon: "calculator-outline",
    color: "#7dd3a8",
    backgroundColor: "rgba(125, 211, 168, 0.14)",
  },
  {
    key: "calendar",
    title: "التقويم",
    subtitle: "التاريخ الهجري",
    icon: "calendar-outline",
    color: "#77b8e8",
    backgroundColor: "rgba(119, 184, 232, 0.14)",
  },
  {
    key: "hajjUmrah",
    title: "الحج والعمرة",
    subtitle: "دليل المناسك",
    icon: "map-outline",
    color: "#e8a87c",
    backgroundColor: "rgba(232, 168, 124, 0.14)",
  },
  {
    key: "periodMode",
    title: "وضع الدورة",
    subtitle: "إيقاف التنبيهات",
    icon: "heart-outline",
    color: "#ee91ab",
    backgroundColor: "rgba(238, 145, 171, 0.14)",
  },
  {
    key: "settings",
    title: "الإعدادات",
    subtitle: "تخصيص التطبيق",
    icon: "settings-outline",
    color: "#a6b4c7",
    backgroundColor: "rgba(166, 180, 199, 0.14)",
  },
];

export default function FeaturesModal({
  visible,
  onClose,
  periodMode,
  onPeriodModeChange,
  onFeaturePress,
}: FeaturesModalProps) {
  const handleFeaturePress = (feature: FeatureItem) => {
    if (feature.key === "periodMode") {
      onPeriodModeChange(!periodMode);
      return;
    }

    if (onFeaturePress) {
      onFeaturePress(feature.key);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>الميزات والخدمات</Text>
                <Text style={styles.subtitle}>
                  كل ما تحتاجه لحياة إيمانية متوازنة
                </Text>
              </View>

              <Pressable
                accessibilityLabel="إغلاق نافذة الميزات"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#dbe7f2"
                />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.highlightCard}>
                <View style={styles.highlightIconContainer}>
                  <Ionicons
                    name="sparkles"
                    size={25}
                    color="#72efdd"
                  />
                </View>

                <View style={styles.highlightTextContainer}>
                  <Text style={styles.highlightTitle}>
                    اكتشف ميزات صلاتي
                  </Text>
                  <Text style={styles.highlightDescription}>
                    أدوات إسلامية تساعدك على تنظيم عبادتك اليومية
                  </Text>
                </View>

                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#72efdd"
                />
              </View>

              <Text style={styles.sectionTitle}>الخدمات الرئيسية</Text>

              <View style={styles.featuresGrid}>
                {FEATURES.map((feature) => {
                  const isPeriodMode = feature.key === "periodMode";

                  return (
                    <Pressable
                      key={feature.key}
                      accessibilityRole={
                        isPeriodMode ? "switch" : "button"
                      }
                      accessibilityLabel={feature.title}
                      accessibilityState={
                        isPeriodMode
                          ? { checked: periodMode }
                          : undefined
                      }
                      onPress={() => handleFeaturePress(feature)}
                      style={({ pressed }) => [
                        styles.featureCard,
                        pressed && styles.featureCardPressed,
                        isPeriodMode &&
                          periodMode &&
                          styles.periodModeActiveCard,
                      ]}
                    >
                      <View
                        style={[
                          styles.featureIconContainer,
                          {
                            backgroundColor:
                              feature.backgroundColor,
                          },
                        ]}
                      >
                        <Ionicons
                          name={feature.icon}
                          size={28}
                          color={feature.color}
                        />
                      </View>

                      <Text style={styles.featureTitle}>
                        {feature.title}
                      </Text>

                      <Text style={styles.featureSubtitle}>
                        {feature.subtitle}
                      </Text>

                      {isPeriodMode ? (
                        <View style={styles.periodModeSwitchRow}>
                          <Text
                            style={[
                              styles.periodModeStatus,
                              periodMode &&
                                styles.periodModeStatusActive,
                            ]}
                          >
                            {periodMode ? "مفعّل" : "متوقف"}
                          </Text>

                          <Switch
                            value={periodMode}
                            onValueChange={onPeriodModeChange}
                            trackColor={{
                              false: "#35445d",
                              true: "#327e82",
                            }}
                            thumbColor={
                              periodMode ? "#72efdd" : "#a8b4c7"
                            }
                          />
                        </View>
                      ) : (
                        <View style={styles.featureArrow}>
                          <Ionicons
                            name="chevron-back"
                            size={16}
                            color="#718198"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.periodInfoCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color="#72efdd"
                />

                <Text style={styles.periodInfoText}>
                  عند تفعيل وضع الدورة، سيتم إيقاف تذكيرات الصلاة
                  وتتبع الأداء مؤقتاً حتى يتم إيقاف الوضع.
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBottomButton,
                  pressed && styles.closeBottomButtonPressed,
                ]}
              >
                <Text style={styles.closeBottomButtonText}>
                  إغلاق
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(3, 8, 18, 0.78)",
    flex: 1,
    justifyContent: "flex-end",
  },

  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#0f1b30",
    borderColor: "#294263",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: "94%",
    minHeight: "65%",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  handle: {
    alignSelf: "center",
    backgroundColor: "#536783",
    borderRadius: 3,
    height: 5,
    marginBottom: 15,
    width: 48,
  },

  header: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: "#f4f7fb",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "right",
  },

  subtitle: {
    color: "#8999ae",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },

  closeButton: {
    alignItems: "center",
    backgroundColor: "#1b2b47",
    borderColor: "#2e4566",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    marginLeft: 12,
    width: 42,
  },

  content: {
    paddingBottom: 25,
  },

  highlightCard: {
    alignItems: "center",
    backgroundColor: "#173a4d",
    borderColor: "#2b6e7d",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  highlightIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  highlightTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  highlightTitle: {
    color: "#f7fbff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  highlightDescription: {
    color: "#a5c7cf",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
    textAlign: "right",
  },

  sectionTitle: {
    color: "#ecf2f8",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 13,
    textAlign: "right",
  },

  featuresGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  featureCard: {
    alignItems: "center",
    backgroundColor: "#15233b",
    borderColor: "#263b5b",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 152,
    paddingHorizontal: 8,
    paddingVertical: 14,
    width: "48.3%",
  },

  featureCardPressed: {
    backgroundColor: "#1b304c",
    borderColor: "#52708f",
    transform: [{ scale: 0.98 }],
  },

  periodModeActiveCard: {
    backgroundColor: "#3a2636",
    borderColor: "#a85d77",
  },

  featureIconContainer: {
    alignItems: "center",
    borderRadius: 17,
    height: 58,
    justifyContent: "center",
    marginBottom: 10,
    width: 58,
  },

  featureTitle: {
    color: "#edf3f9",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  featureSubtitle: {
    color: "#8493a8",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },

  featureArrow: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    marginTop: 7,
    width: 25,
  },

  periodModeSwitchRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    marginTop: 3,
  },

  periodModeStatus: {
    color: "#8493a8",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },

  periodModeStatusActive: {
    color: "#ee91ab",
  },

  periodInfoCard: {
    alignItems: "flex-start",
    backgroundColor: "#12283a",
    borderColor: "#235064",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginTop: 8,
    padding: 13,
  },

  periodInfoText: {
    color: "#a9bfca",
    flex: 1,
    fontSize: 11,
    lineHeight: 19,
    marginRight: 9,
    textAlign: "right",
  },

  closeBottomButton: {
    alignItems: "center",
    backgroundColor: "#213654",
    borderColor: "#355271",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
    paddingVertical: 14,
  },

  closeBottomButtonPressed: {
    backgroundColor: "#2b4568",
  },

  closeBottomButtonText: {
    color: "#dce8f3",
    fontSize: 14,
    fontWeight: "800",
  },
});

