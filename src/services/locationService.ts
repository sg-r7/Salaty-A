import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppCoordinates {
  latitude: number;
  longitude: number;
}

export interface SavedLocation extends AppCoordinates {
  city: string;
  source: "gps" | "manual" | "default";
}

export interface CityOption extends AppCoordinates {
  id: string;
  city: string;
  country: string;
  searchText: string;
}

const LOCATION_STORAGE_KEY = "salaty_saved_location";

export const DEFAULT_LOCATION: SavedLocation = {
  city: "مكة المكرمة",
  latitude: 21.4225,
  longitude: 39.8262,
  source: "default",
};

export const CITIES: CityOption[] = [
  {
    id: "makkah",
    city: "مكة المكرمة",
    country: "السعودية",
    latitude: 21.4225,
    longitude: 39.8262,
    searchText: "مكة المكرمة makkah mecca السعودية saudi arabia",
  },
  {
    id: "madinah",
    city: "المدينة المنورة",
    country: "السعودية",
    latitude: 24.5247,
    longitude: 39.5692,
    searchText:
      "المدينة المنورة madinah medina السعودية saudi arabia",
  },
  {
    id: "riyadh",
    city: "الرياض",
    country: "السعودية",
    latitude: 24.7136,
    longitude: 46.6753,
    searchText: "الرياض riyadh السعودية saudi arabia",
  },
  {
    id: "jeddah",
    city: "جدة",
    country: "السعودية",
    latitude: 21.4858,
    longitude: 39.1925,
    searchText: "جدة jeddah السعودية saudi arabia",
  },
  {
    id: "dammam",
    city: "الدمام",
    country: "السعودية",
    latitude: 26.4207,
    longitude: 50.0888,
    searchText: "الدمام dammam السعودية saudi arabia",
  },
  {
    id: "baghdad",
    city: "بغداد",
    country: "العراق",
    latitude: 33.3152,
    longitude: 44.3661,
    searchText: "بغداد baghdad العراق iraq",
  },
  {
    id: "basra",
    city: "البصرة",
    country: "العراق",
    latitude: 30.5085,
    longitude: 47.7804,
    searchText: "البصرة basra العراق iraq",
  },
  {
    id: "erbil",
    city: "أربيل",
    country: "العراق",
    latitude: 36.1911,
    longitude: 44.0092,
    searchText: "أربيل erbil العراق iraq",
  },
  {
    id: "amman",
    city: "عمّان",
    country: "الأردن",
    latitude: 31.9539,
    longitude: 35.9106,
    searchText: "عمان عمّان amman الأردن jordan",
  },
  {
    id: "jerusalem",
    city: "القدس",
    country: "فلسطين",
    latitude: 31.7683,
    longitude: 35.2137,
    searchText: "القدس jerusalem فلسطين palestine",
  },
  {
    id: "gaza",
    city: "غزة",
    country: "فلسطين",
    latitude: 31.5017,
    longitude: 34.4668,
    searchText: "غزة gaza فلسطين palestine",
  },
  {
    id: "cairo",
    city: "القاهرة",
    country: "مصر",
    latitude: 30.0444,
    longitude: 31.2357,
    searchText: "القاهرة cairo مصر egypt",
  },
  {
    id: "alexandria",
    city: "الإسكندرية",
    country: "مصر",
    latitude: 31.2001,
    longitude: 29.9187,
    searchText: "الإسكندرية alexandria مصر egypt",
  },
  {
    id: "giza",
    city: "الجيزة",
    country: "مصر",
    latitude: 30.0131,
    longitude: 31.2089,
    searchText: "الجيزة giza مصر egypt",
  },
  {
    id: "khartoum",
    city: "الخرطوم",
    country: "السودان",
    latitude: 15.5007,
    longitude: 32.5599,
    searchText: "الخرطوم khartoum السودان sudan",
  },
  {
    id: "tripoli",
    city: "طرابلس",
    country: "ليبيا",
    latitude: 32.8872,
    longitude: 13.1913,
    searchText: "طرابلس tripoli ليبيا libya",
  },
  {
    id: "tunis",
    city: "تونس",
    country: "تونس",
    latitude: 36.8065,
    longitude: 10.1815,
    searchText: "تونس tunis tunisia",
  },
  {
    id: "algiers",
    city: "الجزائر",
    country: "الجزائر",
    latitude: 36.7538,
    longitude: 3.0588,
    searchText: "الجزائر algiers algeria",
  },
  {
    id: "rabat",
    city: "الرباط",
    country: "المغرب",
    latitude: 34.0209,
    longitude: -6.8416,
    searchText: "الرباط rabat المغرب morocco",
  },
  {
    id: "casablanca",
    city: "الدار البيضاء",
    country: "المغرب",
    latitude: 33.5731,
    longitude: -7.5898,
    searchText:
      "الدار البيضاء casablanca المغرب morocco",
  },
  {
    id: "damascus",
    city: "دمشق",
    country: "سوريا",
    latitude: 33.5138,
    longitude: 36.2765,
    searchText: "دمشق damascus سوريا syria",
  },
  {
    id: "beirut",
    city: "بيروت",
    country: "لبنان",
    latitude: 33.8938,
    longitude: 35.5018,
    searchText: "بيروت beirut لبنان lebanon",
  },
  {
    id: "doha",
    city: "الدوحة",
    country: "قطر",
    latitude: 25.2854,
    longitude: 51.531,
    searchText: "الدوحة doha قطر qatar",
  },
  {
    id: "kuwait",
    city: "مدينة الكويت",
    country: "الكويت",
    latitude: 29.3759,
    longitude: 47.9774,
    searchText: "الكويت kuwait الكويت",
  },
  {
    id: "manama",
    city: "المنامة",
    country: "البحرين",
    latitude: 26.2235,
    longitude: 50.5876,
    searchText: "المنامة manama البحرين bahrain",
  },
  {
    id: "abu-dhabi",
    city: "أبو ظبي",
    country: "الإمارات",
    latitude: 24.4539,
    longitude: 54.3773,
    searchText: "أبو ظبي abu dhabi الإمارات uae",
  },
  {
    id: "dubai",
    city: "دبي",
    country: "الإمارات",
    latitude: 25.2048,
    longitude: 55.2708,
    searchText: "دبي dubai الإمارات uae",
  },
  {
    id: "muscat",
    city: "مسقط",
    country: "عُمان",
    latitude: 23.588,
    longitude: 58.3829,
    searchText: "مسقط muscat عمان oman",
  },
  {
    id: "sanaa",
    city: "صنعاء",
    country: "اليمن",
    latitude: 15.3694,
    longitude: 44.191,
    searchText: "صنعاء sanaa اليمن yemen",
  },
  {
    id: "istanbul",
    city: "إسطنبول",
    country: "تركيا",
    latitude: 41.0082,
    longitude: 28.9784,
    searchText: "إسطنبول istanbul تركيا turkey",
  },
  {
    id: "london",
    city: "لندن",
    country: "المملكة المتحدة",
    latitude: 51.5074,
    longitude: -0.1278,
    searchText: "لندن london بريطانيا uk united kingdom",
  },
  {
    id: "paris",
    city: "باريس",
    country: "فرنسا",
    latitude: 48.8566,
    longitude: 2.3522,
    searchText: "باريس paris فرنسا france",
  },
  {
    id: "new-york",
    city: "نيويورك",
    country: "الولايات المتحدة",
    latitude: 40.7128,
    longitude: -74.006,
    searchText: "نيويورك new york الولايات المتحدة usa",
  },
  {
    id: "toronto",
    city: "تورنتو",
    country: "كندا",
    latitude: 43.6532,
    longitude: -79.3832,
    searchText: "تورنتو toronto كندا canada",
  },
  {
    id: "kuala-lumpur",
    city: "كوالالمبور",
    country: "ماليزيا",
    latitude: 3.139,
    longitude: 101.6869,
    searchText:
      "كوالالمبور kuala lumpur ماليزيا malaysia",
  },
  {
    id: "jakarta",
    city: "جاكرتا",
    country: "إندونيسيا",
    latitude: -6.2088,
    longitude: 106.8456,
    searchText: "جاكرتا jakarta إندونيسيا indonesia",
  },
];

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("ar")
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/أ|إ|آ/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export function searchCities(query: string): CityOption[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return CITIES;
  }

  return CITIES.filter((city) =>
    normalizeSearchText(city.searchText).includes(
      normalizedQuery
    )
  );
}

