import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#72efdd",
        tabBarInactiveTintColor: "#8391a7",
        tabBarStyle: {
          backgroundColor: "#111b31",
          borderTopColor: "#263653",
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>⌂</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="prayers"
        options={{
          title: "الصلاة",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21 }}>◷</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="quran"
        options={{
          title: "القرآن",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21 }}>☷</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="azkar"
        options={{
          title: "الأذكار",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21 }}>✦</Text>
          ),
        }}
      />
    </Tabs>
  );
}

