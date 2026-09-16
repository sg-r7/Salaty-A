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

type GuideType = "umrah" | "hajj";

interface GuideStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
  actions: string[];
  note?: string;
}

const UMRAH_STEPS: GuideStep[] = [
  {
    id: "umrah-ihram",
    number: 1,
    title: "الإحرام من الميقات",
    subtitle: "الاستعداد والنية",
    icon: "shirt-outline",
    color: "#72efdd",
    description:
      "يستعد المعتمر للإحرام من الميقات المحدد له، ويغتسل ويتطيب قبل الإحرام إن تيسر، ثم يلبس ملابس الإحرام وينوي العمرة.",
    actions: [
      "الاغتسال والتنظف وقص الأظافر عند الحاجة قبل الإحرام.",
      "يلبس الرجل إزاراً ورداءً، وتلبس المرأة ما تيسر من اللباس الساتر.",
      "يصلي ما تيسر من غير اعتقاد صلاة خاصة للإحرام.",
      "ينوي العمرة قائلاً: لبيك عمرة، ثم يبدأ التلبية.",
    ],
    note:
      "لا يجوز تجاوز الميقات لمن أراد العمرة دون إحرام.",
  },
  {
    id: "umrah-talbiyah",
    number: 2,
    title: "التلبية",
    subtitle: "من الإحرام حتى بدء الطواف",
    icon: "volume-high-outline",
    color: "#f6c667",
    description:
      "يكثر المعتمر من التلبية من وقت الإحرام حتى يبدأ الطواف، مع حضور القلب والإخلاص لله تعالى.",
    actions: [
      "لبيك اللهم لبيك، لبيك لا شريك لك لبيك.",
      "إن الحمد والنعمة لك والملك، لا شريك لك.",
      "يكثر من الذكر والدعاء المشروع.",
      "يتجنب الرفث والفسوق والجدال وسائر محظورات الإحرام.",
    ],
  },
  {
    id: "umrah-tawaf",
    number: 3,
    title: "الطواف حول الكعبة",
    subtitle: "سبعة أشواط",
    icon: "refresh-outline",
    color: "#77b8e8",
    description:
      "يطوف المعتمر حول الكعبة سبعة أشواط، يبدأ كل شوط من الحجر الأسود وينتهي إليه، جاعلاً الكعبة عن يساره.",
    actions: [
      "يبدأ الطواف بمحاذاة الحجر الأسود ويكبر عنده إن تيسر.",
      "يجعل الكعبة عن يساره طوال الطواف.",
      "يدعو بما تيسر دون التزام دعاء محدد لكل شوط.",
      "يصلي ركعتين بعد الطواف في أي موضع مناسب إن تيسر.",
    ],
    note:
      "المحافظة على سلامة المعتمرين وتجنب التدافع مقدمة عند الزحام.",
  },
  {
    id: "umrah-sai",
    number: 4,
    title: "السعي بين الصفا والمروة",
    subtitle: "سبعة أشواط",
    icon: "walk-outline",
    color: "#a78bfa",
    description:
      "يسعى المعتمر بين الصفا والمروة سبعة أشواط، يبدأ بالصفا وينتهي بالمروة.",
    actions: [
      "يبدأ الشوط الأول من الصفا وينتهي عند المروة.",
      "يُحسب الذهاب شوطاً والعودة شوطاً آخر.",
      "يذكر الله ويدعوه بما تيسر أثناء السعي.",
      "يسرع الرجل بين العلمين الأخضرين، أما المرأة فتمشي مشياً معتاداً.",
    ],
  },
  {
    id: "umrah-halq",
    number: 5,
    title: "الحلق أو التقصير",
    subtitle: "التحلل من العمرة",
    icon: "cut-outline",
    color: "#7dd3a8",
    description:
      "بعد إتمام السعي يحلق الرجل رأسه أو يقصره، والتقصير للمرأة بقدر يسير من أطراف الشعر، وبذلك تتم العمرة ويتحلل المعتمر.",
    actions: [
      "الحلق أفضل للرجل عند ختام العمرة لمن لم يكن متمتعاً بقصد الحج قريباً.",
      "يقصر الرجل من جميع شعر الرأس ولا يكتفي بجزء يسير منه.",
      "تقص المرأة من أطراف شعرها قدر أنملة تقريباً.",
      "بعد ذلك تنتهي أعمال العمرة وتباح محظورات الإحرام.",
    ],
  },
];

