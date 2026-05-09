// api/notificacoes/[...route].js
// Camis FIT — Notificações (PostgreSQL)

const DB = require('../../lib/db');
const { autenticar, handler } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user) return res.status(401).json({ erro: 'Não autorizado' });

  const parts = Array.isArray(req.query.route) ? req.query.route : (req.query.route ? [req.query.route] : []);
  const url = parts.join('/');
  const method = req.method;
  const body = req.body || {};

  // ── POST /notificacoes/token ────────────────
  if (url === 'token' && method === 'POST') {
    const { token } = body;
    if (!token) return res.status(400).json({ erro: 'Token obrigatório' });
    if (user.role === 'aluno') {
      await DB.updateAluno(user.id, { push_token: token });
    }
    return res.status(200).json({ mensagem: 'Token registrado com sucesso' });
  }

  // ── GET /notificacoes ───────────────────────
  if (url === '' && method === 'GET') {
    if (user.role !== 'aluno') {
      return res.status(200).json([]);
    }
    const notificacoes = await DB.findNotificacoesByAluno(user.id);
    return res.status(200).json(notificacoes);
  }

  // ── PATCH /notificacoes/:id/lida ────────────
  if (url.includes('/lida') && method === 'PATCH') {
    const id = url.split('/')[0];
    await DB.marcarNotificacaoLida(id);
    return res.status(200).json({ mensagem: 'Notificação marcada como lida' });
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
