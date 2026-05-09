// api/instrutor.js — Camis FIT Rotas do Instrutor (PostgreSQL)

const DB = require('../lib/db');
const { autenticar, handler, semSenha } = require('../lib/auth');

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user || user.role !== 'instrutor') return res.status(401).json({ erro: 'Não autorizado' });

  const url = req.url.split('?')[0].replace('/api/instrutor/', '').replace('/api/instrutor', '');
  const method = req.method;
  const body = req.body || {};
  const instrutor_id = user.id;

  if (url === 'painel' && method === 'GET') {
    const [alunos, faturas] = await Promise.all([DB.findAlunosByInstrutor(instrutor_id), DB.findFaturasByInstrutor(instrutor_id)]);
    return res.status(200).json({
      alunos_ativos: alunos.filter(a => a.ativo).length,
      total_alunos: alunos.length,
      total_recebido: faturas.filter(f => f.status === 'pago').reduce((s, f) => s + parseFloat(f.valor), 0),
      total_pendente: faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + parseFloat(f.valor), 0),
      meta: 5000,
    });
  }

  if (url === 'alunos' && method === 'GET') {
    return res.status(200).json((await DB.findAlunosByInstrutor(instrutor_id)).map(semSenha));
  }

  if (url === 'alunos/liberar' && method === 'POST') {
    const { email } = body;
    if (!email) return res.status(400).json({ erro: 'Email obrigatório' });
    const aluno = await DB.findAlunoByEmail(email);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    await DB.updateAluno(aluno.id, { instrutor_id, ativo: true });
    return res.status(200).json({ mensagem: `Acesso liberado para ${aluno.nome}` });
  }

  if (url.startsWith('alunos/') && url.includes('/bloquear') && method === 'PATCH') {
    const id = url.split('/')[1];
    await DB.updateAluno(id, { ativo: false });
    return res.status(200).json({ mensagem: 'Aluno bloqueado' });
  }

  if (url.startsWith('alunos/') && url.includes('/desbloquear') && method === 'PATCH') {
    const id = url.split('/')[1];
    await DB.updateAluno(id, { ativo: true });
    return res.status(200).json({ mensagem: 'Aluno desbloqueado' });
  }

  if (url.startsWith('alunos/') && method === 'GET') {
    const id = url.split('/')[1];
    const [aluno, evolucao, treinos] = await Promise.all([DB.findAlunoById(id), DB.findEvolucaoByAluno(id), DB.findFichasByAluno(id)]);
    if (!aluno || aluno.instrutor_id !== instrutor_id) return res.status(404).json({ erro: 'Aluno não encontrado' });
    return res.status(200).json({ ...semSenha(aluno), evolucao, treinos });
  }

  if (url === 'codigo/gerar' && method === 'POST') {
    const instrutor = await DB.findInstrutorById(instrutor_id);
    const codigo = DB.gerarCodigo(instrutor.nome);
    await DB.updateInstrutor(instrutor_id, { codigo_convite: codigo });
    return res.status(200).json({ codigo });
  }

  if (url === 'fichas' && method === 'GET') {
    return res.status(200).json(await DB.findFichasByInstrutor(instrutor_id));
  }

  if (url === 'fichas' && method === 'POST') {
    const { titulo, descricao, nivel, duracao_min, exercicios } = body;
    if (!titulo) return res.status(400).json({ erro: 'Título obrigatório' });
    const nova = await DB.createFicha({ instrutor_id, titulo, descricao, nivel, duracao_min, exercicios: exercicios || [] });
    return res.status(201).json(nova);
  }

  if (url.startsWith('fichas/') && url.includes('/enviar') && method === 'POST') {
    const fichaId = url.split('/')[1];
    const { alunoId } = body;
    if (!alunoId) return res.status(400).json({ erro: 'alunoId obrigatório' });
    const ficha = await DB.findFichaById(fichaId);
    if (!ficha || ficha.instrutor_id !== instrutor_id) return res.status(404).json({ erro: 'Ficha não encontrada' });
    await DB.vincularFichaAluno(fichaId, alunoId);
    await DB.createNotificacao({ aluno_id: alunoId, tipo: 'treino_novo', titulo: 'Novo treino disponível!', corpo: `Seu instrutor enviou: ${ficha.titulo}` }).catch(() => {});
    return res.status(200).json({ mensagem: 'Ficha enviada para o aluno' });
  }

  if (url.startsWith('fichas/') && method === 'PUT') {
    const id = url.split('/')[1];
    const ficha = await DB.findFichaById(id);
    if (!ficha || ficha.instrutor_id !== instrutor_id) return res.status(404).json({ erro: 'Ficha não encontrada' });
    return res.status(200).json(await DB.updateFicha(id, body));
  }

  if (url.startsWith('fichas/') && method === 'DELETE') {
    const id = url.split('/')[1];
    await DB.deleteFicha(id);
    return res.status(200).json({ mensagem: 'Ficha removida' });
  }

  if (url === 'faturas' && method === 'GET') {
    return res.status(200).json(await DB.findFaturasByInstrutor(instrutor_id));
  }

  if (url === 'faturas' && method === 'POST') {
    const { aluno_id, tipo, descricao, valor, vencimento } = body;
    if (!aluno_id || !valor) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    const venc = vencimento || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const nova = await DB.createFatura({ instrutor_id, aluno_id, tipo, descricao, valor: parseFloat(valor), vencimento: venc });
    await DB.createNotificacao({ aluno_id, tipo: 'fatura', titulo: 'Nova cobrança gerada', corpo: `${descricao || tipo} — R$ ${parseFloat(valor).toFixed(2)}` }).catch(() => {});
    return res.status(201).json(nova);
  }

  if (url.startsWith('faturas/') && url.includes('/pago') && method === 'PATCH') {
    const id = url.split('/')[1];
    return res.status(200).json(await DB.updateFatura(id, { status: 'pago', pago_em: new Date().toISOString() }));
  }

  if (url === 'financeiro/resumo' && method === 'GET') {
    const faturas = await DB.findFaturasByInstrutor(instrutor_id);
    return res.status(200).json({
      recebido: faturas.filter(f => f.status === 'pago').reduce((s, f) => s + parseFloat(f.valor), 0),
      pendente: faturas.filter(f => f.status === 'pendente').reduce((s, f) => s + parseFloat(f.valor), 0),
      vencido: faturas.filter(f => f.status === 'vencido').reduce((s, f) => s + parseFloat(f.valor), 0),
      historico: faturas.slice(0, 10),
    });
  }

  if (url === 'perfil' && method === 'GET') {
    const instrutor = await DB.findInstrutorById(instrutor_id);
    if (!instrutor) return res.status(404).json({ erro: 'Instrutor não encontrado' });
    return res.status(200).json({ ...semSenha(instrutor), role: 'instrutor' });
  }

  if (url === 'perfil' && method === 'PUT') {
    const { nome, cref, telefone, pix_chave } = body;
    return res.status(200).json(semSenha(await DB.updateInstrutor(instrutor_id, { nome, cref, telefone, pix_chave })));
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
