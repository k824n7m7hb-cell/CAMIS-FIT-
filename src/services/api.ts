// src/services/api.ts
// ─────────────────────────────────────────
// Camis FIT — API Service
// Configure BASE_URL to your backend
// ─────────────────────────────────────────
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Config ─────────────────────────────
// Replace with your backend URL:
export const BASE_URL = 'https://camis-fit.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('camisfit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh / logout on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('camisfit_token');
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────
export const authAPI = {
  loginInstrutor: (email: string, senha: string) =>
    api.post('/auth/instrutor/login', { email, senha }),

  loginAluno: (email: string, senha: string) =>
    api.post('/auth/aluno/login', { email, senha }),

  cadastroInstrutor: (data: {
    nome: string; email: string; senha: string;
    cref: string; telefone?: string;
  }) => api.post('/auth/instrutor/cadastro', data),

  cadastroAluno: (data: {
    nome: string; email: string; senha: string;
    codigoInstrutor: string; peso?: number; altura?: number; objetivo?: string;
  }) => {
    const { codigoInstrutor, ...rest } = data;
    return api.post('/auth/aluno/cadastro', { ...rest, codigo_instrutor: codigoInstrutor });
  },

  validarCodigo: (codigo: string) =>
    api.post('/auth/validar-codigo', { codigo }),

  verificarEmailInstrutor: (email: string, codigo: string) =>
    api.post('/auth/instrutor/verificar-email', { email, codigo }),

  reenviarCodigoInstrutor: (email: string) =>
    api.post('/auth/instrutor/reenviar-codigo', { email }),

  esqueciSenha: (email: string) =>
    api.post('/auth/esqueci-senha', { email }),

  me: () =>
    api.get('/auth/me'),
};

// ── Instrutor ──────────────────────────
export const instrutorAPI = {
  getAlunos: () =>
    api.get('/instrutor/alunos'),

  getAluno: (id: string) =>
    api.get(`/instrutor/alunos/${id}`),

  liberarAluno: (email: string) =>
    api.post('/instrutor/alunos/liberar', { email }),

  bloquearAluno: (alunoId: string) =>
    api.patch(`/instrutor/alunos/${alunoId}/bloquear`),

  gerarCodigo: () =>
    api.post('/instrutor/codigo/gerar'),

  // Fichas de treino
  getFichas: () =>
    api.get('/instrutor/fichas'),

  criarFicha: (data: any) =>
    api.post('/instrutor/fichas', data),

  atualizarFicha: (id: string, data: any) =>
    api.put(`/instrutor/fichas/${id}`, data),

  deletarFicha: (id: string) =>
    api.delete(`/instrutor/fichas/${id}`),

  enviarFichaParaAluno: (fichaId: string, alunoId: string) =>
    api.post(`/instrutor/fichas/${fichaId}/enviar`, { alunoId }),

  // Exercícios
  getExercicios: () =>
    api.get('/instrutor/exercicios'),

  criarExercicio: (data: any) =>
    api.post('/instrutor/exercicios', data),

  // Financeiro
  getFaturas: () =>
    api.get('/instrutor/faturas'),

  criarFatura: (data: {
    alunoId: string; tipo: string; descricao: string;
    valor: number; vencimento: string;
  }) => api.post('/instrutor/faturas', data),

  marcarPago: (faturaId: string) =>
    api.patch(`/instrutor/faturas/${faturaId}/pago`),

  getResumoFinanceiro: () =>
    api.get('/instrutor/financeiro/resumo'),
};

// ── Aluno ──────────────────────────────
export const alunoAPI = {
  getMeuPerfil: () =>
    api.get('/aluno/perfil'),

  atualizarPerfil: (data: any) =>
    api.put('/aluno/perfil', data),

  getMeusTreinos: () =>
    api.get('/aluno/treinos'),

  registrarEvolucao: (data: {
    peso: number; gordura?: number; observacao?: string;
  }) => api.post('/aluno/evolucao', data),

  getEvolucao: () =>
    api.get('/aluno/evolucao'),

  getMinhasFaturas: () =>
    api.get('/aluno/faturas'),

  pagarFatura: (faturaId: string, metodoPagamento: string) =>
    api.post(`/aluno/faturas/${faturaId}/pagar`, { metodoPagamento }),

  vincularInstrutor: (codigo: string) =>
    api.post('/aluno/vincular-instrutor', { codigo }),
};

// ── Camila IA ──────────────────────────
export const camilaAPI = {
  chat: (mensagem: string, contexto?: {
    nome?: string; peso?: number; objetivo?: string;
    treino?: string; historico?: string[];
  }) => api.post('/ia/camila/chat', { mensagem, contexto }),

  gerarTreinoIA: (dados: {
    nivel: string; objetivo: string; diasSemana: number;
    gruposMusculares?: string[]; equipamentos?: string[];
  }) => api.post('/ia/treino/gerar', dados),

  gerarDietaIA: (dados: {
    peso: number; altura: number; objetivo: string;
    rotina: string; orcamento: string; restricoes?: string[];
  }) => api.post('/ia/dieta/gerar', dados),

  scannerAlimento: (imagemBase64: string) =>
    api.post('/ia/scanner/alimento', { imagem: imagemBase64 }),
};

// ── Notificações ───────────────────────
export const notificacoesAPI = {
  registrarToken: (expoPushToken: string) =>
    api.post('/notificacoes/token', { token: expoPushToken }),

  getNotificacoes: () =>
    api.get('/notificacoes'),

  marcarLida: (id: string) =>
    api.patch(`/notificacoes/${id}/lida`),
};

export default api;
