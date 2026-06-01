import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useFonts, HeptaSlab_600SemiBold } from '@expo-google-fonts/hepta-slab';
import { Urbanist_400Regular, Urbanist_600SemiBold } from '@expo-google-fonts/urbanist';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        HeptaSlab_600SemiBold,
        Urbanist_400Regular,
        Urbanist_600SemiBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}