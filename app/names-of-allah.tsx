import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface NameOfAllah {
  id: number;
  name: string;
  meaning: string;
  description: string;
}

const namesOfAllah: NameOfAllah[] = [
  {
    id: 1,
    name: "الرَّحْمَنُ",
    meaning: "واسع الرحمة",
    description: "الذي وسعت رحمته جميع خلقه في الدنيا والآخرة.",
  },
  {
    id: 2,
    name: "الرَّحِيمُ",
    meaning: "دائم الرحمة",
    description: "الذي يرحم عباده المؤمنين رحمة خاصة.",
  },
  {
    id: 3,
    name: "الْمَلِكُ",
    meaning: "مالك كل شيء",
    description: "المتصرف في جميع الموجودات بحكمه وأمره.",
  },
  {
    id: 4,
    name: "الْقُدُّوسُ",
    meaning: "المنزه عن كل نقص",
    description: "الطاهر المنزه عن العيوب والنقائص.",
  },
  {
    id: 5,
    name: "السَّلَامُ",
    meaning: "المعطي للسلامة",
    description: "السالم من كل عيب، ومانح السلام لعباده.",
  },
  {
    id: 6,
    name: "الْمُؤْمِنُ",
    meaning: "المصدق لعباده",
    description: "الذي يؤمن عباده من الخوف والظلم.",
  },
  {
    id: 7,
    name: "الْمُهَيْمِنُ",
    meaning: "الرقيب الحافظ",
    description: "المطلع على أعمال خلقه والحافظ لهم.",
  },
  {
    id: 8,
    name: "الْعَزِيزُ",
    meaning: "الغالب القوي",
    description: "الذي لا يغلبه غالب ولا يعجزه شيء.",
  },
  {
    id: 9,
    name: "الْجَبَّارُ",
    meaning: "العالي القاهر",
    description: "الذي يجبر كسر الضعفاء ويقهر الجبابرة.",
  },
  {
    id: 10,
    name: "الْمُتَكَبِّرُ",
    meaning: "العظيم المتعالي",
    description: "المتعالي عن صفات الخلق وعن كل نقص.",
  },
  {
    id: 11,
    name: "الْخَالِقُ",
    meaning: "الموجد للخلق",
    description: "الذي أوجد جميع المخلوقات من العدم.",
  },
  {
    id: 12,
    name: "الْبَارِئُ",
    meaning: "المنشئ للخلق",
    description: "الذي خلق الخلق وأوجدهم على غير مثال سابق.",
  },
  {
    id: 13,
    name: "الْمُصَوِّرُ",
    meaning: "المعطي للصور",
    description: "الذي صور كل مخلوق بصورة تميزه.",
  },
  {
    id: 14,
    name: "الْغَفَّارُ",
    meaning: "كثير المغفرة",
    description: "الذي يغفر ذنوب عباده مرة بعد مرة.",
  },
  {
    id: 15,
    name: "الْقَهَّارُ",
    meaning: "الغالب لكل شيء",
    description: "الذي قهر جميع خلقه بقدرته وسلطانه.",
  },
  {
    id: 16,
    name: "الْوَهَّابُ",
    meaning: "كثير العطاء",
    description: "الذي يهب النعم لعباده من غير مقابل.",
  },
  {
    id: 17,
    name: "الرَّزَّاقُ",
    meaning: "المتكفل بالأرزاق",
    description: "الذي يرزق جميع الخلق ويوسع عليهم.",
  },
  {
    id: 18,
    name: "الْفَتَّاحُ",
    meaning: "فاتح أبواب الخير",
    description: "الذي يفتح لعباده أبواب رحمته ونصره ورزقه.",
  },
  {
    id: 19,
    name: "الْعَلِيمُ",
    meaning: "المحيط بكل علم",
    description: "الذي لا يخفى عليه شيء في الأرض ولا في السماء.",
  },
  {
    id: 20,
    name: "الْقَابِضُ",
    meaning: "الممسك المقتدر",
    description: "الذي يقبض الأرزاق والأرواح بحكمته.",
  },
  {
    id: 21,
    name: "الْبَاسِطُ",
    meaning: "الموسع للرزق",
    description: "الذي يبسط الرزق والرحمة على من يشاء.",
  },
  {
    id: 22,
    name: "الْخَافِضُ",
    meaning: "المخفض لمن يشاء",
    description: "الذي يخفض أهل الكبر والظلم بحكمته.",
  },
  {
    id: 23,
    name: "الرَّافِعُ",
    meaning: "الرافع لمن يشاء",
    description: "الذي يرفع أهل الإيمان والطاعة.",
  },
  {
    id: 24,
    name: "الْمُعِزُّ",
    meaning: "مانح العزة",
    description: "الذي يعطي العزة لمن يشاء من عباده.",
  },
  {
    id: 25,
    name: "الْمُذِلُّ",
    meaning: "خافض المتكبرين",
    description: "الذي يذل من استحق الذل بحكمته وعدله.",
  },
  {
    id: 26,
    name: "السَّمِيعُ",
    meaning: "السامع لكل شيء",
    description: "الذي يسمع دعاء عباده وكلامهم وأصواتهم.",
  },
  {
    id: 27,
    name: "الْبَصِيرُ",
    meaning: "المطلع على كل شيء",
    description: "الذي يرى جميع الأشياء ظاهرها وباطنها.",
  },
  {
    id: 28,
    name: "الْحَكَمُ",
    meaning: "الحاكم بالحق",
    description: "الذي يفصل بين عباده بالعدل ولا يظلم أحداً.",
  },
  {
    id: 29,
    name: "الْعَدْلُ",
    meaning: "المنزه عن الظلم",
    description: "الذي لا يجور في حكمه ولا يظلم عباده.",
  },
  {
    id: 30,
    name: "اللَّطِيفُ",
    meaning: "الرفيق بعباده",
    description: "الذي يوصل الخير إلى عباده بطرق خفية.",
  },
  {
    id: 31,
    name: "الْخَبِيرُ",
    meaning: "العالم ببواطن الأمور",
    description: "الذي أحاط علمه بدقائق الأشياء وخفاياها.",
  },
  {
    id: 32,
    name: "الْحَلِيمُ",
    meaning: "غير المعاجل بالعقوبة",
    description: "الذي يمهل عباده مع قدرته على مؤاخذتهم.",
  },
  {
    id: 33,
    name: "الْعَظِيمُ",
    meaning: "بالغ العظمة",
    description: "الذي له العظمة والكمال والجلال المطلق.",
  },
  {
    id: 34,
    name: "الْغَفُورُ",
    meaning: "واسع المغفرة",
    description: "الذي يستر الذنوب ويغفرها لمن تاب إليه.",
  },
  {
    id: 35,
    name: "الشَّكُورُ",
    meaning: "المثيب على القليل",
    description: "الذي يضاعف أجر الطاعات اليسيرة.",
  },
  {
    id: 36,
    name: "الْعَلِيُّ",
    meaning: "رفيع القدر",
    description: "المتعالي بذاته وصفاته وقهره فوق خلقه.",
  },
  {
    id: 37,
    name: "الْكَبِيرُ",
    meaning: "العظيم الذي لا أعظم منه",
    description: "الذي كل شيء دونه وهو المتصف بالكمال.",
  },
  {
    id: 38,
    name: "الْحَفِيظُ",
    meaning: "الحافظ لكل شيء",
    description: "الذي يحفظ خلقه ويحفظ أعمالهم وأحوالهم.",
  },
  {
    id: 39,
    name: "الْمُقِيتُ",
    meaning: "الموصل للأقوات",
    description: "الذي يوصل القوت إلى جميع المخلوقات.",
  },
  {
    id: 40,
    name: "الْحَسِيبُ",
    meaning: "الكافي والمحاسب",
    description: "الكافي عباده والمحصي لأعمالهم.",
  },
  {
    id: 41,
    name: "الْجَلِيلُ",
    meaning: "عظيم القدر",
    description: "الموصوف بصفات الجلال والكمال.",
  },
  {
    id: 42,
    name: "الْكَرِيمُ",
    meaning: "كثير الخير والعطاء",
    description: "الذي يكرم عباده ويعطيهم فوق ما يرجون.",
  },
  {
    id: 43,
    name: "الرَّقِيبُ",
    meaning: "المراقب الحافظ",
    description: "المطلع على أعمال عباده ولا يغيب عنه شيء.",
  },
  {
    id: 44,
    name: "الْمُجِيبُ",
    meaning: "مجيب الدعاء",
    description: "الذي يستجيب دعاء من دعاه بفضله وحكمته.",
  },
  {
    id: 45,
    name: "الْوَاسِعُ",
    meaning: "واسع الفضل والرحمة",
    description: "الذي وسع علمه ورحمته وقدرته كل شيء.",
  },
  {
    id: 46,
    name: "الْحَكِيمُ",
    meaning: "واضع الأمور مواضعها",
    description: "الذي يفعل ما فيه الحكمة والخير لعباده.",
  },
  {
    id: 47,
    name: "الْوَدُودُ",
    meaning: "المحب لعباده",
    description: "الذي يحب أولياءه ويحببهم إلى خلقه.",
  },
  {
    id: 48,
    name: "الْمَجِيدُ",
    meaning: "العظيم الشريف",
    description: "الذي له المجد والكمال والعظمة في صفاته.",
  },
  {
    id: 49,
    name: "الْبَاعِثُ",
    meaning: "محيي الموتى",
    description: "الذي يبعث الخلق من قبورهم يوم القيامة.",
  },
  {
    id: 50,
    name: "الشَّهِيدُ",
    meaning: "الحاضر العالم",
    description: "الذي لا يغيب عنه شيء ويشهد على أعمال عباده.",
  },
  {
    id: 51,
    name: "الْحَقُّ",
    meaning: "الثابت الذي لا شك فيه",
    description: "الموجود حقاً المتصف بكل صفات الكمال.",
  },
  {
    id: 52,
    name: "الْوَكِيلُ",
    meaning: "المعتمد عليه",
    description: "الكافي لمن توكل عليه والقائم بأمور عباده.",
  },
  {
    id: 53,
    name: "الْقَوِيُّ",
    meaning: "كامل القوة",
    description: "الذي لا يعجزه شيء في الأرض ولا في السماء.",
  },
  {
    id: 54,
    name: "الْمَتِينُ",
    meaning: "شديد القوة",
    description: "القوي الذي لا يلحقه ضعف ولا تعب.",
  },
  {
    id: 55,
    name: "الْوَلِيُّ",
    meaning: "الناصر والقريب",
    description: "الذي يتولى عباده المؤمنين بالنصر والرعاية.",
  },
  {
    id: 56,
    name: "الْحَمِيدُ",
    meaning: "المحمود على كل حال",
    description: "المستحق لجميع المحامد والثناء.",
  },
  {
    id: 57,
    name: "الْمُحْصِي",
    meaning: "المحيط بعدد الأشياء",
    description: "الذي أحصى كل شيء عدداً وعلماً.",
  },
  {
    id: 58,
    name: "الْمُبْدِئُ",
    meaning: "المنشئ أولاً",
    description: "الذي بدأ خلق الأشياء وأنشأها من العدم.",
  },
  {
    id: 59,
    name: "الْمُعِيدُ",
    meaning: "المعيد للخلق",
    description: "الذي يعيد الخلق بعد موتهم للبعث والحساب.",
  },
  {
    id: 60,
    name: "الْمُحْيِي",
    meaning: "واهب الحياة",
    description: "الذي يحيي الأجساد والقلوب والأرض بعد موتها.",
  },
  {
    id: 61,
    name: "الْمُمِيتُ",
    meaning: "مقدر الموت",
    description: "الذي كتب الموت على جميع خلقه.",
  },
  {
    id: 62,
    name: "الْحَيُّ",
    meaning: "الدائم الحياة",
    description: "الذي له الحياة الكاملة التي لا يسبقها عدم.",
  },
  {
    id: 63,
    name: "الْقَيُّومُ",
    meaning: "القائم بنفسه المقيم لغيره",
    description: "القائم على شؤون خلقه والمدبر لجميع أمورهم.",
  },
  {
    id: 64,
    name: "الْوَاجِدُ",
    meaning: "الغني الذي لا يعوزه شيء",
    description: "الذي لا يفتقر إلى شيء وكل شيء يفتقر إليه.",
  },
  {
    id: 65,
    name: "الْمَاجِدُ",
    meaning: "كثير المجد والكرم",
    description: "المتصف بالعظمة والكرم والشرف.",
  },
  {
    id: 66,
    name: "الْوَاحِدُ",
    meaning: "المنفرد",
    description: "المنفرد بالربوبية والألوهية والكمال.",
  },
  {
    id: 67,
    name: "الأَحَدُ",
    meaning: "الفرد الذي لا مثيل له",
    description: "المنفرد الذي لا شريك له ولا نظير.",
  },
  {
    id: 68,
    name: "الصَّمَدُ",
    meaning: "المقصود في الحوائج",
    description: "الذي تصمد إليه الخلائق في جميع حاجاتها.",
  },
  {
    id: 69,
    name: "الْقَادِرُ",
    meaning: "المتمكن من كل شيء",
    description: "الذي يقدر على فعل ما يشاء بلا عجز.",
  },
  {
    id: 70,
    name: "الْمُقْتَدِرُ",
    meaning: "تام القدرة",
    description: "الذي لا يعجزه شيء وتنفذ مشيئته في خلقه.",
  },
  {
    id: 71,
    name: "الْمُقَدِّمُ",
    meaning: "المقدم لمن يشاء",
    description: "الذي يقدم بعض خلقه في الفضل والمراتب.",
  },
  {
    id: 72,
    name: "الْمُؤَخِّرُ",
    meaning: "المؤخر لمن يشاء",
    description: "الذي يؤخر من يشاء بحكمته وعدله.",
  },
  {
    id: 73,
    name: "الأَوَّلُ",
    meaning: "الذي ليس قبله شيء",
    description: "الموجود قبل كل شيء بلا بداية.",
  },
  {
    id: 74,
    name: "الآخِرُ",
    meaning: "الذي ليس بعده شيء",
    description: "الباقي بعد فناء كل شيء بلا نهاية.",
  },
  {
    id: 75,
    name: "الظَّاهِرُ",
    meaning: "العالي الغالب",
    description: "الذي ليس فوقه شيء وهو القاهر فوق عباده.",
  },
  {
    id: 76,
    name: "الْبَاطِنُ",
    meaning: "المحيط بكل شيء",
    description: "الذي لا تدركه الأبصار ويعلم خفايا الأمور.",
  },
  {
    id: 77,
    name: "الْوَالِي",
    meaning: "المالك المدبر",
    description: "المتولي تدبير خلقه وتصريف شؤونهم.",
  },
  {
    id: 78,
    name: "الْمُتَعَالِي",
    meaning: "المتعالي عن النقائص",
    description: "المرتفع عن صفات المخلوقين وعن كل نقص.",
  },
  {
    id: 79,
    name: "الْبَرُّ",
    meaning: "كثير الإحسان",
    description: "المحسن إلى عباده المتفضل عليهم بنعمه.",
  },
  {
    id: 80,
    name: "التَّوَّابُ",
    meaning: "كثير قبول التوبة",
    description: "الذي يوفق عباده للتوبة ويقبلها منهم.",
  },
  {
    id: 81,
    name: "الْمُنْتَقِمُ",
    meaning: "المعاقب للظالمين",
    description: "الذي يعاقب من استحق العقوبة بعد قيام الحجة.",
  },
  {
    id: 82,
    name: "العَفُوُّ",
    meaning: "كثير التجاوز",
    description: "الذي يمحو السيئات ويتجاوز عن الذنوب.",
  },
  {
    id: 83,
    name: "الرَّؤُوفُ",
    meaning: "شديد الرحمة",
    description: "الذي يرحم عباده ويلطف بهم في جميع أحوالهم.",
  },
  {
    id: 84,
    name: "مَالِكُ الْمُلْكِ",
    meaning: "مالك السلطان كله",
    description: "المتصرف في الملك كله يعطيه وينزعه بحكمته.",
  },
  {
    id: 85,
    name: "ذُو الْجَلَالِ وَالإِكْرَامِ",
    meaning: "صاحب العظمة والكرم",
    description: "المستحق للتعظيم والإجلال والإكرام.",
  },
  {
    id: 86,
    name: "الْمُقْسِطُ",
    meaning: "العادل",
    description: "الذي يقيم العدل ولا يظلم مثقال ذرة.",
  },
  {
    id: 87,
    name: "الْجَامِعُ",
    meaning: "جامع الخلق",
    description: "الذي يجمع الخلق ليوم لا ريب فيه.",
  },
  {
    id: 88,
    name: "الْغَنِيُّ",
    meaning: "المستغني عن كل شيء",
    description: "الغني بذاته عن جميع خلقه.",
  },
  {
    id: 89,
    name: "الْمُغْنِي",
    meaning: "المعطي للغنى",
    description: "الذي يغني من يشاء من عباده بفضله.",
  },
  {
    id: 90,
    name: "الْمَانِعُ",
    meaning: "الممسك للضر والنفع",
    description: "الذي يمنع ما يشاء بحكمته ولا مانع لما يعطي.",
  },
  {
    id: 91,
    name: "الضَّارُّ",
    meaning: "المقدر للضر",
    description: "الذي يقدر الضر لحكمة وبقدر معلوم.",
  },
  {
    id: 92,
    name: "النَّافِعُ",
    meaning: "المقدر للنفع",
    description: "الذي يوصل النفع إلى عباده بفضله.",
  },
  {
    id: 93,
    name: "النُّورُ",
    meaning: "منور السماوات والأرض",
    description: "الذي ينور القلوب بالهداية والسماوات والأرض بنوره.",
  },
  {
    id: 94,
    name: "الْهَادِي",
    meaning: "المرشد إلى الحق",
    description: "الذي يهدي عباده إلى طريق الحق والصواب.",
  },
  {
    id: 95,
    name: "الْبَدِيعُ",
    meaning: "المبدع بلا مثال سابق",
    description: "الذي خلق الأشياء على غير مثال سابق.",
  },
  {
    id: 96,
    name: "الْبَاقِي",
    meaning: "الدائم الوجود",
    description: "الذي لا يلحقه فناء ولا زوال.",
  },
  {
    id: 97,
    name: "الْوَارِثُ",
    meaning: "الباقي بعد فناء الخلق",
    description: "الذي يرث الأرض ومن عليها ويبقى بعد كل شيء.",
  },
  {
    id: 98,
    name: "الرَّشِيدُ",
    meaning: "المرشد إلى الصواب",
    description: "الذي يرشد عباده إلى مصالحهم وسبيل الرشاد.",
  },
  {
    id: 99,
    name: "الصَّبُورُ",
    meaning: "غير المعاجل بالعقوبة",
    description: "الذي لا يعجل على العصاة مع قدرته عليهم.",
  },
];

