// src/utils/mappers.ts
// Converte respostas da API (snake_case) para os tipos do store (camelCase).
// Arquivo único elimina a duplicação que existia em AlunoScreens e InstrutorScreens.

import type { Aluno, Exercicio, FichaTreino, Fatura } from '../services/store';
import { NIVEL_LABELS } from '../constants';

interface ExercicioAPI {
  id: number | string;
  nome: string;
  series: number | string;
  repeticoes: number | string;
  descanso?: string;
  observacao?: string;
  grupo_muscular?: string;
}

interface FichaAPI {
  id: number | string;
  titulo: string;
  descricao?: string;
  nivel?: string;
  exercicios?: ExercicioAPI[];
  duracao_min: number | string;
  instrutor_id: number | string;
  alunos_vinculados?: (string | number)[];
  criado_em?: string;
}

interface FaturaAPI {
  id: number | string;
  aluno_id: number | string;
  aluno_nome?: string;
  instrutor_id: number | string;
  tipo?: string;
  descricao?: string;
  valor: number | string;
  status?: string;
  vencimento?: string;
  pago_em?: string;
  criado_em?: string;
}

interface AlunoAPI {
  id: number | string;
  nome: string;
  email: string;
  instrutor_id: number | string;
  objetivo?: string;
  nivel_treino?: string;
  peso: number | string;
  peso_inicial?: number | string;
  percentual_gordura?: number | string;
  ativo?: boolean;
}

export const mapNivel = (n: string): string =>
  NIVEL_LABELS[(n || '').toLowerCase()] || 'Iniciante';

export const mapExercicio = (e: ExercicioAPI): Exercicio => ({
  id: String(e.id),
  nome: e.nome,
  series: String(e.series || '3'),
  repeticoes: String(e.repeticoes || '12'),
  descanso: e.descanso || '60s',
  observacao: e.observacao || '',
  grupoMuscular: e.grupo_muscular || '',
});

export const mapFicha = (f: FichaAPI): FichaTreino => ({
  id: String(f.id),
  titulo: f.titulo,
  descricao: f.descricao || '',
  nivel: mapNivel(f.nivel || ''),
  exercicios: (f.exercicios || []).map(mapExercicio),
  duracao: parseInt(String(f.duracao_min), 10) || 60,
  instrutorId: String(f.instrutor_id),
  alunosVinculados: Array.isArray(f.alunos_vinculados)
    ? f.alunos_vinculados.map(String)
    : [],
  criadoEm: (f.criado_em || '').toString().split('T')[0],
});

export const mapFatura = (f: FaturaAPI): Fatura => ({
  id: String(f.id),
  alunoId: String(f.aluno_id),
  alunoNome: f.aluno_nome || '',
  instrutorId: String(f.instrutor_id),
  tipo: f.tipo || 'mensalidade',
  descricao: f.descricao || '',
  valor: parseFloat(String(f.valor)) || 0,
  status: (f.status || 'pendente') as Fatura['status'],
  vencimento: (f.vencimento || '').toString().split('T')[0],
  pagoEm: f.pago_em || undefined,
  criadoEm: (f.criado_em || '').toString().split('T')[0],
});

export const mapAluno = (a: AlunoAPI): Aluno => ({
  id: String(a.id),
  nome: a.nome,
  email: a.email,
  instrutorId: String(a.instrutor_id),
  objetivo: a.objetivo || 'Hipertrofia',
  nivel: mapNivel(a.nivel_treino || ''),
  peso: parseFloat(String(a.peso)) || 0,
  pesoInicial: parseFloat(String(a.peso_inicial)) || parseFloat(String(a.peso)) || 0,
  gordura: parseFloat(String(a.percentual_gordura)) || 0,
  statusPagamento: 'pendente',
  proximoVencimento: '',
  treinos: 0,
  ativo: a.ativo !== false,
});
