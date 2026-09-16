import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface MoneyInputProps {
  label: string;
  value: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  onChangeText: (value: string) => void;
}

const ZAKAT_RATE = 0.025;
const GOLD_NISAB_GRAMS = 85;

function normalizeNumber(value: string): number {
  const normalized = value
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    )
    .replace(/[٫،]/g, ".")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function MoneyInput({
  label,
  value,
  placeholder,
  icon,
  onChangeText,
}: MoneyInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIconContainer}>
          <Ionicons name={icon} size={20} color="#72efdd" />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor="#687991"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.currencySuffix}>ر.س</Text>
      </View>
    </View>
  );
}

export default function ZakatScreen() {
  const router = useRouter();

  const [cash, setCash] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [debts, setDebts] = useState("");
  const [hasCompletedYear, setHasCompletedYear] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const calculation = useMemo(() => {
    const cashValue = normalizeNumber(cash);
    const goldWeight = normalizeNumber(goldGrams);
    const pricePerGram = normalizeNumber(goldPrice);
    const debtsValue = normalizeNumber(debts);

    const goldValue = goldWeight * pricePerGram;
    const totalAssets = cashValue + goldValue;
    const netWealth = Math.max(0, totalAssets - debtsValue);
    const nisabValue = GOLD_NISAB_GRAMS * pricePerGram;
    const reachedNisab =
      pricePerGram > 0 && netWealth >= nisabValue;
    const isZakatDue = reachedNisab && hasCompletedYear;
    const zakatAmount = isZakatDue
      ? netWealth * ZAKAT_RATE
      : 0;

    return {
      cashValue,
      goldWeight,
      pricePerGram,
      goldValue,
      totalAssets,
      debtsValue,
      netWealth,
      nisabValue,
      reachedNisab,
      isZakatDue,
      zakatAmount,
    };
  }, [cash, goldGrams, goldPrice, debts, hasCompletedYear]);

  const calculateZakat = () => {
    setCalculated(true);
  };

  const resetCalculator = () => {
    setCash("");
    setGoldGrams("");
    setGoldPrice("");
    setDebts("");
    setHasCompletedYear(false);
    setCalculated(false);
  };

  const resultTitle = calculation.isZakatDue
    ? "الزكاة المستحقة"
    : calculation.reachedNisab
      ? "أكمل شروط الحول"
      : "لم يبلغ النصاب";

  const resultDescription = calculation.isZakatDue
    ? "بحسب البيانات التي أدخلتها، مقدار الزكاة التقريبي هو:"
    : calculation.reachedNisab
      ? "بلغ مالك النصاب، لكن يجب التأكد من مرور حول هجري كامل."
      : "المبلغ المحسوب أقل من قيمة نصاب الذهب المدخلة.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.title}>حاسبة الزكاة</Text>
              <Text style={styles.subtitle}>
                احسب زكاة مالك بسهولة
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="calculator-outline"
                size={25}
                color="#72efdd"
              />
            </View>
          </View>

          <View style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Ionicons
                name="sparkles-outline"
                size={26}
                color="#f6c667"
              />
            </View>

            <View style={styles.introTextContainer}>
              <Text style={styles.introTitle}>
                الزكاة ركن من أركان الإسلام
              </Text>
              <Text style={styles.introDescription}>
                أدخل قيمة أموالك وذهبك وديونك للحصول على تقدير
                تقريبي للزكاة المستحقة.
              </Text>
            </View>
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>٢.٥٪</Text>
              <Text style={styles.rateLabel}>نسبة الزكاة</Text>
            </View>

            <View style={styles.rateDivider} />

            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>٨٥ غ</Text>
              <Text style={styles.rateLabel}>نصاب الذهب</Text>
            </View>

            <View style={styles.rateDivider} />

            <View style={styles.rateItem}>
              <Text style={styles.rateValue}>حول</Text>
              <Text style={styles.rateLabel}>سنة هجرية</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>الأموال والممتلكات</Text>

          <View style={styles.formCard}>
            <MoneyInput
              label="النقد والأرصدة البنكية"
              value={cash}
              placeholder="مثال: 25000"
              icon="cash-outline"
              onChangeText={setCash}
            />

            <MoneyInput
              label="وزن الذهب بالغرام"
              value={goldGrams}
              placeholder="مثال: 50"
              icon="diamond-outline"
              onChangeText={setGoldGrams}
            />

            <MoneyInput
              label="سعر غرام الذهب الحالي"
              value={goldPrice}
              placeholder="مثال: 300"
              icon="trending-up-outline"
              onChangeText={setGoldPrice}
            />

            <MoneyInput
              label="الديون والالتزامات المستحقة"
              value={debts}
              placeholder="مثال: 5000"
              icon="remove-circle-outline"
              onChangeText={setDebts}
            />
          </View>

          <Text style={styles.sectionTitle}>شروط الوجوب</Text>

          <View style={styles.conditionCard}>
            <View style={styles.conditionIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color="#a78bfa"
              />
            </View>

            <View style={styles.conditionTextContainer}>
              <Text style={styles.conditionTitle}>
                هل مرّ حول هجري كامل؟
              </Text>
              <Text style={styles.conditionDescription}>
                فعّل هذا الخيار إذا مرّت سنة هجرية على المال منذ
                بلوغه النصاب.
              </Text>
            </View>

            <Switch
              value={hasCompletedYear}
              onValueChange={setHasCompletedYear}
              trackColor={{
                false: "#35445d",
                true: "#327e82",
              }}
              thumbColor={
                hasCompletedYear ? "#72efdd" : "#a8b4c7"
              }
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={calculateZakat}
            style={({ pressed }) => [
              styles.calculateButton,
              pressed && styles.calculateButtonPressed,
            ]}
          >
            <Ionicons
              name="calculator-outline"
              size={21}
              color="#102337"
            />
            <Text style={styles.calculateButtonText}>
              احسب الزكاة
            </Text>
          </Pressable>

          {calculated ? (
            <View
              style={[
                styles.resultCard,
                calculation.isZakatDue
                  ? styles.resultCardDue
                  : styles.resultCardInfo,
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultIconContainer}>
                  <Ionicons
                    name={
                      calculation.isZakatDue
                        ? "checkmark-circle-outline"
                        : "information-circle-outline"
                    }
                    size={27}
                    color={
                      calculation.isZakatDue
                        ? "#72efdd"
                        : "#f6c667"
                    }
                  />
                </View>

                <View style={styles.resultHeaderText}>
                  <Text style={styles.resultTitle}>
                    {resultTitle}
                  </Text>
                  <Text style={styles.resultDescription}>
                    {resultDescription}
                  </Text>
                </View>
              </View>

              <View style={styles.mainResult}>
                <Text style={styles.mainResultLabel}>
                  المبلغ التقريبي
                </Text>
                <Text style={styles.mainResultValue}>
                  {formatCurrency(calculation.zakatAmount)}
                </Text>
              </View>

              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    قيمة النقد
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(calculation.cashValue)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    قيمة الذهب
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(calculation.goldValue)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    إجمالي الممتلكات
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(calculation.totalAssets)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    الديون المخصومة
                  </Text>
                  <Text style={styles.breakdownValueNegative}>
                    - {formatCurrency(calculation.debtsValue)}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabelStrong}>
                    صافي المال الزكوي
                  </Text>
                  <Text style={styles.breakdownValueStrong}>
                    {formatCurrency(calculation.netWealth)}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    قيمة النصاب
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(calculation.nisabValue)}
                  </Text>
                </View>
              </View>

              <Text style={styles.resultNote}>
                هذه النتيجة تقديرية. راجع عالماً موثوقاً أو جهة
                زكاة معتمدة للتأكد من التفاصيل الشرعية والمالية.
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={resetCalculator}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#9babc0"
            />
            <Text style={styles.resetButtonText}>
              مسح البيانات
            </Text>
          </Pressable>

          <View style={styles.disclaimerCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#72efdd"
            />

            <Text style={styles.disclaimerText}>
              تعتمد هذه الحاسبة على نسبة ٢.٥٪ ونصاب الذهب البالغ
              ٨٥ غراماً. قد تختلف تفاصيل الزكاة بحسب نوع المال
              والديون والآراء الفقهية، لذلك لا تعتبر النتيجة
              فتوى شرعية أو استشارة مالية.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },

  keyboardContainer: {
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

  introCard: {
    alignItems: "center",
    backgroundColor: "#183c52",
    borderColor: "#2b6e7d",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 14,
    padding: 15,
  },

  introIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(246, 198, 103, 0.16)",
    borderRadius: 15,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  introTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  introTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  introDescription: {
    color: "#a8cdd1",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "right",
  },

  rateCard: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginBottom: 22,
    paddingVertical: 14,
  },

  rateItem: {
    alignItems: "center",
    flex: 1,
  },

  rateValue: {
    color: "#72efdd",
    fontSize: 16,
    fontWeight: "800",
  },

  rateLabel: {
    color: "#8391a7",
    fontSize: 10,
    marginTop: 4,
  },

  rateDivider: {
    backgroundColor: "#2b3e5c",
    height: 32,
    width: 1,
  },

  sectionTitle: {
    color: "#eaf0f7",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 11,
    textAlign: "right",
  },

  formCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 22,
    padding: 14,
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    color: "#dce6f0",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    textAlign: "right",
  },

  inputContainer: {
    alignItems: "center",
    backgroundColor: "#172640",
    borderColor: "#2b4565",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row-reverse",
    minHeight: 52,
    paddingHorizontal: 9,
  },

  inputIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.12)",
    borderRadius: 9,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  input: {
    color: "#f0f5fb",
    flex: 1,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 10,
  },

  currencySuffix: {
    color: "#8fa1b7",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  conditionCard: {
    alignItems: "center",
    backgroundColor: "#15243d",
    borderColor: "#2b4565",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 20,
    padding: 14,
  },

  conditionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(167, 139, 250, 0.14)",
    borderRadius: 12,
    height: 45,
    justifyContent: "center",
    width: 45,
  },

  conditionTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  conditionTitle: {
    color: "#edf3f9",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  conditionDescription: {
    color: "#8999ae",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "right",
  },

  calculateButton: {
    alignItems: "center",
    backgroundColor: "#72efdd",
    borderRadius: 14,
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 15,
  },

  calculateButtonPressed: {
    backgroundColor: "#5ed2c1",
    transform: [{ scale: 0.99 }],
  },

  calculateButtonText: {
    color: "#102337",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },

  resultCard: {
    borderRadius: 19,
    borderWidth: 1,
    marginBottom: 13,
    overflow: "hidden",
    padding: 16,
  },

  resultCardDue: {
    backgroundColor: "#173d45",
    borderColor: "#3a8e8c",
  },

  resultCardInfo: {
    backgroundColor: "#302d24",
    borderColor: "#7f6a37",
  },

  resultHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
  },

  resultIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.12)",
    borderRadius: 13,
    height: 47,
    justifyContent: "center",
    width: 47,
  },

  resultHeaderText: {
    flex: 1,
    marginRight: 11,
  },

  resultTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
  },

  resultDescription: {
    color: "#b4cbd0",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
    textAlign: "right",
  },

  mainResult: {
    alignItems: "center",
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    borderBottomWidth: 1,
    marginTop: 18,
    paddingBottom: 16,
  },

  mainResultLabel: {
    color: "#a8c6ca",
    fontSize: 12,
  },

  mainResultValue: {
    color: "#72efdd",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },

  breakdown: {
    marginTop: 13,
  },

  breakdownRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  breakdownLabel: {
    color: "#a9bac5",
    fontSize: 12,
    textAlign: "right",
  },

  breakdownValue: {
    color: "#e1edf3",
    fontSize: 12,
    fontWeight: "700",
  },

  breakdownValueNegative: {
    color: "#ee91ab",
    fontSize: 12,
    fontWeight: "700",
  },

  breakdownDivider: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    height: 1,
    marginVertical: 5,
  },

  breakdownLabelStrong: {
    color: "#f0f6fa",
    fontSize: 13,
    fontWeight: "800",
  },

  breakdownValueStrong: {
    color: "#72efdd",
    fontSize: 13,
    fontWeight: "800",
  },

  resultNote: {
    color: "#9fb9bf",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 13,
    textAlign: "right",
  },

  resetButton: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginBottom: 20,
    paddingVertical: 10,
  },

  resetButtonPressed: {
    opacity: 0.65,
  },

  resetButtonText: {
    color: "#9babc0",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 6,
  },

  disclaimerCard: {
    alignItems: "flex-start",
    backgroundColor: "#12283a",
    borderColor: "#235064",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    padding: 13,
  },

  disclaimerText: {
    color: "#a9bfca",
    flex: 1,
    fontSize: 11,
    lineHeight: 19,
    marginRight: 9,
    textAlign: "right",
  },
});

