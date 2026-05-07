// api/notificacoes/[...route].js
// Camis FIT - Notificações

const DB = require('../../lib/db');
const { autenticar, handler } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user) return res.status(401).json({ erro: 'Não autorizado' });

  const url = req.url.replace('/api/notificacoes/', '').replace('/api/notificacoes', '') || '';
  const method = req.method;
  const body = req.body || {};

  // ── POST /notificacoes/token ────────────
  if (url === 'token' && method === 'POST') {
    const { token } = body;
    if (user.role === 'aluno') {
      DB.updateAluno(user.id, { push_token: token });
    }
    return res.status(200).json({ mensagem: 'Token registrado com sucesso' });
  }

  // ── GET /notificacoes ───────────────────
  if (url === '' && method === 'GET') {
    // Notificações mockadas — em produção buscar do banco
    const notificacoes = [
      {
        id: 'n1',
        tipo: 'treino_novo',
        titulo: 'Novo treino disponível!',
        corpo: 'Seu instrutor enviou uma nova ficha de treino.',
        lida: false,
        criado_em: new Date().toISOString(),
      },
      {
        id: 'n2',
        tipo: 'fatura',
        titulo: 'Fatura próxima do vencimento',
        corpo: 'Sua mensalidade vence em 3 dias.',
        lida: false,
        criado_em: new Date().toISOString(),
      }
    ];
    return res.status(200).json(notificacoes);
  }

  // ── PATCH /notificacoes/:id/lida ────────
  if (url.includes('/lida') && method === 'PATCH') {
    return res.status(200).json({ mensagem: 'Notificação marcada como lida' });
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
