import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";

interface Surah {
  number: number;
  name: string;
  verses: number;
}

interface Juz {
  number: number;
  name: string;
}

interface QuranAyah {
  numberInSurah: number;
  text: string;
}

interface QuranResponse {
  data?: {
    name: string;
    ayahs: QuranAyah[];
  };
}

type ActiveTab = "surahs" | "juzs";
type ReaderType = "surah" | "juz";

interface ReaderTarget {
  type: ReaderType;
  number: number;
  title: string;
}

interface Reciter {
  id: string;
  name: string;
  url: string;
}

const surahNames = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

const verseCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111,
  43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75,
  85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30,
  52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29,
  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19,
  5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const surahs: Surah[] = surahNames.map((name, index) => ({
  number: index + 1,
  name,
  verses: verseCounts[index],
}));

const juzs: Juz[] = Array.from({ length: 30 }, (_, index) => ({
  number: index + 1,
  name: `الجزء ${index + 1}`,
}));

const reciters: Reciter[] = [
  {
    id: "al-luhaidan",
    name: "الشيخ محمد اللحيدان",
    url: "https://server8.mp3quran.net/lhdan/001.mp3",
  },
  {
    id: "yasser",
    name: "الشيخ ياسر الدوسري",
    url: "https://server11.mp3quran.net/yasser/001.mp3",
  },
  {
    id: "abdulbasit",
    name: "الشيخ عبد الباسط عبد الصمد",
    url: "https://server7.mp3quran.net/basit/001.mp3",
  },
];

