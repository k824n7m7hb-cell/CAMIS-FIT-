// src/services/store.ts
// ─────────────────────────────────────────
// Camis FIT — Global State (Zustand)
// ─────────────────────────────────────────
import { create } from 'zustand';

// ── Types ──────────────────────────────
export type UserRole = 'instrutor' | 'aluno';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  cref?: string;            // instrutor only
  codigoConvite?: string;   // instrutor only
  instrutorId?: string;     // aluno only
  instrutorNome?: string;   // aluno only
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

// ── Store ──────────────────────────────
interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Instrutor data
  alunos: Aluno[];
  fichasTreino: FichaTreino[];
  faturas: Fatura[];

  // Aluno data
  treinos: FichaTreino[];
  minhasFaturas: Fatura[];
  evolucao: { data: string; peso: number; gordura: number }[];

  // Chat Camila
  mensagens: Mensagem[];

  // Actions — Auth
  setUser: (user: User, token: string) => void;
  logout: () => void;

  // Actions — Instrutor
  addAluno: (aluno: Aluno) => void;
  updateAluno: (id: string, data: Partial<Aluno>) => void;
  addFicha: (ficha: FichaTreino) => void;
  updateFicha: (id: string, data: Partial<FichaTreino>) => void;
  deleteFicha: (id: string) => void;
  addFatura: (fatura: Fatura) => void;
  marcarPago: (faturaId: string) => void;
  bloquearAluno: (alunoId: string) => void;

  // Actions — Aluno
  addEvolucao: (entry: { data: string; peso: number; gordura: number }) => void;
  addMensagem: (msg: Mensagem) => void;
  clearMensagens: () => void;
}

// ── Mock seed data ──────────────────────
const mockAlunos: Aluno[] = [
  {
    id: 'a1', nome: 'Rafael Silva', email: 'rafael@email.com',
    instrutorId: 'i1', objetivo: 'Hipertrofia', nivel: 'Intermediário',
    peso: 78, pesoInicial: 80.4, gordura: 14, statusPagamento: 'pago',
    proximoVencimento: '2025-06-10', treinos: 47, ativo: true,
  },
  {
    id: 'a2', nome: 'Marina Costa', email: 'marina@email.com',
    instrutorId: 'i1', objetivo: 'Emagrecimento', nivel: 'Iniciante',
    peso: 65, pesoInicial: 70, gordura: 22, statusPagamento: 'pendente',
    proximoVencimento: '2025-05-10', treinos: 28, ativo: true,
  },
  {
    id: 'a3', nome: 'Lucas Alves', email: 'lucas@email.com',
    instrutorId: 'i1', objetivo: 'Definição', nivel: 'Avançado',
    peso: 82, pesoInicial: 85, gordura: 11, statusPagamento: 'vencido',
    proximoVencimento: '2025-05-03', treinos: 91, ativo: false,
  },
];

const mockFichas: FichaTreino[] = [
  {
    id: 'f1', titulo: 'Hipertrofia A — Peito + Tríceps',
    descricao: 'Foco em força e volume no peito', nivel: 'Intermediário',
    duracao: 55, instrutorId: 'i1', alunosVinculados: ['a1'],
    criadoEm: '2025-04-01',
    exercicios: [
      { id: 'e1', nome: 'Supino Reto', series: '4', repeticoes: '10', descanso: '90s', grupoMuscular: 'Peito', observacao: 'Desça até o peito' },
      { id: 'e2', nome: 'Crucifixo', series: '3', repeticoes: '12', descanso: '60s', grupoMuscular: 'Peito' },
      { id: 'e3', nome: 'Supino Inclinado', series: '3', repeticoes: '10', descanso: '90s', grupoMuscular: 'Peito' },
      { id: 'e4', nome: 'Tríceps Corda', series: '3', repeticoes: '15', descanso: '60s', grupoMuscular: 'Tríceps' },
      { id: 'e5', nome: 'Tríceps Francês', series: '3', repeticoes: '12', descanso: '60s', grupoMuscular: 'Tríceps' },
      { id: 'e6', nome: 'Mergulho no banco', series: '3', repeticoes: '15', descanso: '60s', grupoMuscular: 'Tríceps' },
    ],
  },
  {
    id: 'f2', titulo: 'Emagrecimento B — Pernas + Glúteos',
    descricao: 'Circuito de alta intensidade', nivel: 'Iniciante',
    duracao: 45, instrutorId: 'i1', alunosVinculados: ['a2'],
    criadoEm: '2025-04-05',
    exercicios: [
      { id: 'e7', nome: 'Agachamento Livre', series: '4', repeticoes: '15', descanso: '60s', grupoMuscular: 'Pernas' },
      { id: 'e8', nome: 'Avanço Alternado', series: '3', repeticoes: '12', descanso: '60s', grupoMuscular: 'Pernas' },
      { id: 'e9', nome: 'Leg Press 45°', series: '4', repeticoes: '12', descanso: '90s', grupoMuscular: 'Pernas' },
      { id: 'e10', nome: 'Elevação Pélvica', series: '4', repeticoes: '15', descanso: '45s', grupoMuscular: 'Glúteos' },
      { id: 'e11', nome: 'Cadeira Abdutora', series: '3', repeticoes: '15', descanso: '45s', grupoMuscular: 'Glúteos' },
    ],
  },
];

