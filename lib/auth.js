// lib/auth.js
// Camis FIT - Autenticação JWT

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'camisfitsecret2025';

// Gerar token
const gerarToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
};

// Verificar token
const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

// Middleware de autenticação
const autenticar = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verificarToken(token);
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handler padrão com CORS
const handler = (fn) => async (req, res) => {
  // Aplicar CORS
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await fn(req, res);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ erro: 'Erro interno do servidor', detalhes: err.message });
  }
};

// Remover senha do objeto
const semSenha = (obj) => {
  const { senha_hash, ...resto } = obj;
  return resto;
};

module.exports = { gerarToken, verificarToken, autenticar, handler, semSenha, corsHeaders };
