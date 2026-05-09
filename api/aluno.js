// api/aluno.js — Camis FIT Rotas do Aluno (PostgreSQL)

const DB = require('../lib/db');
const { autenticar, handler, semSenha } = require('../lib/auth');

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user || user.role !== 'aluno') return res.status(401).json({ erro: 'Não autorizado' });

  const url = req.url.split('?')[0].replace('/api/aluno/', '').replace('/api/aluno', '');
  const method = req.method;
  const body = req.body || {};
  const aluno_id = user.id;

  if (url === 'perfil' && method === 'GET') {
    const [aluno, evolucao, faturas, treinos_total] = await Promise.all([
      DB.findAlunoById(aluno_id),
      DB.findEvolucaoByAluno(aluno_id),
      DB.findFaturasByAluno(aluno_id),
      DB.contarSessoesAluno(aluno_id),
    ]);
    if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
    const instrutor = await DB.findInstrutorById(aluno.instrutor_id);
    return res.status(200).json({
      ...semSenha(aluno), role: 'aluno',
      instrutor_nome: instrutor?.nome || '',
      avatar_initials: aluno.nome.slice(0, 2).toUpperCase(),
      stats: {
        treinos_total,
        peso_atual: aluno.peso,
        evolucao_peso: evolucao.length > 1 ? (parseFloat(evolucao[evolucao.length - 1].peso) - parseFloat(evolucao[0].peso)).toFixed(1) : 0,
        faturas_pendentes: faturas.filter(f => f.status !== 'pago').length,
      },
    });
  }

  if (url === 'perfil' && method === 'PUT') {
    const { nome, peso, altura, objetivo, nivel_treino } = body;
    const atualizado = await DB.updateAluno(aluno_id, { nome, peso, altura, objetivo, nivel_treino });
    return res.status(200).json(semSenha(atualizado));
  }

  if (url === 'treinos' && method === 'GET') {
    const treinos = await DB.findFichasByAluno(aluno_id);
    return res.status(200).json(treinos);
  }

  if (url.startsWith('treinos/') && url.includes('/iniciar') && method === 'POST') {
    const ficha_id = url.split('/')[1];
    const sessao = await DB.createSessao(aluno_id, ficha_id);
    return res.status(200).json({ sessao_id: sessao.id, iniciado_em: sessao.iniciado_em, mensagem: 'Bora! Camila está torcendo por você! 💪' });
  }

  if (url.startsWith('treinos/') && url.includes('/finalizar') && method === 'POST') {
    const xp_ganho = 50;
    const { sessao_id } = body;
    await DB.incrementarXP(aluno_id, xp_ganho);
    if (sessao_id) await DB.finalizarSessao(sessao_id, xp_ganho).catch(() => {});
    return res.status(200).json({ xp_ganho, mensagem: `Treino finalizado! +${xp_ganho} XP ganhos! 🔥` });
  }

  if (url.startsWith('treinos/') && method === 'GET') {
    const id = url.split('/')[1];
    const ficha = await DB.findFichaById(id);
    if (!ficha) return res.status(404).json({ erro: 'Treino não encontrado' });
    return res.status(200).json(ficha);
  }

  if (url === 'evolucao' && method === 'POST') {
    const { peso, gordura, observacao } = body;
    if (!peso) return res.status(400).json({ erro: 'Peso obrigatório' });
    await DB.updateAluno(aluno_id, { peso: parseFloat(peso), percentual_gordura: gordura ? parseFloat(gordura) : undefined });
    const nova = await DB.createEvolucao({ aluno_id, data: new Date().toISOString().split('T')[0], peso: parseFloat(peso), gordura: gordura ? parseFloat(gordura) : null, observacao: observacao || '' });
    return res.status(201).json(nova);
  }

  if (url === 'evolucao' && method === 'GET') {
    return res.status(200).json(await DB.findEvolucaoByAluno(aluno_id));
  }

  if (url === 'faturas' && method === 'GET') {
    return res.status(200).json(await DB.findFaturasByAluno(aluno_id));
  }

  if (url.startsWith('faturas/') && url.includes('/pagar') && method === 'POST') {
    const id = url.split('/')[1];
    const { metodo_pagamento } = body;
    const atualizada = await DB.updateFatura(id, { status: 'pago', pago_em: new Date().toISOString(), metodo_pag: metodo_pagamento || 'pix' });
    return res.status(200).json({ mensagem: 'Pagamento registrado!', fatura: atualizada });
  }

  if (url === 'vincular-instrutor' && method === 'POST') {
    const { codigo } = body;
    const instrutor = await DB.findInstrutorByCodigo(codigo);
    if (!instrutor) return res.status(404).json({ erro: 'Código inválido' });
    await DB.updateAluno(aluno_id, { instrutor_id: instrutor.id });
    return res.status(200).json({ mensagem: 'Vinculado com sucesso!', instrutor_nome: instrutor.nome });
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