export default function NamesOfAllahScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteNames, setFavoriteNames] = useState<
    Record<number, boolean>
  >({});
  const [expandedName, setExpandedName] = useState<number | null>(
    null
  );

  const filteredNames = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("ar");

    if (!query) {
      return namesOfAllah;
    }

    return namesOfAllah.filter((item) => {
      return (
        item.name.toLocaleLowerCase("ar").includes(query) ||
        item.meaning.toLocaleLowerCase("ar").includes(query) ||
        item.description.toLocaleLowerCase("ar").includes(query) ||
        String(item.id).includes(query)
      );
    });
  }, [searchQuery]);

  const toggleFavorite = (id: number) => {
    setFavoriteNames((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const toggleExpanded = (id: number) => {
    setExpandedName((current) => (current === id ? null : id));
  };

  const renderName = ({ item }: { item: NameOfAllah }) => {
    const isFavorite = favoriteNames[item.id] === true;
    const isExpanded = expandedName === item.id;

    return (
      <View style={styles.nameCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{item.id}</Text>
          </View>

          <View style={styles.nameTextContainer}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.meaningText}>{item.meaning}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `إزالة ${item.name} من المفضلة`
                : `إضافة ${item.name} إلى المفضلة`
            }
            onPress={() => toggleFavorite(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={21}
              color={isFavorite ? "#ee91ab" : "#75869e"}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`عرض معنى ${item.name}`}
            onPress={() => toggleExpanded(item.id)}
            style={styles.expandButton}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={19}
              color="#72efdd"
            />
          </Pressable>
        </View>

        {isExpanded ? (
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionDivider} />
            <Text style={styles.descriptionText}>
              {item.description}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
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
            <Text style={styles.title}>أسماء الله الحسنى</Text>
            <Text style={styles.subtitle}>
              فَادْعُوهُ بِهَا
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles-outline"
              size={25}
              color="#72efdd"
            />
          </View>
        </View>

        <View style={styles.introCard}>
          <View style={styles.introIconContainer}>
            <Text style={styles.introIcon}>ﷲ</Text>
          </View>

          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              تعرف على أسماء ربك
            </Text>
            <Text style={styles.introText}>
              تأمل معاني أسماء الله الحسنى واجعلها حاضرة في دعائك
              وذكرك.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>99</Text>
            <Text style={styles.statLabel}>اسماً</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Object.values(favoriteNames).filter(Boolean).length}
            </Text>
            <Text style={styles.statLabel}>المفضلة</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {filteredNames.length}
            </Text>
            <Text style={styles.statLabel}>المعروضة</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color="#8190a8"
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ابحث عن اسم أو معنى..."
            placeholderTextColor="#718198"
            style={styles.searchInput}
            textAlign="right"
          />

          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#718198"
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>الأسماء الحسنى</Text>
          <Text style={styles.listHint}>اضغط لعرض المعنى</Text>
        </View>

        <FlatList
          data={filteredNames}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderName}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={42}
                color="#60718b"
              />
              <Text style={styles.emptyTitle}>
                لا توجد نتائج
              </Text>
              <Text style={styles.emptyText}>
                جرّب البحث باسم آخر أو معنى مختلف.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingTop: 8,
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
    fontSize: 23,
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
    marginBottom: 13,
    padding: 15,
  },

  introIconContainer: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.15)",
    borderRadius: 16,
    height: 55,
    justifyContent: "center",
    width: 55,
  },

  introIcon: {
    color: "#72efdd",
    fontSize: 29,
    fontWeight: "700",
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

  introText: {
    color: "#a9cbd0",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "right",
  },

  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 13,
  },

  statCard: {
    alignItems: "center",
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },

  statValue: {
    color: "#72efdd",
    fontSize: 17,
    fontWeight: "800",
  },

  statLabel: {
    color: "#8190a8",
    fontSize: 10,
    marginTop: 3,
  },

  searchContainer: {
    alignItems: "center",
    backgroundColor: "#15243d",
    borderColor: "#2a4263",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row-reverse",
    marginBottom: 18,
    paddingHorizontal: 12,
  },

  searchInput: {
    color: "#edf3f9",
    flex: 1,
    fontSize: 14,
    minHeight: 48,
    paddingHorizontal: 9,
  },

  clearSearchButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },

  listHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  listTitle: {
    color: "#edf3f9",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
  },

  listHint: {
    color: "#8190a8",
    fontSize: 11,
  },

  listContent: {
    paddingBottom: 35,
  },

  nameCard: {
    backgroundColor: "#121f36",
    borderColor: "#243857",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },

  cardTopRow: {
    alignItems: "center",
    flexDirection: "row-reverse",
  },

  numberBadge: {
    alignItems: "center",
    backgroundColor: "rgba(114, 239, 221, 0.13)",
    borderRadius: 10,
    height: 37,
    justifyContent: "center",
    width: 37,
  },

  numberText: {
    color: "#72efdd",
    fontSize: 12,
    fontWeight: "800",
  },

  nameTextContainer: {
    flex: 1,
    marginHorizontal: 11,
  },

  nameText: {
    color: "#f0f5fb",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },

  meaningText: {
    color: "#a3b2c5",
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },

  favoriteButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    marginLeft: 5,
    width: 34,
  },

  expandButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 34,
  },

  descriptionContainer: {
    alignItems: "flex-start",
    flexDirection: "row-reverse",
    marginTop: 13,
  },

  descriptionDivider: {
    backgroundColor: "#72efdd",
    borderRadius: 2,
    height: "100%",
    marginLeft: 9,
    width: 3,
  },

  descriptionText: {
    color: "#c5d3df",
    flex: 1,
    fontSize: 13,
    lineHeight: 23,
    textAlign: "right",
  },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 45,
  },

  emptyTitle: {
    color: "#dce7f1",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    color: "#8190a8",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});

