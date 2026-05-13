// App.tsx
// Camis FIT — Entry Point (Expo 54)
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, Platform, View, ActivityIndicator, Text, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Colors } from './src/theme';
import { RootNavigator } from './src/navigation';
import { useAuth } from './src/hooks/useAuth';
import { notificacoesAPI } from './src/services/api';

const normalizeAlertValue = (value: unknown) => {
  if (typeof value === 'string' || value == null) return value as any;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const originalAlert = Alert.alert.bind(Alert);
Alert.alert = ((title?: any, message?: any, buttons?: any, options?: any) =>
  originalAlert(
    normalizeAlertValue(title),
    normalizeAlertValue(message),
    buttons,
    options,
  )) as typeof Alert.alert;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const { isAuthenticated, restoreSession } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const pushTokenRef = useRef<string | null>(null);

  console.log('[APP] render', { isReady, isAuthenticated });

  useEffect(() => {
    const init = async () => {
      console.log('[APP] init:start');
      await restoreSession();
      console.log('[APP] init:restoreSession:done');
      setIsReady(true);
      console.log('[APP] init:setIsReady:true');
    };
    init();
    setupNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated && pushTokenRef.current) {
      notificacoesAPI.registrarToken(pushTokenRef.current).catch(() => {});
    }
  }, [isAuthenticated]);

  const setupNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'CamisFIT',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00ff87',
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      ).catch(() => null);

      if (tokenData) {
        pushTokenRef.current = tokenData.data;
      }
    } catch {
      // Notificações não críticas — falha silenciosa
    }
  };

  // Splash enquanto restaura sessão — evita flash da tela de auth
  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -1 }}>
          CAMIS<Text style={{ color: Colors.neon }}>FIT</Text>
        </Text>
        <ActivityIndicator color={Colors.neon} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
