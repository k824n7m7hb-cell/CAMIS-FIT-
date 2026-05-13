// api/auth.js - Camis FIT Autenticacao (PostgreSQL)

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const DB = require('../lib/db');
const { gerarToken, autenticar, handler, semSenha } = require('../lib/auth');

const gerarOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const parseBody = (req) => {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

const enviarEmailOTP = async (email, nome, codigo) => {
  try {
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CamisFIT <noreply@camis-fit.com.br>',
          to: email,
          subject: `${codigo} - Seu codigo de ativacao CamisFIT`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:14px;">
              <h1 style="margin:0 0 4px;font-size:26px;">CAMIS<span style="color:#39ff14">FIT</span></h1>
              <p style="color:#888;font-size:13px;margin:0 0 28px;">Plataforma de gestao fitness</p>
              <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Ative sua conta de instrutor</h2>
              <p style="color:#aaa;font-size:14px;">Ola, <strong style="color:#fff">${nome}</strong>! Use o codigo abaixo no app para confirmar seu cadastro:</p>
              <div style="background:#111;border:2px solid #39ff14;border-radius:12px;padding:28px;text-align:center;margin:24px 0;box-shadow:0 0 24px #39ff1440;">
                <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#39ff14;">${codigo}</span>
              </div>
              <p style="color:#666;font-size:12px;">Expira em 30 minutos. Se nao foi voce, ignore este email.</p>
              <hr style="border:none;border-top:1px solid #222;margin:28px 0;">
              <p style="color:#444;font-size:11px;margin:0;">CamisFIT - Plataforma de gestao fitness</p>
            </div>
          `,
        });
        return true;
      } catch (resendErr) {
        console.warn('[Email] Erro Resend:', resendErr.message);
      }
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass && !gmailPass.includes('xxxx')) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"Camis FIT" <${gmailUser}>`,
        to: email,
        subject: `${codigo} - Seu codigo de ativacao CamisFIT`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:14px;">
            <h1 style="margin:0 0 4px;font-size:26px;">CAMIS<span style="color:#39ff14">FIT</span></h1>
            <p style="color:#888;font-size:13px;margin:0 0 28px;">Plataforma de gestao fitness</p>
            <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Ative sua conta de instrutor</h2>
            <p style="color:#aaa;font-size:14px;">Ola, <strong style="color:#fff">${nome}</strong>! Use o codigo abaixo no app para confirmar seu cadastro:</p>
            <div style="background:#111;border:2px solid #39ff14;border-radius:12px;padding:28px;text-align:center;margin:24px 0;box-shadow:0 0 24px #39ff1440;">
              <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#39ff14;">${codigo}</span>
            </div>
            <p style="color:#666;font-size:12px;">Expira em 30 minutos. Se nao foi voce, ignore este email.</p>
            <hr style="border:none;border-top:1px solid #222;margin:28px 0;">
            <p style="color:#444;font-size:11px;margin:0;">CamisFIT - Plataforma de gestao fitness</p>
          </div>
        `,
      });
      return true;
    }

    console.warn('[Email] Nenhum servico de email configurado');
    return false;
  } catch (e) {
    console.error('[Email] Erro ao enviar:', e.message);
    return false;
  }
};

module.exports = handler(async (req, res) => {
  const url = req.url.split('?')[0].replace('/api/auth/', '').replace('/api/auth', '');
  const method = req.method;
  const body = parseBody(req);

  if (url === 'instrutor/login' && method === 'POST') {
    const { email, senha } = body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatorios' });
    const instrutor = await DB.findInstrutorByEmail(email);
    if (!instrutor) return res.status(401).json({ erro: 'Credenciais invalidas' });
    const senhaOk = await bcrypt.compare(senha, instrutor.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais invalidas' });
    if (!instrutor.ativo) return res.status(403).json({ erro: 'Conta inativa.' });
    if (instrutor.email_verificado === false) return res.status(403).json({ erro: 'Verifique seu email antes de fazer login.', emailPendente: true });
    const token = gerarToken({ id: instrutor.id, role: 'instrutor', email: instrutor.email });
    return res.status(200).json({ token, user: { ...semSenha(instrutor), role: 'instrutor' } });
  }

  if (url === 'aluno/login' && method === 'POST') {
    const { email, senha } = body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatorios' });
    const aluno = await DB.findAlunoByEmail(email);
    if (!aluno) return res.status(401).json({ erro: 'Credenciais invalidas' });
    const senhaOk = await bcrypt.compare(senha, aluno.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais invalidas' });
    if (!aluno.ativo) return res.status(403).json({ erro: 'Acesso bloqueado pelo seu instrutor.' });
    const instrutor = await DB.findInstrutorById(aluno.instrutor_id);
    const token = gerarToken({ id: aluno.id, role: 'aluno', email: aluno.email });
    return res.status(200).json({
      token,
      user: { ...semSenha(aluno), role: 'aluno', instrutor_nome: instrutor?.nome || '', avatar_initials: aluno.nome.slice(0, 2).toUpperCase() },
    });
  }

  if (url === 'instrutor/cadastro' && method === 'POST') {
    try {
      const { nome, email, senha, cref, telefone } = body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Campos obrigatorios faltando' });
      }

      const existe = await DB.findInstrutorByEmail(email);
      if (existe && existe.email_verificado !== false) {
        return res.status(409).json({ erro: 'Email ja cadastrado' });
      }

      if (existe && existe.email_verificado === false) {
        const codigo = gerarOTP();
        await DB.setOTPInstrutor(existe.id, codigo);
        const emailEnviado = await enviarEmailOTP(email, existe.nome, codigo);
        return res.status(200).json({ emailEnviado: true, email, mensagem: emailEnviado ? 'Codigo reenviado para seu email.' : 'Codigo gerado. Se nao receber o email, tente reenviar.' });
      }

      const senha_hash = await bcrypt.hash(senha, 10);
      const codigo_convite = DB.gerarCodigo(nome);
      const novo = await DB.createInstrutor({
        nome,
        email,
        senha_hash,
        cref: cref || '',
        telefone: telefone || '',
        pix_chave: email,
        codigo_convite,
        plano: 'free',
        ativo: true,
      });

      const codigo = gerarOTP();
      await DB.setOTPInstrutor(novo.id, codigo);

      const emailEnviado = await enviarEmailOTP(email, nome, codigo);
      return res.status(201).json({ emailEnviado: true, email, mensagem: emailEnviado ? 'Codigo de ativacao enviado para seu email.' : 'Codigo gerado. Se nao receber o email, tente reenviar.' });
    } catch (err) {
      console.error('[API] Erro no cadastro:', err.message);
      return res.status(500).json({ erro: `Erro interno: ${err.message}` });
    }
  }

  if (url === 'instrutor/verificar-email' && method === 'POST') {
    const { email, codigo } = body;
    if (!email || !codigo) return res.status(400).json({ erro: 'Email e codigo obrigatorios' });
    const instrutor = await DB.verificarOTPInstrutor(email, codigo.trim());
    if (!instrutor) return res.status(400).json({ erro: 'Codigo invalido ou expirado. Solicite um novo codigo.' });
    const token = gerarToken({ id: instrutor.id, role: 'instrutor', email: instrutor.email });
    return res.status(200).json({ token, user: { ...semSenha(instrutor), role: 'instrutor', avatar_initials: instrutor.nome.slice(0, 2).toUpperCase() } });
  }

  if (url === 'instrutor/reenviar-codigo' && method === 'POST') {
    const { email } = body;
    if (!email) return res.status(400).json({ erro: 'Email obrigatorio' });
    const instrutor = await DB.findInstrutorNaoVerificado(email);
    if (!instrutor) return res.status(404).json({ erro: 'Nenhuma conta pendente de verificacao encontrada.' });
    const codigo = gerarOTP();
    await DB.setOTPInstrutor(instrutor.id, codigo);
    await enviarEmailOTP(email, instrutor.nome, codigo);
    return res.status(200).json({ mensagem: 'Novo codigo enviado para seu email.' });
  }

  if (url === 'aluno/cadastro' && method === 'POST') {
    const nome = body.nome?.trim();
    const email = body.email?.trim().toLowerCase();
    const senha = typeof body.senha === 'string' ? body.senha : '';
    const codigoInstrutor = (body.codigo_instrutor || body.codigoInstrutor || '').trim().toUpperCase();
    const objetivo = body.objetivo?.trim();
    const peso = Number(body.peso) || 70;
    const altura = Number(body.altura) || 170;

    if (!nome || !email || !senha || !codigoInstrutor) {
      return res.status(400).json({ erro: 'Campos obrigatorios faltando' });
    }

    const instrutor = await DB.findInstrutorByCodigo(codigoInstrutor);
    if (!instrutor) return res.status(404).json({ erro: 'Codigo de instrutor invalido' });

    const existe = await DB.findAlunoByEmail(email);
    if (existe) return res.status(409).json({ erro: 'Email ja cadastrado' });

    const senha_hash = await bcrypt.hash(senha, 10);
    const novo = await DB.createAluno({
      nome,
      email,
      senha_hash,
      instrutor_id: instrutor.id,
      peso,
      altura,
      objetivo: objetivo || 'hipertrofia',
      nivel_treino: 'iniciante',
    });

    const token = gerarToken({ id: novo.id, role: 'aluno', email: novo.email });
    return res.status(201).json({
      token,
      user: { ...semSenha(novo), role: 'aluno', instrutor_nome: instrutor.nome, avatar_initials: nome.slice(0, 2).toUpperCase() },
    });
  }

  if (url === 'validar-codigo' && method === 'POST') {
    const { codigo } = body;
    if (!codigo) return res.status(400).json({ erro: 'Codigo obrigatorio' });
    const instrutor = await DB.findInstrutorByCodigo(codigo);
    if (!instrutor) return res.status(404).json({ valido: false, erro: 'Codigo invalido' });
    return res.status(200).json({ valido: true, instrutor_nome: instrutor.nome });
  }

  if (url === 'esqueci-senha' && method === 'POST') {
    return res.status(200).json({ mensagem: 'Se o email existir, voce recebera as instrucoes em breve.' });
  }

  if (url === 'me' && method === 'GET') {
    const user = autenticar(req);
    if (!user) return res.status(401).json({ erro: 'Nao autorizado' });

    if (user.role === 'instrutor') {
      const instrutor = await DB.findInstrutorById(user.id);
      if (!instrutor) return res.status(404).json({ erro: 'Usuario nao encontrado' });
      return res.status(200).json({ user: { ...semSenha(instrutor), role: 'instrutor' } });
    }

    const aluno = await DB.findAlunoById(user.id);
    if (!aluno) return res.status(404).json({ erro: 'Usuario nao encontrado' });
    const instrutor = await DB.findInstrutorById(aluno.instrutor_id);
    return res.status(200).json({ user: { ...semSenha(aluno), role: 'aluno', instrutor_nome: instrutor?.nome || '', avatar_initials: aluno.nome.slice(0, 2).toUpperCase() } });
  }

  return res.status(404).json({ erro: 'Rota nao encontrada' });
});
