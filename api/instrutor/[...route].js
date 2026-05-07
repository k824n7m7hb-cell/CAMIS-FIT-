// api/instrutor/[...route].js
// Camis FIT - Rotas do Instrutor

const DB = require('../../lib/db');
const { autenticar, handler, semSenha } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  // Autenticar
  const user = autenticar(req);
  if (!user || user.role !== 'instrutor') {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const url = req.url.replace('/api/instrutor/', '').replace('/api/instrutor', '') || '';
  const method = req.method;
  const body = req.body || {};
  const instrutor_id = user.id;

  // ── GET /instrutor/painel ───────────────
  if (url === 'painel' && method === 'GET') {
    const alunos = DB.findAlunosByInstrutor(instrutor_id);
    const faturas = DB.findFaturasByInstrutor(instrutor_id);
    const total_recebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
    const total_pendente = faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);

    return res.status(200).json({
      alunos_ativos: alunos.filter(a => a.ativo).length,
      total_alunos: alunos.length,
      total_recebido,
      total_pendente,
      meta: 5000,
    });
  }

  // ── GET /instrutor/alunos ───────────────
  if (url === 'alunos' && method === 'GET') {
    const alunos = DB.findAlunosByInstrutor(instrutor_id).map(semSenha);
    return res.status(200).json(alunos);
  }

  // ── GET /instrutor/alunos/:id ───────────
  if (url.startsWith('alunos/') && method === 'GET') {
    const id = url.split('/')[1];
    if (id === 'liberar') return; // será tratado abaixo
    const aluno = DB.findAlunoById(id);
    if (!aluno || aluno.instrutor_id !== instrutor_id) return res.status(404).json({ erro: 'Aluno não encontrado' });
    const evolucao = DB.findEvolucaoByAluno(id);
    const treinos = DB.findFichasByAluno(id);
    return res.status(200).json({ ...semSenha(aluno), evolucao, treinos });
  }

  // ── POST /instrutor/alunos/liberar ──────
  if (url === 'alunos/liberar' && method === 'POST') {
    const { email } = body;
    const aluno = DB.findAluno(a => a.email === email);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado com este email' });
    DB.updateAluno(aluno.id, { instrutor_id, ativo: true });
    return res.status(200).json({ mensagem: `Acesso liberado para ${aluno.nome}` });
  }

  // ── PATCH /instrutor/alunos/:id/bloquear
  if (url.includes('/bloquear') && method === 'PATCH') {
    const id = url.split('/')[1];
    DB.updateAluno(id, { ativo: false });
    return res.status(200).json({ mensagem: 'Aluno bloqueado' });
  }

  // ── PATCH /instrutor/alunos/:id/desbloquear
  if (url.includes('/desbloquear') && method === 'PATCH') {
    const id = url.split('/')[1];
    DB.updateAluno(id, { ativo: true });
    return res.status(200).json({ mensagem: 'Aluno desbloqueado' });
  }

  // ── POST /instrutor/codigo/gerar ────────
  if (url === 'codigo/gerar' && method === 'POST') {
    const instrutor = DB.findInstrutorById(instrutor_id);
    const codigo = DB.gerarCodigo(instrutor.nome);
    DB.updateInstrutor(instrutor_id, { codigo_convite: codigo });
    return res.status(200).json({ codigo });
  }

  // ── GET /instrutor/fichas ───────────────
  if (url === 'fichas' && method === 'GET') {
    const fichas = DB.findFichasByInstrutor(instrutor_id);
    return res.status(200).json(fichas);
  }

  // ── POST /instrutor/fichas ──────────────
  if (url === 'fichas' && method === 'POST') {
    const { titulo, descricao, nivel, duracao_min, exercicios } = body;
    if (!titulo) return res.status(400).json({ erro: 'Título obrigatório' });
    const nova = DB.createFicha({ instrutor_id, titulo, descricao, nivel, duracao_min, exercicios: exercicios || [] });
    return res.status(201).json(nova);
  }

  // ── PUT /instrutor/fichas/:id ───────────
  if (url.startsWith('fichas/') && !url.includes('/enviar') && method === 'PUT') {
    const id = url.split('/')[1];
    const ficha = DB.findFichaById(id);
    if (!ficha || ficha.instrutor_id !== instrutor_id) return res.status(404).json({ erro: 'Ficha não encontrada' });
    const atualizada = DB.updateFicha(id, body);
    return res.status(200).json(atualizada);
  }

  // ── DELETE /instrutor/fichas/:id ────────
  if (url.startsWith('fichas/') && method === 'DELETE') {
    const id = url.split('/')[1];
    DB.deleteFicha(id);
    return res.status(200).json({ mensagem: 'Ficha removida' });
  }

  // ── POST /instrutor/fichas/:id/enviar ───
  if (url.includes('/enviar') && method === 'POST') {
    const fichaId = url.split('/')[1];
    const { alunoId } = body;
    const ficha = DB.findFichaById(fichaId);
    if (!ficha) return res.status(404).json({ erro: 'Ficha não encontrada' });
    if (!ficha.alunos_vinculados.includes(alunoId)) {
      ficha.alunos_vinculados.push(alunoId);
      DB.updateFicha(fichaId, { alunos_vinculados: ficha.alunos_vinculados });
    }
    return res.status(200).json({ mensagem: 'Ficha enviada para o aluno' });
  }

  // ── GET /instrutor/faturas ──────────────
  if (url === 'faturas' && method === 'GET') {
    const faturas = DB.findFaturasByInstrutor(instrutor_id);
    return res.status(200).json(faturas);
  }

  // ── POST /instrutor/faturas ─────────────
  if (url === 'faturas' && method === 'POST') {
    const { aluno_id, tipo, descricao, valor, vencimento } = body;
    if (!aluno_id || !valor) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    const aluno = DB.findAlunoById(aluno_id);
    const nova = DB.createFatura({
      instrutor_id, aluno_id,
      aluno_nome: aluno?.nome || '',
      tipo, descricao, valor: parseFloat(valor),
      vencimento: vencimento || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    return res.status(201).json(nova);
  }

  // ── PATCH /instrutor/faturas/:id/pago ───
  if (url.includes('/pago') && method === 'PATCH') {
    const id = url.split('/')[1];
    const atualizada = DB.updateFatura(id, { status: 'pago', pago_em: new Date().toISOString() });
    return res.status(200).json(atualizada);
  }

  // ── GET /instrutor/financeiro/resumo ────
  if (url === 'financeiro/resumo' && method === 'GET') {
    const faturas = DB.findFaturasByInstrutor(instrutor_id);
    const recebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
    const pendente = faturas.filter(f => f.status === 'pendente').reduce((s, f) => s + f.valor, 0);
    const vencido = faturas.filter(f => f.status === 'vencido').reduce((s, f) => s + f.valor, 0);
    return res.status(200).json({ recebido, pendente, vencido, historico: faturas.slice(-10) });
  }

  // ── GET /instrutor/perfil ───────────────
  if (url === 'perfil' && method === 'GET') {
    const instrutor = DB.findInstrutorById(instrutor_id);
    return res.status(200).json({ ...semSenha(instrutor), role: 'instrutor' });
  }

  // ── PUT /instrutor/perfil ───────────────
  if (url === 'perfil' && method === 'PUT') {
    const { nome, cref, telefone, pix_chave } = body;
    const atualizado = DB.updateInstrutor(instrutor_id, { nome, cref, telefone, pix_chave });
    return res.status(200).json(semSenha(atualizado));
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
