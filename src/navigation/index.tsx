// src/navigation/index.tsx
// ─────────────────────────────────────────
// Camis FIT — Navigation
// Stack (Auth) → Tab (Instrutor ou Aluno)
// ─────────────────────────────────────────
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography } from '../theme';
import { useStore } from '../services/store';

// Auth screens
import {
  WelcomeScreen, LoginInstrutorScreen, CadastroInstrutorScreen,
  LoginAlunoScreen, CadastroAlunoScreen,
} from '../screens/auth/AuthScreens';

// Instrutor screens
import {
  InstrutorHomeScreen, AlunosScreen,
  TreinosInstrutorScreen, FaturasInstrutorScreen, PerfilInstrutorScreen,
} from '../screens/instrutor/InstrutorScreens';

// Aluno screens
import {
  AlunoHomeScreen, TreinoAlunoScreen, CamilaScreen,
  FaturasAlunoScreen, EvolucaoAlunoScreen, PerfilAlunoScreen,
} from '../screens/aluno/AlunoScreens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = { headerShown: false };

// ── Auth Stack ─────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="LoginInstrutor" component={LoginInstrutorScreen} />
    <Stack.Screen name="CadastroInstrutor" component={CadastroInstrutorScreen} />
    <Stack.Screen name="LoginAluno" component={LoginAlunoScreen} />
    <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} />
  </Stack.Navigator>
);

// ── Tab Bar Icon ───────────────────────
const TabIcon = ({ icon, label, focused }: { icon: string; label: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', gap: 3 }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
    <Text style={{ fontSize: 9, fontWeight: Typography.weights.bold, letterSpacing: 0.5, textTransform: 'uppercase', color: focused ? Colors.neon : Colors.textFaint }}>
      {label}
    </Text>
  </View>
);

const tabBarStyle = {
  backgroundColor: Colors.card,
  borderTopColor: Colors.border,
  borderTopWidth: 1,
  height: Platform.OS === 'ios' ? 84 : 64,
  paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  paddingTop: 8,
};

// ── Instrutor Tabs ─────────────────────
const InstrutorStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="InstrutorHome" component={InstrutorHomeScreen} />
    <Stack.Screen name="DetalheAluno" component={AlunosScreen} />
  </Stack.Navigator>
);

const InstrutorTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}
  >
    <Tab.Screen
      name="Painel"
      component={InstrutorStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Painel" focused={focused} /> }}
    />
    <Tab.Screen
      name="Alunos"
      component={AlunosScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Alunos" focused={focused} /> }}
    />
    <Tab.Screen
      name="Treinos"
      component={TreinosInstrutorScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏋️" label="Treinos" focused={focused} /> }}
    />
    <Tab.Screen
      name="Faturas"
      component={FaturasInstrutorScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💳" label="Faturas" focused={focused} /> }}
    />
    <Tab.Screen
      name="Conta"
      component={PerfilInstrutorScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Conta" focused={focused} /> }}
    />
  </Tab.Navigator>
);

// ── Aluno Tabs ─────────────────────────
const AlunoStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AlunoHomeMain" component={AlunoHomeScreen} />
    <Stack.Screen name="TreinoAluno" component={TreinoAlunoScreen} />
    <Stack.Screen name="FaturasAluno" component={FaturasAlunoScreen} />
  </Stack.Navigator>
);

const AlunoTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}
  >
    <Tab.Screen
      name="Home"
      component={AlunoStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }}
    />
    <Tab.Screen
      name="TreinoTab"
      component={TreinoAlunoScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏋️" label="Treino" focused={focused} /> }}
    />
    <Tab.Screen
      name="Camila"
      component={CamilaScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✨" label="Camila" focused={focused} /> }}
    />
    <Tab.Screen
      name="Evolucao"
      component={EvolucaoAlunoScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📈" label="Evolução" focused={focused} /> }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilAlunoScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Perfil" focused={focused} /> }}
    />
  </Tab.Navigator>
);

// ── Root Navigator ─────────────────────
export const RootNavigator = () => {
  const { isAuthenticated, user } = useStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'instrutor' ? (
        <InstrutorTabs />
      ) : (
        <AlunoTabs />
      )}
    </NavigationContainer>
  );
};
