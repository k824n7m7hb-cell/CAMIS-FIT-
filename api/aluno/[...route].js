// api/aluno/[...route].js
// Camis FIT — Rotas do Aluno (PostgreSQL)

const DB = require('../../lib/db');
const { autenticar, handler, semSenha } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user || user.role !== 'aluno') {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  const parts = Array.isArray(req.query.route) ? req.query.route : (req.query.route ? [req.query.route] : []);
  const url = parts.join('/');
  const method = req.method;
  const body = req.body || {};
  const aluno_id = user.id;

  // ── GET /aluno/perfil ───────────────────────
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
      ...semSenha(aluno),
      role: 'aluno',
      instrutor_nome: instrutor?.nome || '',
      avatar_initials: aluno.nome.slice(0, 2).toUpperCase(),
      stats: {
        treinos_total,
        peso_atual: aluno.peso,
        evolucao_peso: evolucao.length > 1
          ? (parseFloat(evolucao[evolucao.length - 1].peso) - parseFloat(evolucao[0].peso)).toFixed(1)
          : 0,
        faturas_pendentes: faturas.filter(f => f.status !== 'pago').length,
      },
    });
  }

  // ── PUT /aluno/perfil ───────────────────────
  if (url === 'perfil' && method === 'PUT') {
    const { nome, peso, altura, objetivo, nivel_treino } = body;
    const atualizado = await DB.updateAluno(aluno_id, { nome, peso, altura, objetivo, nivel_treino });
    return res.status(200).json(semSenha(atualizado));
  }

  // ── GET /aluno/treinos ──────────────────────
  if (url === 'treinos' && method === 'GET') {
    const treinos = await DB.findFichasByAluno(aluno_id);
    return res.status(200).json(treinos);
  }

  // ── GET /aluno/treinos/:id ──────────────────
  if (url.startsWith('treinos/') && !url.includes('/iniciar') && !url.includes('/finalizar') && method === 'GET') {
    const id = url.split('/')[1];
    const ficha = await DB.findFichaById(id);
    if (!ficha) return res.status(404).json({ erro: 'Treino não encontrado' });
    return res.status(200).json(ficha);
  }

  // ── POST /aluno/treinos/:id/iniciar ─────────
  if (url.includes('/iniciar') && method === 'POST') {
    const ficha_id = url.split('/')[1];
    const sessao = await DB.createSessao(aluno_id, ficha_id);
    return res.status(200).json({
      sessao_id: sessao.id,
      iniciado_em: sessao.iniciado_em,
      mensagem: 'Bora! Camila está torcendo por você! 💪',
    });
  }

  // ── POST /aluno/treinos/:id/finalizar ───────
  if (url.includes('/finalizar') && method === 'POST') {
    const xp_ganho = 50;
    const { sessao_id } = body;

    await DB.incrementarXP(aluno_id, xp_ganho);

    if (sessao_id) {
      await DB.finalizarSessao(sessao_id, xp_ganho).catch(() => {});
    }

    return res.status(200).json({
      xp_ganho,
      mensagem: `Treino finalizado! +${xp_ganho} XP ganhos! 🔥`,
    });
  }

  // ── POST /aluno/evolucao ────────────────────
  if (url === 'evolucao' && method === 'POST') {
    const { peso, gordura, observacao } = body;
    if (!peso) return res.status(400).json({ erro: 'Peso obrigatório' });

    await DB.updateAluno(aluno_id, {
      peso: parseFloat(peso),
      percentual_gordura: gordura ? parseFloat(gordura) : undefined,
    });

    const nova = await DB.createEvolucao({
      aluno_id,
      data: new Date().toISOString().split('T')[0],
      peso: parseFloat(peso),
      gordura: gordura ? parseFloat(gordura) : null,
      observacao: observacao || '',
    });

    return res.status(201).json(nova);
  }

  // ── GET /aluno/evolucao ─────────────────────
  if (url === 'evolucao' && method === 'GET') {
    const evolucao = await DB.findEvolucaoByAluno(aluno_id);
    return res.status(200).json(evolucao);
  }

  // ── GET /aluno/faturas ──────────────────────
  if (url === 'faturas' && method === 'GET') {
    const faturas = await DB.findFaturasByAluno(aluno_id);
    return res.status(200).json(faturas);
  }

  // ── POST /aluno/faturas/:id/pagar ───────────
  if (url.includes('/pagar') && method === 'POST') {
    const id = url.split('/')[1];
    const { metodo_pagamento } = body;

    const qr_code_pix = `00020126580014BR.GOV.BCB.PIX0136camisfitpix@email.com5204000053039865802BR5925Camis FIT6009SAO PAULO62070503***6304ABCD`;

    const atualizada = await DB.updateFatura(id, {
      status: 'pago',
      pago_em: new Date().toISOString(),
      metodo_pag: metodo_pagamento || 'pix',
    });

    return res.status(200).json({
      mensagem: 'Pagamento registrado com sucesso!',
      fatura: atualizada,
      qr_code_pix: metodo_pagamento === 'pix' ? qr_code_pix : null,
      url_pagamento: metodo_pagamento === 'cartao' ? 'https://checkout.camisfit.com.br/pagar' : null,
    });
  }

  // ── POST /aluno/vincular-instrutor ──────────
  if (url === 'vincular-instrutor' && method === 'POST') {
    const { codigo } = body;
    const instrutor = await DB.findInstrutorByCodigo(codigo);
    if (!instrutor) return res.status(404).json({ erro: 'Código inválido' });
    await DB.updateAluno(aluno_id, { instrutor_id: instrutor.id });
    return res.status(200).json({ mensagem: 'Vinculado com sucesso!', instrutor_nome: instrutor.nome });
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