const HAJJ_STEPS: GuideStep[] = [
  {
    id: "hajj-ihram",
    number: 1,
    title: "الإحرام بالحج",
    subtitle: "النية والتلبية",
    icon: "shirt-outline",
    color: "#72efdd",
    description:
      "يحرم الحاج من الميقات أو من المكان الذي يصح له الإحرام منه حسب نسكه، وينوي الحج ويبدأ التلبية.",
    actions: [
      "يحدد الحاج نوع النسك: تمتع أو قران أو إفراد.",
      "يغتسل ويتنظف ويلبس ملابس الإحرام عند التيسر.",
      "ينوي الحج ويلبي: لبيك حجاً.",
      "يكثر من التلبية والذكر حتى يبدأ أعمال يوم النحر.",
    ],
    note:
      "تختلف بعض التفاصيل باختلاف نوع النسك، فاسأل جهة إرشاد موثوقة عند الحاجة.",
  },
  {
    id: "hajj-tarwiyah",
    number: 2,
    title: "يوم التروية",
    subtitle: "الثامن من ذي الحجة",
    icon: "sunny-outline",
    color: "#f6c667",
    description:
      "يتوجه الحاج إلى منى في اليوم الثامن من ذي الحجة، ويصلي فيها الظهر والعصر والمغرب والعشاء والفجر قصراً دون جمع.",
    actions: [
      "التوجه إلى منى حسب تنظيم حملتك والجهات الرسمية.",
      "الإكثار من التلبية والذكر والدعاء.",
      "المبيت بمنى ليلة التاسع لمن تيسر له ذلك.",
      "الالتزام بتعليمات السلامة والتنقل الرسمية.",
    ],
  },
  {
    id: "hajj-arafah",
    number: 3,
    title: "الوقوف بعرفة",
    subtitle: "التاسع من ذي الحجة",
    icon: "location-outline",
    color: "#77b8e8",
    description:
      "الوقوف بعرفة أعظم أركان الحج. يقف الحاج بعرفة من بعد الزوال إلى فجر يوم النحر، ويكثر من الدعاء والذكر.",
    actions: [
      "يصلي الظهر والعصر جمع تقديم وقصراً مع الإمام أو حسب التنظيم.",
      "يستقبل القبلة ويدعو ويلح في الدعاء.",
      "يكثر من قول التوحيد والتهليل والتكبير.",
      "يغادر عرفة بعد غروب الشمس متوجهاً إلى مزدلفة.",
    ],
    note:
      "الوقوف بعرفة ركن من أركان الحج، ولا يصح الحج بدونه.",
  },
  {
    id: "hajj-muzdalifah",
    number: 4,
    title: "المبيت بمزدلفة",
    subtitle: "ليلة العاشر من ذي الحجة",
    icon: "moon-outline",
    color: "#a78bfa",
    description:
      "بعد مغادرة عرفة يتوجه الحاج إلى مزدلفة، ويصلي فيها المغرب والعشاء جمع تأخير وقصراً للعشاء، ثم يبيت حسب الاستطاعة والتنظيم.",
    actions: [
      "جمع المغرب والعشاء في مزدلفة بعد الوصول.",
      "المبيت أو المكث حسب القدرة والتعليمات الرسمية.",
      "جمع حصى الرمي من أي مكان مناسب.",
      "الذكر والدعاء والاستعداد لأعمال يوم النحر.",
    ],
  },
  {
    id: "hajj-ramy",
    number: 5,
    title: "رمي جمرة العقبة",
    subtitle: "يوم النحر",
    icon: "ellipse-outline",
    color: "#e8a87c",
    description:
      "يرمي الحاج جمرة العقبة الكبرى بسبع حصيات، ويكبر مع كل حصاة، مع الالتزام بالوقت والمسار المحددين.",
    actions: [
      "يرمي سبع حصيات متتابعة.",
      "يكبر مع كل حصاة.",
      "لا يشرع رمي الحصى الكبير أو إيذاء الآخرين.",
      "يلتزم بتعليمات التفويج والمواعيد الرسمية.",
    ],
  },
  {
    id: "hajj-sacrifice",
    number: 6,
    title: "الهدي والحلق أو التقصير",
    subtitle: "التحلل الأول",
    icon: "checkmark-circle-outline",
    color: "#7dd3a8",
    description:
      "بعد الرمي يأتي الهدي على المتمتع والقارن، ثم يحلق الرجل أو يقصر، وتقصر المرأة من أطراف شعرها.",
    actions: [
      "ذبح الهدي يكون عبر الجهات المعتمدة وبالطريقة النظامية.",
      "الحلق أو التقصير بعد الذبح لمن وجب عليه الهدي.",
      "بعد التحلل الأول تباح معظم محظورات الإحرام.",
      "يبقى بعض الأحكام حتى طواف الإفاضة حسب ترتيب الأعمال.",
    ],
  },
  {
    id: "hajj-ifadah",
    number: 7,
    title: "طواف الإفاضة والسعي",
    subtitle: "إتمام الركن الأعظم",
    icon: "refresh-outline",
    color: "#72efdd",
    description:
      "يطوف الحاج طواف الإفاضة، ويسعى بين الصفا والمروة إذا كان عليه سعي، ثم يتحلل التحلل الأكبر.",
    actions: [
      "يطوف سبعة أشواط حول الكعبة.",
      "يصلي ركعتين بعد الطواف إن تيسر.",
      "يسعى بين الصفا والمروة لمن وجب عليه السعي.",
      "بعد إتمام الأعمال يتحلل التحلل الأكبر.",
    ],
  },
  {
    id: "hajj-tashreeq",
    number: 8,
    title: "أيام التشريق",
    subtitle: "الحادي عشر والثاني عشر والثالث عشر",
    icon: "calendar-outline",
    color: "#f6c667",
    description:
      "يرمي الحاج الجمرات الثلاث في أيام التشريق، ويجوز التعجل لمن استوفى شروطه وغادر قبل الغروب في اليوم الثاني عشر.",
    actions: [
      "يرمي الجمرة الصغرى ثم الوسطى ثم الكبرى.",
      "يرمي كل جمرة بسبع حصيات مع التكبير.",
      "يدعو بعد الصغرى والوسطى إن تيسر.",
      "يلتزم بالوقت والمسار المحددين من الجهات الرسمية.",
    ],
  },
  {
    id: "hajj-wadaa",
    number: 9,
    title: "طواف الوداع",
    subtitle: "قبل مغادرة مكة",
    icon: "home-outline",
    color: "#a78bfa",
    description:
      "يكون طواف الوداع آخر عهد الحاج بالبيت قبل مغادرة مكة، مع مراعاة الأحكام الخاصة بالنساء وأصحاب الأعذار.",
    actions: [
      "يجعل طواف الوداع آخر أعماله في مكة.",
      "لا يشتري أو ينشغل بعده بما يطيل الإقامة بلا حاجة.",
      "يسأل أهل العلم عن الأحكام الخاصة بالعذر أو الحيض.",
      "يغادر بهدوء ملتزماً بتعليمات الرحلات والتنقل.",
    ],
  },
];

