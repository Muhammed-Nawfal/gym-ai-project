import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/context/AuthContext';
import { appColors } from "../../constants/appColors";

export default function TabLayout() {
  const { token, isLoading } = useAuth();

  // Still checking AsyncStorage for a saved token - avoid flashing the
  // login screen before we actually know whether the user is signed in.
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color={appColors.gold} />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <AppTabs />;
}
