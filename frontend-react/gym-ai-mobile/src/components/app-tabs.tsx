import { BicepsFlexed, Dumbbell, House, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';

// Switched from the starter template's experimental NativeTabs (which needs
// custom PNG icon assets per tab) to the standard JS-based Tabs component,
// so we can use lucide-react-native icons directly - same icon set already
// used everywhere else ported from the web app's Navbar.
export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#d4af37',
        tabBarInactiveTintColor: '#71717a',
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: 'rgba(212, 175, 55, 0.1)' },
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
        name="exercise"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => <BicepsFlexed color={color} size={size} />,
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