function GuideStepCard({
  step,
  expanded,
  completed,
  onToggleExpanded,
  onToggleCompleted,
}: {
  step: GuideStep;
  expanded: boolean;
  completed: boolean;
  onToggleExpanded: () => void;
  onToggleCompleted: () => void;
}) {
  return (
    <View
      style={[
        styles.stepCard,
        completed && styles.completedStepCard,
      ]}
    >
      <Pressable
        onPress={onToggleExpanded}
        style={styles.stepHeader}
      >
        <View
          style={[
            styles.stepIconContainer,
            { backgroundColor: `${step.color}20` },
          ]}
        >
          <Ionicons
            name={step.icon}
            size={23}
            color={step.color}
          />
        </View>

        <View style={styles.stepTextContainer}>
          <Text style={styles.stepNumber}>
            المرحلة {step.number}
          </Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>

        <View
          style={[
            styles.stepNumberBadge,
            { borderColor: step.color },
          ]}
        >
          <Text
            style={[
              styles.stepNumberBadgeText,
              { color: step.color },
            ]}
          >
            {step.number}
          </Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.stepDetails}>
          <Text style={styles.stepDescription}>
            {step.description}
          </Text>

          <Text style={styles.actionsTitle}>الأعمال الأساسية</Text>

          {step.actions.map((action, index) => (
            <View key={`${step.id}-${index}`} style={styles.actionRow}>
              <View
                style={[
                  styles.actionBullet,
                  { backgroundColor: step.color },
                ]}
              >
                <Text style={styles.actionBulletText}>
                  {index + 1}
                </Text>
              </View>

              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}

          {step.note ? (
            <View style={styles.stepNote}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#f6c667"
              />
              <Text style={styles.stepNoteText}>{step.note}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={onToggleCompleted}
            style={[
              styles.completeButton,
              completed && styles.completeButtonActive,
            ]}
          >
            <Ionicons
              name={
                completed
                  ? "checkmark-circle"
                  : "checkmark-circle-outline"
              }
              size={20}
              color={completed ? "#102337" : "#72efdd"}
            />

            <Text
              style={[
                styles.completeButtonText,
                completed && styles.completeButtonTextActive,
              ]}
            >
              {completed ? "تم إنجاز المرحلة" : "تحديد كمنجزة"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function HajjUmrahScreen() {
  const router = useRouter();

  const [activeGuide, setActiveGuide] =
    useState<GuideType>("umrah");
  const [expandedStep, setExpandedStep] = useState<string | null>(
    "umrah-ihram"
  );
  const [completedSteps, setCompletedSteps] = useState<
    Record<string, boolean>
  >({});

  const steps = useMemo(
    () => (activeGuide === "umrah" ? UMRAH_STEPS : HAJJ_STEPS),
    [activeGuide]
  );

  const completedCount = steps.filter(
    (step) => completedSteps[step.id] === true
  ).length;

  const progress =
    steps.length === 0
      ? 0
      : Math.round((completedCount / steps.length) * 100);

  const handleGuideChange = (guide: GuideType) => {
    setActiveGuide(guide);
    setExpandedStep(guide === "umrah" ? "umrah-ihram" : "hajj-ihram");
  };

  const toggleStep = (stepId: string) => {
    setExpandedStep((current) =>
      current === stepId ? null : stepId
    );
  };

  const toggleCompleted = (stepId: string) => {
    setCompletedSteps((current) => ({
      ...current,
      [stepId]: !current[stepId],
    }));
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
            <Text style={styles.title}>دليل الحج والعمرة</Text>
            <Text style={styles.subtitle}>
              خطوات إرشادية لأداء المناسك
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="map-outline"
              size={25}
              color="#72efdd"
            />
          </View>
        </View>

        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <Text style={styles.introIcon}>🕋</Text>
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              لبيك اللهم لبيك
            </Text>
            <Text style={styles.introDescription}>
              دليل مختصر يساعدك على معرفة ترتيب الأعمال، مع ضرورة
              الرجوع إلى أهل العلم والجهات الرسمية.
            </Text>
          </View>
        </View>

        <View style={styles.guideTabs}>
          <Pressable
            onPress={() => handleGuideChange("hajj")}
            style={[
              styles.guideTab,
              activeGuide === "hajj" && styles.activeGuideTab,
            ]}
          >
            <Ionicons
              name="people-outline"
              size={21}
              color={
                activeGuide === "hajj" ? "#72efdd" : "#8190a8"
              }
            />
            <Text
              style={[
                styles.guideTabText,
                activeGuide === "hajj" &&
                  styles.activeGuideTabText,
              ]}
            >
              مناسك الحج
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleGuideChange("umrah")}
            style={[
              styles.guideTab,
              activeGuide === "umrah" && styles.activeGuideTab,
            ]}
          >
            <Ionicons
              name="moon-outline"
              size={21}
              color={
                activeGuide === "umrah" ? "#72efdd" : "#8190a8"
              }
            />
            <Text
              style={[
                styles.guideTabText,
                activeGuide === "umrah" &&
                  styles.activeGuideTabText,
              ]}
            >
              مناسك العمرة
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>
                تقدمك في الدليل
              </Text>
              <Text style={styles.progressSubtitle}>
                {completedCount} من {steps.length} مراحل مكتملة
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>
                {progress}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeGuide === "umrah"
              ? "خطوات العمرة"
              : "خطوات الحج"}
          </Text>

          <Text style={styles.sectionHint}>
            اضغط على المرحلة للتفاصيل
          </Text>
        </View>

        <View style={styles.stepsList}>
          {steps.map((step) => (
            <GuideStepCard
              key={step.id}
              step={step}
              expanded={expandedStep === step.id}
              completed={completedSteps[step.id] === true}
              onToggleExpanded={() => toggleStep(step.id)}
              onToggleCompleted={() => toggleCompleted(step.id)}
            />
          ))}
        </View>

        <View style={styles.warningCard}>
          <Ionicons
            name="warning-outline"
            size={22}
            color="#f6c667"
          />

          <Text style={styles.warningText}>
            هذا الدليل تعليمي ومختصر، ولا يغني عن سؤال العلماء
            والمرشدين المعتمدين، أو اتباع تعليمات وزارة الحج
            والعمرة والجهات الرسمية في بلدك.
          </Text>
        </View>

        <View style={styles.duaCard}>
          <Text style={styles.duaText}>
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ
            الْعَلِيمُ
          </Text>
          <Text style={styles.duaSource}>
            سورة البقرة، الآية 127
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
    fontSize: 24,
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
    marginBottom: 17,
    padding: 15,
  },

  introIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    width: 56,
  },

  introIcon: {
    fontSize: 28,
  },

  introTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  introTitle: {
    color: "#ffffff",
    fontSize: 16,
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

  guideTabs: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 17,
    padding: 4,
  },

  guideTab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    paddingVertical: 12,
  },

  activeGuideTab: {
    backgroundColor: "#244b57",
  },

  guideTabText: {
    color: "#8190a8",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 7,
  },

  activeGuideTabText: {
    color: "#72efdd",
  },

  progressCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 22,
    padding: 16,
  },

  progressHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  progressTitle: {
    color: "#edf3f9",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  progressSubtitle: {
    color: "#8290a7",
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
    marginTop: 14,
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: "#72efdd",
    borderRadius: 5,
    height: "100%",
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

  stepsList: {
    marginBottom: 18,
  },

  stepCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 17,
    borderWidth: 1,
    marginBottom: 11,
    overflow: "hidden",
  },

  completedStepCard: {
    borderColor: "#35746f",
  },

  stepHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    minHeight: 82,
    padding: 13,
  },

  stepIconContainer: {
    alignItems: "center",
    borderRadius: 13,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  stepTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  stepNumber: {
    color: "#8290a7",
    fontSize: 10,
    textAlign: "right",
  },

  stepTitle: {
    color: "#edf3f9",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "right",
  },

  stepSubtitle: {
    color: "#8290a7",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  stepNumberBadge: {
    alignItems: "center",
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  stepNumberBadgeText: {
    fontSize: 14,
    fontWeight: "900",
  },

  stepDetails: {
    borderTopColor: "#263a56",
    borderTopWidth: 1,
    padding: 14,
  },

  stepDescription: {
    color: "#c6d5e0",
    fontSize: 13,
    lineHeight: 23,
    textAlign: "right",
  },

  actionsTitle: {
    color: "#72efdd",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
    marginTop: 15,
    textAlign: "right",
  },

  actionRow: {
    alignItems: "flex-start",
    flexDirection: "row-reverse",
    marginBottom: 9,
  },

  actionBullet: {
    alignItems: "center",
    borderRadius: 10,
    height: 21,
    justifyContent: "center",
    marginLeft: 8,
    marginTop: 2,
    width: 21,
  },

  actionBulletText: {
    color: "#102337",
    fontSize: 10,
    fontWeight: "900",
  },

  actionText: {
    color: "#b8c8d6",
    flex: 1,
    fontSize: 12,
    lineHeight: 21,
    textAlign: "right",
  },

  stepNote: {
    alignItems: "flex-start",
    backgroundColor: "#332d21",
    borderColor: "#66552d",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginTop: 7,
    padding: 10,
  },

  stepNoteText: {
    color: "#d8c493",
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    marginRight: 7,
    textAlign: "right",
  },

  completeButton: {
    alignItems: "center",
    borderColor: "#35746f",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 11,
  },

  completeButtonActive: {
    backgroundColor: "#72efdd",
    borderColor: "#72efdd",
  },

  completeButtonText: {
    color: "#72efdd",
    fontSize: 12,
    fontWeight: "800",
    marginRight: 7,
  },

  completeButtonTextActive: {
    color: "#102337",
  },

  warningCard: {
    alignItems: "flex-start",
    backgroundColor: "#332d21",
    borderColor: "#66552d",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row-reverse",
    padding: 13,
  },

  warningText: {
    color: "#d8c493",
    flex: 1,
    fontSize: 11,
    lineHeight: 19,
    marginRight: 9,
    textAlign: "right",
  },

  duaCard: {
    alignItems: "center",
    backgroundColor: "#173a4d",
    borderColor: "#2b6e7d",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },

  duaText: {
    color: "#f2f7fa",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 29,
    textAlign: "center",
  },

  duaSource: {
    color: "#72efdd",
    fontSize: 10,
    marginTop: 7,
  },
});

