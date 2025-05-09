import { Tabs } from "expo-router";
import { Platform } from "react-native";
import MainTheme from "./../MainTheme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MainTheme.colors.text,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: MainTheme.colors.background,
          },
          default: {
            backgroundColor: MainTheme.colors.background,
          },
        }),
      }}
    >
      <Tabs.Screen name="HomePage" options={{ title: "Home" }} />
      <Tabs.Screen name="SavedPage" options={{ title: "Saved" }} />
      <Tabs.Screen name="CartPage" options={{ title: "Cart" }} />
      <Tabs.Screen name="ProfilePage" options={{ title: "Profile" }} />
    </Tabs>
  );
}