function getSurahAudioUrl(
  reciterId: string,
  surahNumber: number
): string {
  const reciter = reciters.find(
    (item) => item.id === reciterId
  );

  if (!reciter) {
    return "";
  }

  const baseUrl = reciter.url.substring(
    0,
    reciter.url.lastIndexOf("/") + 1
  );

  return `${baseUrl}${String(surahNumber).padStart(3, "0")}.mp3`;
}

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function ReaderModal({
  target,
  onClose,
}: {
  target: ReaderTarget | null;
  onClose: () => void;
}) {
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!target) {
      return;
    }

    let cancelled = false;

    const loadAyahs = async () => {
      setLoading(true);
      setError("");
      setAyahs([]);

      try {
        const endpoint =
          target.type === "surah"
            ? `https://api.alquran.cloud/v1/surah/${target.number}/quran-uthmani`
            : `https://api.alquran.cloud/v1/juz/${target.number}/quran-uthmani`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("تعذر تحميل الآيات");
        }

        const result = (await response.json()) as QuranResponse;

        if (!cancelled) {
          setTitle(result.data?.name || target.title);
          setAyahs(result.data?.ayahs || []);
        }
      } catch {
        if (!cancelled) {
          setError(
            "تعذر تحميل النص حالياً. تحقق من اتصال الإنترنت."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAyahs();

    return () => {
      cancelled = true;
    };
  }, [target]);

  return (
    <Modal
      visible={Boolean(target)}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Text style={styles.modalTitle}>{title || "القرآن الكريم"}</Text>

          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <ActivityIndicator
            color="#72efdd"
            size="large"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <ScrollView
            contentContainerStyle={styles.ayahContainer}
            showsVerticalScrollIndicator={false}
          >
            {ayahs.map((ayah) => (
              <View key={`${ayah.numberInSurah}-${ayah.text}`}>
                <Text style={styles.ayahText}>
                  {ayah.text}{" "}
                  <Text style={styles.ayahNumber}>
                    ﴿{ayah.numberInSurah}﴾
                  </Text>
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function AudioModal({
  target,
  onClose,
}: {
  target: ReaderTarget | null;
  onClose: () => void;
}) {
  const [selectedReciter, setSelectedReciter] = useState(
    reciters[0].id
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => undefined);
      }
    };
  }, [sound]);

  useEffect(() => {
    setPosition(0);
    setDuration(1);
    setIsPlaying(false);
  }, [target]);

  const handleStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 1);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish && sound) {
      sound.setPositionAsync(0).catch(() => undefined);
      setIsPlaying(false);
    }
  };

  const playSelectedReciter = async () => {
    if (!target || target.type !== "surah") {
      return;
    }

    setLoading(true);

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const url = getSurahAudioUrl(
        selectedReciter,
        target.number
      );

      const result = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        handleStatusUpdate
      );

      setSound(result.sound);
    } catch {
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!sound) {
      await playSelectedReciter();
      return;
    }

    const status = await sound.getStatusAsync();

    if (!status.isLoaded) {
      return;
    }

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const closeAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    onClose();
  };

  const progressWidth = `${Math.min(
    100,
    Math.max(0, (position / duration) * 100)
  )}%`;

  return (
    <Modal
      visible={Boolean(target)}
      animationType="slide"
      onRequestClose={closeAudio}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Pressable
            onPress={closeAudio}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Text style={styles.modalTitle}>
            استماع: {target?.title || ""}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.audioContainer}>
          <View style={styles.audioIconCircle}>
            <Text style={styles.audioIcon}>♫</Text>
          </View>

          <Text style={styles.audioTitle}>{target?.title}</Text>
          <Text style={styles.audioSubtitle}>اختر القارئ</Text>

          <View style={styles.reciterList}>
            {reciters.map((reciter) => (
              <Pressable
                key={reciter.id}
                onPress={() => setSelectedReciter(reciter.id)}
                style={[
                  styles.reciterButton,
                  selectedReciter === reciter.id &&
                    styles.selectedReciter,
                ]}
              >
                <Text
                  style={[
                    styles.reciterText,
                    selectedReciter === reciter.id &&
                      styles.selectedReciterText,
                  ]}
                >
                  {reciter.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: progressWidth },
              ]}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {formatDuration(position)}
            </Text>
            <Text style={styles.timeText}>
              {formatDuration(duration)}
            </Text>
          </View>

          <Pressable
            disabled={loading}
            onPress={togglePlay}
            style={styles.playButton}
          >
            <Text style={styles.playButtonText}>
              {loading ? "..." : isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function QuranTab() {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("surahs");
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [selectedSurah, setSelectedSurah] =
    useState<Surah | null>(null);
  const [readerTarget, setReaderTarget] =
    useState<ReaderTarget | null>(null);
  const [audioTarget, setAudioTarget] =
    useState<ReaderTarget | null>(null);
  const [bookmarkedSurah, setBookmarkedSurah] = useState<
    number | null
  >(null);

  const chooseSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setSelectionVisible(true);
  };

  const openReader = () => {
    if (!selectedSurah) {
      return;
    }

    setSelectionVisible(false);
    setReaderTarget({
      type: "surah",
      number: selectedSurah.number,
      title: selectedSurah.name,
    });
  };

  const openAudio = () => {
    if (!selectedSurah) {
      return;
    }

    setSelectionVisible(false);
    setAudioTarget({
      type: "surah",
      number: selectedSurah.number,
      title: selectedSurah.name,
    });
  };

  const openJuz = (juz: Juz) => {
    setReaderTarget({
      type: "juz",
      number: juz.number,
      title: juz.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>القرآن الكريم</Text>
          <Text style={styles.subtitle}>
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </Text>
        </View>

        <View style={styles.lastReadCard}>
          <View>
            <Text style={styles.lastReadLabel}>آخر قراءة</Text>
            <Text style={styles.lastReadTitle}>سورة الكهف</Text>
            <Text style={styles.lastReadSubtitle}>
              اختر سورة لبدء القراءة أو الاستماع
            </Text>
          </View>

          <Text style={styles.quranSymbol}>۞</Text>
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
                <Pressable
                  key={surah.number}
                  onPress={() => chooseSurah(surah)}
                  style={styles.itemRow}
                >
                  <View style={styles.numberBox}>
                    <Text style={styles.numberText}>
                      {surah.number}
                    </Text>
                  </View>

                  <View style={styles.itemTextBox}>
                    <Text style={styles.itemTitle}>
                      {surah.name}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      {surah.verses} آية · قراءة واستماع
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setBookmarkedSurah(
                        bookmarkedSurah === surah.number
                          ? null
                          : surah.number
                      )
                    }
                    style={styles.bookmarkButton}
                  >
                    <Text
                      style={[
                        styles.bookmark,
                        bookmarkedSurah === surah.number &&
                          styles.bookmarkActive,
                      ]}
                    >
                      {bookmarkedSurah === surah.number
                        ? "★"
                        : "☆"}
                    </Text>
                  </Pressable>
                </Pressable>
              ))
            : juzs.map((juz) => (
                <Pressable
                  key={juz.number}
                  onPress={() => openJuz(juz)}
                  style={styles.itemRow}
                >
                  <View style={styles.numberBox}>
                    <Text style={styles.numberText}>
                      {juz.number}
                    </Text>
                  </View>

                  <View style={styles.itemTextBox}>
                    <Text style={styles.itemTitle}>
                      {juz.name}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                      اضغط لقراءة آيات الجزء
                    </Text>
                  </View>

                  <Text style={styles.juzArrow}>‹</Text>
                </Pressable>
              ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectionVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectionVisible(false)}
      >
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionTitle}>
              {selectedSurah?.name || "السورة"}
            </Text>

            <Text style={styles.selectionSubtitle}>
              اختر طريقة المتابعة
            </Text>

            <Pressable
              onPress={openReader}
              style={styles.selectionButton}
            >
              <Text style={styles.selectionIcon}>📖</Text>
              <Text style={styles.selectionButtonText}>
                قراءة السورة
              </Text>
            </Pressable>

            <Pressable
              onPress={openAudio}
              style={styles.selectionButton}
            >
              <Text style={styles.selectionIcon}>♫</Text>
              <Text style={styles.selectionButtonText}>
                استماع صوتي
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectionVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>إلغاء</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ReaderModal
        target={readerTarget}
        onClose={() => setReaderTarget(null)}
      />

      <AudioModal
        target={audioTarget}
        onClose={() => setAudioTarget(null)}
      />
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
  quranSymbol: {
    color: "#72efdd",
    fontSize: 42,
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
  juzArrow: {
    color: "#72efdd",
    fontSize: 28,
  },
  selectionOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  selectionCard: {
    backgroundColor: "#15243d",
    borderColor: "#2b6e7d",
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    width: "100%",
  },
  selectionTitle: {
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
  },
  selectionSubtitle: {
    color: "#9caec2",
    fontSize: 13,
    marginBottom: 18,
    marginTop: 6,
    textAlign: "center",
  },
  selectionButton: {
    alignItems: "center",
    backgroundColor: "#1d3d52",
    borderRadius: 13,
    flexDirection: "row-reverse",
    marginTop: 10,
    padding: 15,
  },
  selectionIcon: {
    fontSize: 22,
    marginLeft: 10,
  },
  selectionButtonText: {
    color: "#ffffff",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  cancelButton: {
    alignItems: "center",
    marginTop: 16,
    padding: 10,
  },
  cancelText: {
    color: "#a8b8ca",
    fontSize: 14,
  },
  modalSafeArea: {
    backgroundColor: "#0b1326",
    flex: 1,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalTitle: {
    color: "#ffffff",
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "right",
  },
  closeButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  closeText: {
    color: "#72efdd",
    fontSize: 34,
    fontWeight: "300",
  },
  headerSpacer: {
    width: 42,
  },
  loader: {
    marginTop: 60,
  },
  errorText: {
    color: "#ffb4b4",
    fontSize: 15,
    margin: 30,
    textAlign: "center",
  },
  ayahContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  ayahText: {
    color: "#f4f0df",
    fontSize: 24,
    lineHeight: 48,
    textAlign: "right",
  },
  ayahNumber: {
    color: "#72efdd",
    fontSize: 18,
  },
  audioContainer: {
    alignItems: "center",
    padding: 24,
  },
  audioIconCircle: {
    alignItems: "center",
    backgroundColor: "#183c52",
    borderRadius: 55,
    height: 110,
    justifyContent: "center",
    marginTop: 28,
    width: 110,
  },
  audioIcon: {
    color: "#72efdd",
    fontSize: 54,
  },
  audioTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 22,
  },
  audioSubtitle: {
    color: "#8fa1b7",
    fontSize: 14,
    marginTop: 6,
  },
  reciterList: {
    width: "100%",
  },
  reciterButton: {
    backgroundColor: "#15243d",
    borderColor: "#2b3e5d",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 11,
    padding: 14,
  },
  selectedReciter: {
    backgroundColor: "#244b57",
    borderColor: "#72efdd",
  },
  reciterText: {
    color: "#d8e2ed",
    fontSize: 14,
    textAlign: "center",
  },
  selectedReciterText: {
    color: "#72efdd",
    fontWeight: "800",
  },
  progressTrack: {
    backgroundColor: "#2a3a54",
    borderRadius: 5,
    height: 8,
    marginTop: 30,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    backgroundColor: "#72efdd",
    borderRadius: 5,
    height: "100%",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    width: "100%",
  },
  timeText: {
    color: "#8fa1b7",
    fontSize: 12,
  },
  playButton: {
    alignItems: "center",
    backgroundColor: "#72efdd",
    borderRadius: 14,
    marginTop: 25,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  playButtonText: {
    color: "#102337",
    fontSize: 15,
    fontWeight: "800",
  },
});
