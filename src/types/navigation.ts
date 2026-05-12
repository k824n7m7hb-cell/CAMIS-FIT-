// src/types/navigation.ts
// Tipos de navegação do CamisFIT — elimina 'any' nos props de screen

import type { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

// ── Auth Stack ───────────────────────────
export type AuthStackParamList = {
  Welcome: undefined;
  LoginInstrutor: undefined;
  CadastroInstrutor: { emailPendente?: string } | undefined;
  LoginAluno: undefined;
  CadastroAluno: undefined;
};

// ── Instrutor ────────────────────────────
export type InstrutorStackParamList = {
  InstrutorHome: undefined;
  DetalheAluno: { alunoId: string; alunoNome?: string };
};

export type InstrutorTabParamList = {
  Painel: undefined;
  Alunos: undefined;
  Treinos: undefined;
  Faturas: undefined;
  Conta: undefined;
};

// ── Aluno ────────────────────────────────
export type AlunoStackParamList = {
  AlunoHomeMain: undefined;
  TreinoAluno: undefined;
  FaturasAluno: undefined;
};

export type AlunoTabParamList = {
  Home: undefined;
  TreinoTab: undefined;
  Camila: undefined;
  Evolucao: undefined;
  Perfil: undefined;
};

// ── Prop helpers ─────────────────────────
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type AlunoScreenProps<T extends keyof AlunoStackParamList> =
  StackScreenProps<AlunoStackParamList, T>;

export type InstrutorScreenProps<T extends keyof InstrutorStackParamList> =
  StackScreenProps<InstrutorStackParamList, T>;

// Nav props (para screens que só precisam de navigation, sem route)
export type AuthNavProp = StackNavigationProp<AuthStackParamList>;
export type AlunoNavProp = CompositeNavigationProp<
  StackNavigationProp<AlunoStackParamList>,
  BottomTabNavigationProp<AlunoTabParamList>
>;
export type InstrutorNavProp = CompositeNavigationProp<
  StackNavigationProp<InstrutorStackParamList>,
  BottomTabNavigationProp<InstrutorTabParamList>
>;
