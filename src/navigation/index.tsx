// src/navigation/index.tsx
// CamisFIT - Navegacao principal
// Stack (Auth) -> Tabs (Instrutor ou Aluno)
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Typography } from '../theme';
import { useStore } from '../services/store';
import type {
  AuthStackParamList,
  InstrutorStackParamList,
  InstrutorTabParamList,
  AlunoStackParamList,
  AlunoTabParamList,
} from '../types/navigation';

import {
  WelcomeScreen,
  LoginInstrutorScreen,
  CadastroInstrutorScreen,
  LoginAlunoScreen,
  CadastroAlunoScreen,
} from '../screens/auth/AuthScreens';

import {
  InstrutorHomeScreen,
  AlunosScreen,
  TreinosInstrutorScreen,
  FaturasInstrutorScreen,
  PerfilInstrutorScreen,
} from '../screens/instrutor/InstrutorScreens';

import {
  AlunoHomeScreen,
  TreinoAlunoScreen,
  CamilaScreen,
  FaturasAlunoScreen,
  EvolucaoAlunoScreen,
  PerfilAlunoScreen,
} from '../screens/aluno/AlunoScreens';

const AuthStack = createStackNavigator<AuthStackParamList>();
const InstrutorStack = createStackNavigator<InstrutorStackParamList>();
const InstrutorTab = createBottomTabNavigator<InstrutorTabParamList>();
const AlunoStack = createStackNavigator<AlunoStackParamList>();
const AlunoTab = createBottomTabNavigator<AlunoTabParamList>();

const screenOptions = { headerShown: false };

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={screenOptions}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="LoginInstrutor" component={LoginInstrutorScreen} />
    <AuthStack.Screen name="CadastroInstrutor" component={CadastroInstrutorScreen} />
    <AuthStack.Screen name="LoginAluno" component={LoginAlunoScreen} />
    <AuthStack.Screen name="CadastroAluno" component={CadastroAlunoScreen} />
  </AuthStack.Navigator>
);

const TabIcon = ({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) => (
  <View style={{ alignItems: 'center', gap: 3 }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
    <Text
      style={{
        fontSize: 9,
        fontWeight: Typography.weights.bold,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: focused ? Colors.neon : Colors.textFaint,
      }}
    >
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

const InstrutorPainelStack = () => (
  <InstrutorStack.Navigator screenOptions={screenOptions}>
    <InstrutorStack.Screen name="InstrutorHome" component={InstrutorHomeScreen as any} />
    <InstrutorStack.Screen name="DetalheAluno" component={AlunosScreen as any} />
  </InstrutorStack.Navigator>
);

const InstrutorNavigator = () => (
  <InstrutorTab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}
  >
    <InstrutorTab.Screen
      name="Painel"
      component={InstrutorPainelStack as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Painel" focused={focused} /> }}
    />
    <InstrutorTab.Screen
      name="Alunos"
      component={AlunosScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Alunos" focused={focused} /> }}
    />
    <InstrutorTab.Screen
      name="Treinos"
      component={TreinosInstrutorScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏋️" label="Treinos" focused={focused} /> }}
    />
    <InstrutorTab.Screen
      name="Faturas"
      component={FaturasInstrutorScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💳" label="Faturas" focused={focused} /> }}
    />
    <InstrutorTab.Screen
      name="Conta"
      component={PerfilInstrutorScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Conta" focused={focused} /> }}
    />
  </InstrutorTab.Navigator>
);

const AlunoHomeStack = () => (
  <AlunoStack.Navigator screenOptions={screenOptions}>
    <AlunoStack.Screen name="AlunoHomeMain" component={AlunoHomeScreen as any} />
    <AlunoStack.Screen name="TreinoAluno" component={TreinoAlunoScreen as any} />
    <AlunoStack.Screen name="FaturasAluno" component={FaturasAlunoScreen as any} />
  </AlunoStack.Navigator>
);

const AlunoNavigator = () => (
  <AlunoTab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}
  >
    <AlunoTab.Screen
      name="Home"
      component={AlunoHomeStack as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} /> }}
    />
    <AlunoTab.Screen
      name="TreinoTab"
      component={TreinoAlunoScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏋️" label="Treino" focused={focused} /> }}
    />
    <AlunoTab.Screen
      name="Camila"
      component={CamilaScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✨" label="Camila" focused={focused} /> }}
    />
    <AlunoTab.Screen
      name="Evolucao"
      component={EvolucaoAlunoScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📈" label="Evolução" focused={focused} /> }}
    />
    <AlunoTab.Screen
      name="Perfil"
      component={PerfilAlunoScreen as any}
      options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Perfil" focused={focused} /> }}
    />
  </AlunoTab.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated, user } = useStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'instrutor' ? (
        <InstrutorNavigator />
      ) : (
        <AlunoNavigator />
      )}
    </NavigationContainer>
  );
};
