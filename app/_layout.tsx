import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import MainTheme from './MainTheme';

export default function RootLayout() {
  return (
    <ThemeProvider value={MainTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthPage" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}