const mockFaturas: Fatura[] = [
  { id: 'fat1', alunoId: 'a1', alunoNome: 'Rafael Silva', instrutorId: 'i1', tipo: 'mensalidade', descricao: 'Mensalidade Maio/2025', valor: 180, status: 'pago', vencimento: '2025-05-10', pagoEm: '2025-05-02', criadoEm: '2025-05-01' },
  { id: 'fat2', alunoId: 'a2', alunoNome: 'Marina Costa', instrutorId: 'i1', tipo: 'mensalidade', descricao: 'Mensalidade Maio/2025', valor: 180, status: 'pendente', vencimento: '2025-05-10', criadoEm: '2025-05-01' },
  { id: 'fat3', alunoId: 'a3', alunoNome: 'Lucas Alves', instrutorId: 'i1', tipo: 'alteracao_treino', descricao: 'Alteração de treino', valor: 50, status: 'vencido', vencimento: '2025-05-03', criadoEm: '2025-04-28' },
  { id: 'fat4', alunoId: 'a1', alunoNome: 'Rafael Silva', instrutorId: 'i1', tipo: 'atualizacao_dieta', descricao: 'Atualização de dieta', valor: 30, status: 'pago', vencimento: '2025-05-05', pagoEm: '2025-05-02', criadoEm: '2025-05-01' },
  { id: 'fat5', alunoId: 'a1', alunoNome: 'Rafael Silva', instrutorId: 'i1', tipo: 'mensalidade', descricao: 'Mensalidade Abril/2025', valor: 180, status: 'pago', vencimento: '2025-04-10', pagoEm: '2025-04-08', criadoEm: '2025-04-01' },
];

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  alunos: mockAlunos,
  fichasTreino: mockFichas,
  faturas: mockFaturas,

  treinos: mockFichas,
  minhasFaturas: mockFaturas.filter(f => f.alunoId === 'a1'),
  evolucao: [
    { data: '2025-01-01', peso: 80.4, gordura: 16 },
    { data: '2025-02-01', peso: 79.8, gordura: 15.5 },
    { data: '2025-03-01', peso: 79.2, gordura: 15 },
    { data: '2025-04-01', peso: 78.6, gordura: 14.5 },
    { data: '2025-05-01', peso: 78.0, gordura: 14 },
  ],

  mensagens: [
    {
      id: 'm0', remetente: 'camila', timestamp: new Date(),
      conteudo: 'Oi! Eu sou a Camila, sua coach de fitness e nutrição do Camis FIT! 💪 Estou aqui para te ajudar a alcançar seus objetivos. Como posso te ajudar hoje?',
    },
  ],

  setUser: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),

  addAluno: (aluno) => set((s) => ({ alunos: [...s.alunos, aluno] })),
  updateAluno: (id, data) => set((s) => ({ alunos: s.alunos.map(a => a.id === id ? { ...a, ...data } : a) })),

  addFicha: (ficha) => set((s) => ({ fichasTreino: [...s.fichasTreino, ficha] })),
  updateFicha: (id, data) => set((s) => ({ fichasTreino: s.fichasTreino.map(f => f.id === id ? { ...f, ...data } : f) })),
  deleteFicha: (id) => set((s) => ({ fichasTreino: s.fichasTreino.filter(f => f.id !== id) })),

  addFatura: (fatura) => set((s) => ({ faturas: [...s.faturas, fatura] })),
  marcarPago: (faturaId) => set((s) => ({
    faturas: s.faturas.map(f => f.id === faturaId ? { ...f, status: 'pago', pagoEm: new Date().toISOString() } : f),
  })),
  bloquearAluno: (alunoId) => set((s) => ({
    alunos: s.alunos.map(a => a.id === alunoId ? { ...a, ativo: false } : a),
  })),

  addEvolucao: (entry) => set((s) => ({ evolucao: [...s.evolucao, entry] })),

  addMensagem: (msg) => set((s) => ({ mensagens: [...s.mensagens, msg] })),
  clearMensagens: () => set({ mensagens: [] }),
}));
