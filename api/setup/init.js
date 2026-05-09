// api/setup/init.js
// Camis FIT — Inicializar schema do banco (POST uma vez só)
// Chame: POST /api/setup/init  com body { "secret": "SEU_SETUP_SECRET" }

const initSchema = require('../../lib/db-init');
const { handler } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Use POST' });
  }

  const { secret } = req.body || {};
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return res.status(403).json({ erro: 'Não autorizado. Configure SETUP_SECRET no Vercel.' });
  }

  try {
    await initSchema();
    return res.status(200).json({ mensagem: 'Schema criado com sucesso! Tabelas prontas.' });
  } catch (err) {
    console.error('Erro ao criar schema:', err);
    return res.status(500).json({ erro: 'Erro ao criar schema', detalhes: err.message });
  }
});
