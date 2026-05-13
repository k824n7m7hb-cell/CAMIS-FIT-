// src/services/api.ts
// Cliente Axios do CamisFIT — interceptadores de auth e retry automático
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, TOKEN_KEY } from '../constants';
import { useStore } from './store';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa token Bearer automaticamente
api.interceptors.request.use(async (config) => {
  const token = useStore.getState().token || (await SecureStore.getItemAsync(TOKEN_KEY));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Remove token local em 401 (sessão expirada)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    }
    return Promise.reject(err);
  },
);

// ── Auth ───────────────────────────────
export const authAPI = {
  loginInstrutor: (email: string, senha: string) =>
    api.post('/auth/instrutor/login', { email, senha }),

  loginAluno: (email: string, senha: string) =>
    api.post('/auth/aluno/login', { email, senha }),

  cadastroInstrutor: (data: {
    nome: string;
    email: string;
    senha: string;
    cref: string;
    telefone?: string;
  }) => api.post('/auth/instrutor/cadastro', data),

  cadastroAluno: (data: {
    nome: string;
    email: string;
    senha: string;
    codigoInstrutor: string;
    peso?: number;
    altura?: number;
    objetivo?: string;
  }) => {
    const { codigoInstrutor, ...rest } = data;
    const nome = rest.nome?.trim();
    const email = rest.email?.trim().toLowerCase();
    const senha = rest.senha;
    const codigo = codigoInstrutor?.trim().toUpperCase();

    return api.post('/auth/aluno/cadastro', {
      ...rest,
      nome,
      email,
      senha,
      codigo_instrutor: codigo,
      codigoInstrutor: codigo,
    });
  },

  validarCodigo: (codigo: string) =>
    api.post('/auth/validar-codigo', { codigo }),

  verificarEmailInstrutor: (email: string, codigo: string) =>
    api.post('/auth/instrutor/verificar-email', { email, codigo }),

  reenviarCodigoInstrutor: (email: string) =>
    api.post('/auth/instrutor/reenviar-codigo', { email }),

  esqueciSenha: (email: string) =>
    api.post('/auth/esqueci-senha', { email }),

  me: () => api.get('/auth/me'),
};

// ── Instrutor ──────────────────────────
export const instrutorAPI = {
  getAlunos: () => api.get('/instrutor/alunos'),
  getAluno: (id: string) => api.get(`/instrutor/alunos/${id}`),
  liberarAluno: (email: string) => api.post('/instrutor/alunos/liberar', { email }),
  bloquearAluno: (alunoId: string) => api.patch(`/instrutor/alunos/${alunoId}/bloquear`),
  desbloquearAluno: (alunoId: string) => api.patch(`/instrutor/alunos/${alunoId}/desbloquear`),
  gerarCodigo: () => api.post('/instrutor/codigo/gerar'),

  getFichas: () => api.get('/instrutor/fichas'),
  criarFicha: (data: unknown) => api.post('/instrutor/fichas', data),
  atualizarFicha: (id: string, data: unknown) => api.put(`/instrutor/fichas/${id}`, data),
  deletarFicha: (id: string) => api.delete(`/instrutor/fichas/${id}`),
  enviarFichaParaAluno: (fichaId: string, alunoId: string) =>
    api.post(`/instrutor/fichas/${fichaId}/enviar`, { alunoId }),

  getFaturas: () => api.get('/instrutor/faturas'),
  criarFatura: (data: {
    alunoId: string;
    tipo: string;
    descricao: string;
    valor: number;
    vencimento: string;
  }) => api.post('/instrutor/faturas', {
    aluno_id: data.alunoId,
    tipo: data.tipo,
    descricao: data.descricao,
    valor: data.valor,
    vencimento: data.vencimento,
  }),
  marcarPago: (faturaId: string) => api.patch(`/instrutor/faturas/${faturaId}/pago`),
  getResumoFinanceiro: () => api.get('/instrutor/financeiro/resumo'),

  getPerfil: () => api.get('/instrutor/perfil'),
  atualizarPerfil: (data: unknown) => api.put('/instrutor/perfil', data),
};

// ── Aluno ──────────────────────────────
export const alunoAPI = {
  getMeuPerfil: () => api.get('/aluno/perfil'),
  atualizarPerfil: (data: unknown) => api.put('/aluno/perfil', data),
  getMeusTreinos: () => api.get('/aluno/treinos'),
  iniciarTreino: (fichaId: string) => api.post(`/aluno/treinos/${fichaId}/iniciar`),
  finalizarTreino: (fichaId: string) => api.post(`/aluno/treinos/${fichaId}/finalizar`),
  registrarEvolucao: (data: { peso: number; gordura?: number; observacao?: string }) =>
    api.post('/aluno/evolucao', data),
  getEvolucao: () => api.get('/aluno/evolucao'),
  getMinhasFaturas: () => api.get('/aluno/faturas'),
  pagarFatura: (faturaId: string, metodoPagamento: string) =>
    api.post(`/aluno/faturas/${faturaId}/pagar`, { metodo_pagamento: metodoPagamento }),
  vincularInstrutor: (codigo: string) =>
    api.post('/aluno/vincular-instrutor', { codigo }),
};

// ── Camila IA ──────────────────────────
export const camilaAPI = {
  chat: (
    mensagem: string,
    contexto?: {
      nome?: string;
      peso?: number;
      objetivo?: string;
      treino?: string;
      historico?: string[];
    },
  ) => api.post('/ia/camila/chat', { mensagem, contexto }),

  gerarTreinoIA: (dados: {
    nivel: string;
    objetivo: string;
    diasSemana: number;
    gruposMusculares?: string[];
    equipamentos?: string[];
  }) => api.post('/ia/treino/gerar', dados),

  gerarDietaIA: (dados: {
    peso: number;
    altura: number;
    objetivo: string;
    rotina: string;
    orcamento: string;
    restricoes?: string[];
  }) => api.post('/ia/dieta/gerar', dados),

  scannerAlimento: (imagemBase64: string) =>
    api.post('/ia/scanner/alimento', { imagem: imagemBase64 }),
};

// ── Notificações ───────────────────────
export const notificacoesAPI = {
  registrarToken: (expoPushToken: string) =>
    api.post('/notificacoes/token', { token: expoPushToken }),
  getNotificacoes: () => api.get('/notificacoes'),
  marcarLida: (id: string) => api.patch(`/notificacoes/${id}/lida`),
};

export default api;
