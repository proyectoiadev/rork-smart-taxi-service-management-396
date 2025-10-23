import 'intl';
import 'intl/locale-data/jsonp/es-ES';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { RecurringClientsProvider } from "@/contexts/RecurringClientsContext";
import { RecurringServicesProvider } from "@/contexts/RecurringServicesContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkActivation = useCallback(async () => {
    try {
      console.log('Checking activation status...');
      const activated = await AsyncStorage.getItem('appActivated_taxi_pro_v2');
      const expirationStr = await AsyncStorage.getItem('activation_expiration');
      const firstLaunchStr = await AsyncStorage.getItem('first_launch_date');
      
      console.log('Activated:', activated);
      console.log('Expiration:', expirationStr);
      console.log('First launch:', firstLaunchStr);
      
      const now = new Date();
      
      if (!firstLaunchStr) {
        // Primera ejecución - activar trial
        const firstLaunchDate = now.toISOString();
        const trialExpiration = new Date(now);
        trialExpiration.setDate(trialExpiration.getDate() + 10);
        
        await Promise.all([
          AsyncStorage.setItem('first_launch_date', firstLaunchDate),
          AsyncStorage.setItem('appActivated_taxi_pro_v2', 'true'),
          AsyncStorage.setItem('activation_date', firstLaunchDate),
          AsyncStorage.setItem('activation_expiration', trialExpiration.toISOString()),
          AsyncStorage.setItem('activation_type', 'trial')
        ]);
        
        console.log('First launch - trial activated until:', trialExpiration.toISOString());
        setIsActivated(true);
      } else if (activated === 'true' && expirationStr) {
        const expirationDate = new Date(expirationStr);
        
        // Validar que la fecha sea válida
        if (isNaN(expirationDate.getTime())) {
          console.error('Invalid expiration date');
          await AsyncStorage.removeItem('appActivated_taxi_pro_v2');
          setIsActivated(false);
          return;
        }
        
        console.log('Expiration date:', expirationDate);
        console.log('Current date:', now);
        console.log('Is valid:', now < expirationDate);
        
        if (now < expirationDate) {
          setIsActivated(true);
        } else {
          console.log('Activation expired, removing...');
          await AsyncStorage.removeItem('appActivated_taxi_pro_v2');
          setIsActivated(false);
        }
      } else {
        console.log('No activation found');
        setIsActivated(false);
      }
    } catch (error) {
      console.error('Error checking activation:', error);
      setIsActivated(false);
    }
  }, []);

  // Verificación inicial
  useEffect(() => {
    const initializeApp = async () => {
      await checkActivation();
      setIsChecking(false);
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    };

    initializeApp();
  }, []); // Solo ejecutar una vez al montar

  // Verificación periódica con AppState
  useEffect(() => {
    if (isChecking) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App became active, checking activation');
        checkActivation();
      }
    });

    // Verificación cada 5 minutos en lugar de 1
    checkIntervalRef.current = setInterval(() => {
      checkActivation();
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      subscription.remove();
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isChecking, checkActivation]);

  // Manejo de navegación
  useEffect(() => {
    if (isChecking) return;

    const inActivationScreen = segments[0] === 'activation';

    console.log('Navigation effect - isActivated:', isActivated, 'inActivationScreen:', inActivationScreen, 'segments:', segments);

    const navigate = async () => {
      try {
        if (!isActivated && !inActivationScreen) {
          console.log('Redirecting to activation screen');
          router.replace('/activation');
        } else if (isActivated && inActivationScreen) {
          console.log('Redirecting to home screen');
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    // Pequeño delay para evitar race conditions
    const timer = setTimeout(navigate, 100);
    
    return () => clearTimeout(timer);
  }, [isActivated, segments, isChecking, router]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="activation" options={{ headerShown: false }} />
      <Stack.Screen name="export-csv" options={{ title: "Exportar CSV" }} />
      <Stack.Screen name="generate-pdf" options={{ title: "Generar PDF" }} />
      <Stack.Screen name="cycle-report" options={{ title: "Reporte de Ciclo" }} />
      <Stack.Screen name="generate-html" options={{ title: "Generar HTML" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <SettingsProvider>
          <ServicesProvider>
            <RecurringClientsProvider>
              <RecurringServicesProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </RecurringServicesProvider>
            </RecurringClientsProvider>
          </ServicesProvider>
        </SettingsProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}