// lib/db.js
// Camis FIT - Banco de dados em memória
// Para produção real: substitua por PostgreSQL / Supabase

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ── Dados iniciais ─────────────────────
const db = {
  instrutores: [
    {
      id: 'i1',
      nome: 'Ana Beatriz Santos',
      email: 'ana@camisfit.com.br',
      senha_hash: bcrypt.hashSync('123456', 10),
      cref: '123456-G/SP',
      telefone: '(11) 99999-9999',
      pix_chave: 'ana@camisfit.com.br',
      codigo_convite: 'ANA-847',
      plano: 'premium',
      ativo: true,
      criado_em: new Date().toISOString(),
    }
  ],

  alunos: [
    {
      id: 'a1',
      nome: 'Rafael Silva',
      email: 'rafael@email.com',
      senha_hash: bcrypt.hashSync('123456', 10),
      instrutor_id: 'i1',
      peso: 78,
      peso_inicial: 80.4,
      altura: 175,
      percentual_gordura: 14,
      objetivo: 'hipertrofia',
      nivel_treino: 'intermediario',
      nivel_gamif: 7,
      xp: 620,
      ativo: true,
      push_token: null,
      criado_em: new Date().toISOString(),
    }
  ],

  fichas_treino: [
    {
      id: 'f1',
      instrutor_id: 'i1',
      titulo: 'Hipertrofia A — Peito + Tríceps',
      descricao: 'Foco em força e volume no peito',
      nivel: 'intermediario',
      duracao_min: 55,
      criado_em: new Date().toISOString(),
      exercicios: [
        { id: 'e1', nome: 'Supino Reto', series: '4', repeticoes: '10', descanso: '90s', grupo_muscular: 'Peito', observacao: 'Desça até o peito' },
        { id: 'e2', nome: 'Crucifixo', series: '3', repeticoes: '12', descanso: '60s', grupo_muscular: 'Peito' },
        { id: 'e3', nome: 'Supino Inclinado', series: '3', repeticoes: '10', descanso: '90s', grupo_muscular: 'Peito' },
        { id: 'e4', nome: 'Tríceps Corda', series: '3', repeticoes: '15', descanso: '60s', grupo_muscular: 'Tríceps' },
        { id: 'e5', nome: 'Tríceps Francês', series: '3', repeticoes: '12', descanso: '60s', grupo_muscular: 'Tríceps' },
      ],
      alunos_vinculados: ['a1'],
    },
    {
      id: 'f2',
      instrutor_id: 'i1',
      titulo: 'Emagrecimento B — Pernas + Glúteos',
      descricao: 'Circuito de alta intensidade',
      nivel: 'iniciante',
      duracao_min: 45,
      criado_em: new Date().toISOString(),
      exercicios: [
        { id: 'e6', nome: 'Agachamento Livre', series: '4', repeticoes: '15', descanso: '60s', grupo_muscular: 'Pernas' },
        { id: 'e7', nome: 'Avanço Alternado', series: '3', repeticoes: '12', descanso: '60s', grupo_muscular: 'Pernas' },
        { id: 'e8', nome: 'Leg Press 45°', series: '4', repeticoes: '12', descanso: '90s', grupo_muscular: 'Pernas' },
        { id: 'e9', nome: 'Elevação Pélvica', series: '4', repeticoes: '15', descanso: '45s', grupo_muscular: 'Glúteos' },
      ],
      alunos_vinculados: [],
    }
  ],

  faturas: [
    { id: 'fat1', instrutor_id: 'i1', aluno_id: 'a1', tipo: 'mensalidade', descricao: 'Mensalidade Maio/2025', valor: 180, status: 'pago', vencimento: '2025-05-10', pago_em: '2025-05-02', criado_em: new Date().toISOString() },
    { id: 'fat2', instrutor_id: 'i1', aluno_id: 'a1', tipo: 'atualizacao_dieta', descricao: 'Atualização de dieta', valor: 30, status: 'pago', vencimento: '2025-05-05', pago_em: '2025-05-02', criado_em: new Date().toISOString() },
    { id: 'fat3', instrutor_id: 'i1', aluno_id: 'a1', tipo: 'mensalidade', descricao: 'Mensalidade Junho/2025', valor: 180, status: 'pendente', vencimento: '2025-06-10', criado_em: new Date().toISOString() },
  ],

  evolucao: [
    { id: 'ev1', aluno_id: 'a1', data: '2025-01-01', peso: 80.4, gordura: 16, criado_em: new Date().toISOString() },
    { id: 'ev2', aluno_id: 'a1', data: '2025-02-01', peso: 79.8, gordura: 15.5, criado_em: new Date().toISOString() },
    { id: 'ev3', aluno_id: 'a1', data: '2025-03-01', peso: 79.2, gordura: 15, criado_em: new Date().toISOString() },
    { id: 'ev4', aluno_id: 'a1', data: '2025-04-01', peso: 78.6, gordura: 14.5, criado_em: new Date().toISOString() },
    { id: 'ev5', aluno_id: 'a1', data: '2025-05-01', peso: 78.0, gordura: 14, criado_em: new Date().toISOString() },
  ],

  notificacoes: [],
  chat_camila: [],
  sessoes_treino: [],
};

