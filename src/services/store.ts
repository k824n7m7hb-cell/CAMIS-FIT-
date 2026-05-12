// src/services/store.ts
// Estado global do CamisFIT (Zustand)
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../constants';

// ── Types ──────────────────────────────
export type UserRole = 'instrutor' | 'aluno';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  // Instrutor
  cref?: string;
  pixChave?: string;
  codigoConvite?: string;
  // Aluno
  instrutorId?: string;
  instrutorNome?: string;
  nivel?: number;
  xp?: number;
  peso?: number;
  altura?: number;
  objetivo?: string;
  avatarInitials?: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  instrutorId: string;
  objetivo: string;
  nivel: string;
  peso: number;
  pesoInicial: number;
  gordura: number;
  statusPagamento: 'pago' | 'pendente' | 'vencido';
  proximoVencimento: string;
  treinos: number;
  ativo: boolean;
}

export interface Exercicio {
  id: string;
  nome: string;
  series: string;
  repeticoes: string;
  descanso: string;
  observacao?: string;
  grupoMuscular: string;
}

export interface FichaTreino {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  exercicios: Exercicio[];
  duracao: number;
  instrutorId: string;
  alunosVinculados: string[];
  criadoEm: string;
}

export interface Fatura {
  id: string;
  alunoId: string;
  alunoNome: string;
  instrutorId: string;
  tipo: 'mensalidade' | 'alteracao_treino' | 'atualizacao_dieta' | 'personalizado';
  descricao: string;
  valor: number;
  status: 'pago' | 'pendente' | 'vencido';
  vencimento: string;
  pagoEm?: string;
  criadoEm: string;
}

export interface Mensagem {
  id: string;
  conteudo: string;
  remetente: 'camila' | 'usuario';
  timestamp: Date;
}

export interface EvolucaoEntry {
  data: string;
  peso: number;
  gordura: number;
}

const mensagemBoasVindas: Mensagem = {
  id: 'm0',
  remetente: 'camila',
  timestamp: new Date(),
  conteudo:
    'Oi! Eu sou a Camila, sua coach de fitness e nutrição do Camis FIT! 💪 Estou aqui para te ajudar a alcançar seus objetivos. Como posso te ajudar hoje?',
};

// ── Store ──────────────────────────────
interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Instrutor data
  alunos: Aluno[];
  fichasTreino: FichaTreino[];
  faturas: Fatura[];

  // Aluno data
  treinos: FichaTreino[];
  minhasFaturas: Fatura[];
  evolucao: EvolucaoEntry[];

  // Chat Camila
  mensagens: Mensagem[];

  // Actions — Auth
  setUser: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Actions — Instrutor
  setAlunos: (alunos: Aluno[]) => void;
  addAluno: (aluno: Aluno) => void;
  updateAluno: (id: string, data: Partial<Aluno>) => void;
  bloquearAluno: (alunoId: string) => void;

  setFichasTreino: (fichas: FichaTreino[]) => void;
  addFicha: (ficha: FichaTreino) => void;
  updateFicha: (id: string, data: Partial<FichaTreino>) => void;
  deleteFicha: (id: string) => void;

  setFaturas: (faturas: Fatura[]) => void;
  addFatura: (fatura: Fatura) => void;
  marcarPago: (faturaId: string) => void;

  // Actions — Aluno
  setTreinos: (treinos: FichaTreino[]) => void;
  setMinhasFaturas: (faturas: Fatura[]) => void;
  setEvolucao: (evolucao: EvolucaoEntry[]) => void;
  addEvolucao: (entry: EvolucaoEntry) => void;

  // Actions — Chat
  addMensagem: (msg: Mensagem) => void;
  clearMensagens: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  alunos: [],
  fichasTreino: [],
  faturas: [],

  treinos: [],
  minhasFaturas: [],
  evolucao: [],

  mensagens: [mensagemBoasVindas],

  setUser: (user, token) => set({ user, token, isAuthenticated: true }),

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      alunos: [],
      fichasTreino: [],
      faturas: [],
      treinos: [],
      minhasFaturas: [],
      evolucao: [],
      mensagens: [{ ...mensagemBoasVindas, timestamp: new Date() }],
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setAlunos: (alunos) => set({ alunos }),
  addAluno: (aluno) => set((s) => ({ alunos: [...s.alunos, aluno] })),
  updateAluno: (id, data) =>
    set((s) => ({ alunos: s.alunos.map((a) => (a.id === id ? { ...a, ...data } : a)) })),
  bloquearAluno: (alunoId) =>
    set((s) => ({ alunos: s.alunos.map((a) => (a.id === alunoId ? { ...a, ativo: false } : a)) })),

  setFichasTreino: (fichasTreino) => set({ fichasTreino }),
  addFicha: (ficha) => set((s) => ({ fichasTreino: [...s.fichasTreino, ficha] })),
  updateFicha: (id, data) =>
    set((s) => ({
      fichasTreino: s.fichasTreino.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),
  deleteFicha: (id) =>
    set((s) => ({ fichasTreino: s.fichasTreino.filter((f) => f.id !== id) })),

  setFaturas: (faturas) => set({ faturas }),
  addFatura: (fatura) => set((s) => ({ faturas: [...s.faturas, fatura] })),
  marcarPago: (faturaId) =>
    set((s) => ({
      faturas: s.faturas.map((f) =>
        f.id === faturaId ? { ...f, status: 'pago', pagoEm: new Date().toISOString() } : f,
      ),
    })),

  setTreinos: (treinos) => set({ treinos }),
  setMinhasFaturas: (minhasFaturas) => set({ minhasFaturas }),
  setEvolucao: (evolucao) => set({ evolucao }),
  addEvolucao: (entry) => set((s) => ({ evolucao: [...s.evolucao, entry] })),

  addMensagem: (msg) => set((s) => ({ mensagens: [...s.mensagens, msg] })),
  clearMensagens: () =>
    set({ mensagens: [{ ...mensagemBoasVindas, timestamp: new Date() }] }),
}));
