// api/auth/[...route].js
// Camis FIT — Autenticação completa (PostgreSQL)

const bcrypt = require('bcryptjs');
const DB = require('../../lib/db');
const { gerarToken, autenticar, handler, semSenha } = require('../../lib/auth');

module.exports = handler(async (req, res) => {
  const parts = Array.isArray(req.query.route) ? req.query.route : (req.query.route ? [req.query.route] : []);
  const url = parts.join('/');
  const method = req.method;
  const body = req.body || {};

  // ── POST /auth/instrutor/login ──────────────
  if (url === 'instrutor/login' && method === 'POST') {
    const { email, senha } = body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });

    const instrutor = await DB.findInstrutorByEmail(email);
    if (!instrutor) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaOk = await bcrypt.compare(senha, instrutor.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });

    if (!instrutor.ativo) return res.status(403).json({ erro: 'Conta inativa. Entre em contato com o suporte.' });

    const token = gerarToken({ id: instrutor.id, role: 'instrutor', email: instrutor.email });
    return res.status(200).json({ token, user: { ...semSenha(instrutor), role: 'instrutor' } });
  }

  // ── POST /auth/aluno/login ──────────────────
  if (url === 'aluno/login' && method === 'POST') {
    const { email, senha } = body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });

    const aluno = await DB.findAlunoByEmail(email);
    if (!aluno) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaOk = await bcrypt.compare(senha, aluno.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });

    if (!aluno.ativo) return res.status(403).json({ erro: 'Acesso bloqueado pelo seu instrutor.' });

    const instrutor = await DB.findInstrutorById(aluno.instrutor_id);
    const token = gerarToken({ id: aluno.id, role: 'aluno', email: aluno.email });

    return res.status(200).json({
      token,
      user: {
        ...semSenha(aluno),
        role: 'aluno',
        instrutor_nome: instrutor?.nome || '',
        avatar_initials: aluno.nome.slice(0, 2).toUpperCase(),
      },
    });
  }

  // ── POST /auth/instrutor/cadastro ───────────
  if (url === 'instrutor/cadastro' && method === 'POST') {
    const { nome, email, senha, cref, telefone } = body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });

    const existe = await DB.findInstrutorByEmail(email);
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

    const senha_hash = await bcrypt.hash(senha, 10);
    const codigo_convite = DB.gerarCodigo(nome);

    const novo = await DB.createInstrutor({
      nome, email, senha_hash,
      cref: cref || '',
      telefone: telefone || '',
      pix_chave: email,
      codigo_convite,
      plano: 'free',
      ativo: true,
    });

    const token = gerarToken({ id: novo.id, role: 'instrutor', email: novo.email });
    return res.status(201).json({
      token,
      user: { ...semSenha(novo), role: 'instrutor', avatar_initials: nome.slice(0, 2).toUpperCase() },
    });
  }

  // ── POST /auth/aluno/cadastro ───────────────
  if (url === 'aluno/cadastro' && method === 'POST') {
    const { nome, email, senha, codigo_instrutor, peso, altura, objetivo } = body;
    if (!nome || !email || !senha || !codigo_instrutor) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const instrutor = await DB.findInstrutorByCodigo(codigo_instrutor);
    if (!instrutor) return res.status(404).json({ erro: 'Código de instrutor inválido' });

    const existe = await DB.findAlunoByEmail(email);
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });

    const senha_hash = await bcrypt.hash(senha, 10);

    const novo = await DB.createAluno({
      nome, email, senha_hash,
      instrutor_id: instrutor.id,
      peso: peso || 70,
      altura: altura || 170,
      objetivo: objetivo || 'hipertrofia',
      nivel_treino: 'iniciante',
    });

    const token = gerarToken({ id: novo.id, role: 'aluno', email: novo.email });
    return res.status(201).json({
      token,
      user: {
        ...semSenha(novo),
        role: 'aluno',
        instrutor_nome: instrutor.nome,
        avatar_initials: nome.slice(0, 2).toUpperCase(),
      },
    });
  }

  // ── POST /auth/validar-codigo ───────────────
  if (url === 'validar-codigo' && method === 'POST') {
    const { codigo } = body;
    if (!codigo) return res.status(400).json({ erro: 'Código obrigatório' });
    const instrutor = await DB.findInstrutorByCodigo(codigo);
    if (!instrutor) return res.status(404).json({ valido: false, erro: 'Código inválido' });
    return res.status(200).json({ valido: true, instrutor_nome: instrutor.nome });
  }

  // ── POST /auth/esqueci-senha ────────────────
  if (url === 'esqueci-senha' && method === 'POST') {
    // Em produção: enviar email via Resend / SendGrid
    return res.status(200).json({ mensagem: 'Se o email existir, você receberá as instruções em breve.' });
  }

  // ── GET /auth/me ────────────────────────────
  if (url === 'me' && method === 'GET') {
    const user = autenticar(req);
    if (!user) return res.status(401).json({ erro: 'Não autorizado' });

    if (user.role === 'instrutor') {
      const instrutor = await DB.findInstrutorById(user.id);
      if (!instrutor) return res.status(404).json({ erro: 'Usuário não encontrado' });
      return res.status(200).json({ user: { ...semSenha(instrutor), role: 'instrutor' } });
    } else {
      const aluno = await DB.findAlunoById(user.id);
      if (!aluno) return res.status(404).json({ erro: 'Usuário não encontrado' });
      const instrutor = await DB.findInstrutorById(aluno.instrutor_id);
      return res.status(200).json({
        user: {
          ...semSenha(aluno),
          role: 'aluno',
          instrutor_nome: instrutor?.nome || '',
          avatar_initials: aluno.nome.slice(0, 2).toUpperCase(),
        },
      });
    }
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
