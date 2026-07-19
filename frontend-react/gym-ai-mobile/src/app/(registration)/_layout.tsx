import { Stack } from 'expo-router';
import { RegistrationProvider } from '@/context/RegistrationContext';

// Mirrors the web app's <Route element={<RegistrationProvider><Outlet /></RegistrationProvider>}>
// wrapping /register and /onboarding - both steps share one in-progress
// registration form across two screens.
export default function RegistrationLayout() {
  return (
    <RegistrationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RegistrationProvider>
  );
}
