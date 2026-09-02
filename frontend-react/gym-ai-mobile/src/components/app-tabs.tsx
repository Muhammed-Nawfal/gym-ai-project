import { Dumbbell, House, Trophy, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { appColors, goldAlpha } from "../constants/appColors";

// Switched from the starter template's experimental NativeTabs (which needs
// custom PNG icon assets per tab) to the standard JS-based Tabs component,
// so we can use lucide-react-native icons directly - same icon set already
// used everywhere else ported from the web app's Navbar.
export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appColors.gold,
        tabBarInactiveTintColor: appColors.mutedDark,
        tabBarStyle: { backgroundColor: appColors.black, borderTopColor: goldAlpha(0.1) },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="personal-records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