// ── Helpers ─────────────────────────────
const DB = {
  // Instrutores
  findInstrutor: (filter) => db.instrutores.find(filter),
  findInstrutorById: (id) => db.instrutores.find(i => i.id === id),
  createInstrutor: (data) => {
    const novo = { id: uuidv4(), ...data, criado_em: new Date().toISOString() };
    db.instrutores.push(novo);
    return novo;
  },
  updateInstrutor: (id, data) => {
    const idx = db.instrutores.findIndex(i => i.id === id);
    if (idx >= 0) { db.instrutores[idx] = { ...db.instrutores[idx], ...data }; return db.instrutores[idx]; }
    return null;
  },

  // Alunos
  findAluno: (filter) => db.alunos.find(filter),
  findAlunoById: (id) => db.alunos.find(a => a.id === id),
  findAlunosByInstrutor: (instrutor_id) => db.alunos.filter(a => a.instrutor_id === instrutor_id),
  createAluno: (data) => {
    const novo = { id: uuidv4(), nivel_gamif: 1, xp: 0, ativo: true, ...data, criado_em: new Date().toISOString() };
    db.alunos.push(novo);
    return novo;
  },
  updateAluno: (id, data) => {
    const idx = db.alunos.findIndex(a => a.id === id);
    if (idx >= 0) { db.alunos[idx] = { ...db.alunos[idx], ...data }; return db.alunos[idx]; }
    return null;
  },

  // Fichas
  findFichasByInstrutor: (instrutor_id) => db.fichas_treino.filter(f => f.instrutor_id === instrutor_id),
  findFichasByAluno: (aluno_id) => db.fichas_treino.filter(f => f.alunos_vinculados.includes(aluno_id)),
  findFichaById: (id) => db.fichas_treino.find(f => f.id === id),
  createFicha: (data) => {
    const nova = { id: uuidv4(), alunos_vinculados: [], exercicios: [], ...data, criado_em: new Date().toISOString() };
    db.fichas_treino.push(nova);
    return nova;
  },
  updateFicha: (id, data) => {
    const idx = db.fichas_treino.findIndex(f => f.id === id);
    if (idx >= 0) { db.fichas_treino[idx] = { ...db.fichas_treino[idx], ...data }; return db.fichas_treino[idx]; }
    return null;
  },
  deleteFicha: (id) => {
    const idx = db.fichas_treino.findIndex(f => f.id === id);
    if (idx >= 0) { db.fichas_treino.splice(idx, 1); return true; }
    return false;
  },

  // Faturas
  findFaturasByInstrutor: (instrutor_id) => db.faturas.filter(f => f.instrutor_id === instrutor_id),
  findFaturasByAluno: (aluno_id) => db.faturas.filter(f => f.aluno_id === aluno_id),
  createFatura: (data) => {
    const nova = { id: uuidv4(), status: 'pendente', ...data, criado_em: new Date().toISOString() };
    db.faturas.push(nova);
    return nova;
  },
  updateFatura: (id, data) => {
    const idx = db.faturas.findIndex(f => f.id === id);
    if (idx >= 0) { db.faturas[idx] = { ...db.faturas[idx], ...data }; return db.faturas[idx]; }
    return null;
  },

  // Evolução
  findEvolucaoByAluno: (aluno_id) => db.evolucao.filter(e => e.aluno_id === aluno_id).sort((a, b) => new Date(a.data) - new Date(b.data)),
  createEvolucao: (data) => {
    const nova = { id: uuidv4(), ...data, criado_em: new Date().toISOString() };
    db.evolucao.push(nova);
    return nova;
  },

  // Chat Camila
  saveMensagem: (data) => {
    const msg = { id: uuidv4(), ...data, criado_em: new Date().toISOString() };
    db.chat_camila.push(msg);
    return msg;
  },
  getHistoricoChat: (aluno_id, limit = 10) => db.chat_camila.filter(m => m.aluno_id === aluno_id).slice(-limit),

  // Código convite
  findInstrutorByCodigo: (codigo) => db.instrutores.find(i => i.codigo_convite === codigo),
  gerarCodigo: (nome) => {
    const prefix = nome.split(' ')[0].toUpperCase().slice(0, 3);
    const num = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${num}`;
  },
};

module.exports = DB;
