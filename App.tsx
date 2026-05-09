// App.tsx
// Camis FIT — Entry Point (Expo 51)
import React, { useEffect, useRef } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Colors } from './src/theme';
import { RootNavigator } from './src/navigation';
import { useStore } from './src/services/store';
import { authAPI, notificacoesAPI } from './src/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const { isAuthenticated, setUser } = useStore();
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    restoreAuth();
    setupNotifications();
  }, []);

  // Envia push token ao backend assim que o usuário se autenticar
  useEffect(() => {
    if (isAuthenticated && pushTokenRef.current) {
      notificacoesAPI.registrarToken(pushTokenRef.current).catch(() => {});
    }
  }, [isAuthenticated]);

  const restoreAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('camisfit_token');
      if (!token) return;

      const res = await authAPI.me();
      const { user: u } = res.data;

      if (u.role === 'instrutor') {
        setUser({
          id: u.id, nome: u.nome, email: u.email, role: 'instrutor',
          cref: u.cref, codigoConvite: u.codigo_convite,
          avatarInitials: u.nome.slice(0, 2).toUpperCase(),
        }, token);
      } else {
        setUser({
          id: u.id, nome: u.nome, email: u.email, role: 'aluno',
          instrutorId: u.instrutor_id, instrutorNome: u.instrutor_nome,
          nivel: u.nivel_gamif, xp: u.xp,
          peso: u.peso, altura: u.altura, objetivo: u.objetivo,
          avatarInitials: u.avatar_initials,
        }, token);
      }
    } catch {
      await SecureStore.deleteItemAsync('camisfit_token').catch(() => {});
    }
  };

  const setupNotifications = async () => {
    try {
      // Canal Android (obrigatório Android 8.0+)
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

      // projectId do EAS (necessário em produção)
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      ).catch(() => null);

      if (tokenData) {
        pushTokenRef.current = tokenData.data;
      }
    } catch (e) {
      console.log('Notifications setup error:', e);
    }
  };

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
