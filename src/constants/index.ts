// src/constants/index.ts
// Constantes globais do CamisFIT — evita magic strings espalhadas pelo código

export const TOKEN_KEY = 'camisfit_token';

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://camis-fit.vercel.app/api';

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const APP_VERSION = '1.0.0';

export const OBJETIVOS = [
  'Hipertrofia',
  'Emagrecimento',
  'Definição',
  'Manutenção',
  'Saúde geral',
] as const;
export type Objetivo = (typeof OBJETIVOS)[number];

export const NIVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const TIPOS_FATURA = [
  'mensalidade',
  'alteracao_treino',
  'atualizacao_dieta',
  'personalizado',
] as const;
export type TipoFatura = (typeof TIPOS_FATURA)[number];

export const METODOS_PAGAMENTO = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

// Preparação para integração de pagamentos (Stripe / Iugu / Asaas)
export const PAYMENT_CONFIG = {
  currency: 'BRL',
  provider: 'stripe', // trocar conforme o provider escolhido
  webhookPath: '/api/payments/webhook',
} as const;