export async function saveLocation(
  location: SavedLocation
): Promise<void> {
  await AsyncStorage.setItem(
    LOCATION_STORAGE_KEY,
    JSON.stringify(location)
  );
}

export async function getSavedLocation(): Promise<SavedLocation> {
  const savedValue = await AsyncStorage.getItem(
    LOCATION_STORAGE_KEY
  );

  if (!savedValue) {
    return DEFAULT_LOCATION;
  }

  try {
    const parsed = JSON.parse(savedValue) as Partial<SavedLocation>;

    if (
      typeof parsed.city !== "string" ||
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number"
    ) {
      return DEFAULT_LOCATION;
    }

    return {
      city: parsed.city,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      source: parsed.source || "manual",
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

export async function saveCity(
  city: CityOption
): Promise<SavedLocation> {
  const location: SavedLocation = {
    city: city.city,
    latitude: city.latitude,
    longitude: city.longitude,
    source: "manual",
  };

  await saveLocation(location);
  return location;
}

export async function requestLocationPermission(): Promise<boolean> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  return permission.status === "granted";
}

export async function detectCurrentLocation(): Promise<SavedLocation> {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    return getSavedLocation();
  }

  try {
    const position =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    let cityName = "الموقع الحالي";

    try {
      const places = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (places.length > 0) {
        const place = places[0];

        cityName =
          place.city ||
          place.district ||
          place.subregion ||
          place.region ||
          cityName;
      }
    } catch {
      cityName = "الموقع الحالي";
    }

    const location: SavedLocation = {
      city: cityName,
      latitude,
      longitude,
      source: "gps",
    };

    await saveLocation(location);

    return location;
  } catch {
    return getSavedLocation();
  }
}

export async function clearSavedLocation(): Promise<void> {
  await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
}

