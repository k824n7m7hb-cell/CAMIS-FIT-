// api/auth.js — Camis FIT Autenticação (PostgreSQL)

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const DB = require('../lib/db');
const { gerarToken, autenticar, handler, semSenha } = require('../lib/auth');

const gerarOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// Inicializar Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const enviarEmailOTP = async (email, nome, codigo) => {
  try {
    // Tenta usar Resend primeiro (mais confiável)
    if (resend) {
      try {
        await resend.emails.send({
          from: 'CamisFIT <noreply@camis-fit.com.br>',
          to: email,
          subject: `${codigo} — Seu código de ativação CamisFIT`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:14px;">
              <h1 style="margin:0 0 4px;font-size:26px;">CAMIS<span style="color:#39ff14">FIT</span></h1>
              <p style="color:#888;font-size:13px;margin:0 0 28px;">Plataforma de gestão fitness</p>
              <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Ative sua conta de instrutor</h2>
              <p style="color:#aaa;font-size:14px;">Olá, <strong style="color:#fff">${nome}</strong>! Use o código abaixo no app para confirmar seu cadastro:</p>
              <div style="background:#111;border:2px solid #39ff14;border-radius:12px;padding:28px;text-align:center;margin:24px 0;box-shadow:0 0 24px #39ff1440;">
                <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#39ff14;">${codigo}</span>
              </div>
              <p style="color:#666;font-size:12px;">Expira em 30 minutos. Se não foi você, ignore este email.</p>
              <hr style="border:none;border-top:1px solid #222;margin:28px 0;">
              <p style="color:#444;font-size:11px;margin:0;">© 2025 CamisFIT — Plataforma de gestão fitness</p>
            </div>
          `,
        });
        return true;
      } catch (resendErr) {
        console.warn('[Email] Erro Resend:', resendErr.message);
      }
    }

    // Fallback para Gmail se Resend falhar ou não estiver configurado
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
        subject: `${codigo} — Seu código de ativação CamisFIT`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:14px;">
            <h1 style="margin:0 0 4px;font-size:26px;">CAMIS<span style="color:#39ff14">FIT</span></h1>
            <p style="color:#888;font-size:13px;margin:0 0 28px;">Plataforma de gestão fitness</p>
            <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Ative sua conta de instrutor</h2>
            <p style="color:#aaa;font-size:14px;">Olá, <strong style="color:#fff">${nome}</strong>! Use o código abaixo no app para confirmar seu cadastro:</p>
            <div style="background:#111;border:2px solid #39ff14;border-radius:12px;padding:28px;text-align:center;margin:24px 0;box-shadow:0 0 24px #39ff1440;">
              <span style="font-size:48px;font-weight:900;letter-spacing:14px;color:#39ff14;">${codigo}</span>
            </div>
            <p style="color:#666;font-size:12px;">Expira em 30 minutos. Se não foi você, ignore este email.</p>
            <hr style="border:none;border-top:1px solid #222;margin:28px 0;">
            <p style="color:#444;font-size:11px;margin:0;">© 2025 CamisFIT — Plataforma de gestão fitness</p>
          </div>
        `,
      });
      return true;
    }

    console.warn('[Email] Nenhum serviço de email configurado');
    return false;
  } catch (e) {
    console.error('[Email] Erro ao enviar:', e.message);
    return false;
  }
};

module.exports = handler(async (req, res) => {
  const url = req.url.split('?')[0].replace('/api/auth/', '').replace('/api/auth', '');
  const method = req.method;
  const body = req.body || {};

  if (url === 'instrutor/login' && method === 'POST') {
    const { email, senha } = body;
    if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    const instrutor = await DB.findInstrutorByEmail(email);
    if (!instrutor) return res.status(401).json({ erro: 'Credenciais inválidas' });
    const senhaOk = await bcrypt.compare(senha, instrutor.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' });
    if (!instrutor.ativo) return res.status(403).json({ erro: 'Conta inativa.' });
    if (instrutor.email_verificado === false) return res.status(403).json({ erro: 'Verifique seu email antes de fazer login.', emailPendente: true });
    const token = gerarToken({ id: instrutor.id, role: 'instrutor', email: instrutor.email });
    return res.status(200).json({ token, user: { ...semSenha(instrutor), role: 'instrutor' } });
  }

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
      user: { ...semSenha(aluno), role: 'aluno', instrutor_nome: instrutor?.nome || '', avatar_initials: aluno.nome.slice(0, 2).toUpperCase() },
    });
  }

  if (url === 'instrutor/cadastro' && method === 'POST') {
    try {
      const { nome, email, senha, cref, telefone } = body;
      console.log('[API] Cadastro instrutor recebido:', { nome, email, cref: cref ? 'sim' : 'não', telefone: telefone ? 'sim' : 'não' });
      
      if (!nome || !email || !senha) {
        console.log('[API] Erro: campos obrigatórios faltando');
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }
      
      const existe = await DB.findInstrutorByEmail(email);
      if (existe && existe.email_verificado !== false) {
        console.log('[API] Erro: email já cadastrado');
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }
      
      if (existe && existe.email_verificado === false) {
        console.log('[API] Email existe mas não verificado, reenviando código');
        const codigo = gerarOTP();
        await DB.setOTPInstrutor(existe.id, codigo);
        const emailEnviado = await enviarEmailOTP(email, existe.nome, codigo);
        console.log('[API] Código reenviado:', { enviado: emailEnviado });
        return res.status(200).json({ emailEnviado: true, email, mensagem: emailEnviado ? 'Código reenviado para seu email.' : 'Código gerado. Se não receber o email, tente reenviar.' });
      }
      
      console.log('[API] Criando novo instrutor...');
      const senha_hash = await bcrypt.hash(senha, 10);
      const codigo_convite = DB.gerarCodigo(nome);
      const novo = await DB.createInstrutor({ nome, email, senha_hash, cref: cref || '', telefone: telefone || '', pix_chave: email, codigo_convite, plano: 'free', ativo: true });
      console.log('[API] Instrutor criado:', novo.id);
      
      const codigo = gerarOTP();
      await DB.setOTPInstrutor(novo.id, codigo);
      console.log('[API] Código OTP salvo');
      
      const emailEnviado = await enviarEmailOTP(email, nome, codigo);
      console.log('[API] Email enviado:', { enviado: emailEnviado, email });
      
      return res.status(201).json({ emailEnviado: true, email, mensagem: emailEnviado ? 'Código de ativação enviado para seu email.' : 'Código gerado. Se não receber o email, tente reenviar.' });
    } catch (err) {
      console.error('[API] Erro no cadastro:', err.message);
      return res.status(500).json({ erro: `Erro interno: ${err.message}` });
    }
  }

  if (url === 'instrutor/verificar-email' && method === 'POST') {
    const { email, codigo } = body;
    if (!email || !codigo) return res.status(400).json({ erro: 'Email e código obrigatórios' });
    const instrutor = await DB.verificarOTPInstrutor(email, codigo.trim());
    if (!instrutor) return res.status(400).json({ erro: 'Código inválido ou expirado. Solicite um novo código.' });
    const token = gerarToken({ id: instrutor.id, role: 'instrutor', email: instrutor.email });
    return res.status(200).json({ token, user: { ...semSenha(instrutor), role: 'instrutor', avatar_initials: instrutor.nome.slice(0, 2).toUpperCase() } });
  }

  if (url === 'instrutor/reenviar-codigo' && method === 'POST') {
    const { email } = body;
    if (!email) return res.status(400).json({ erro: 'Email obrigatório' });
    const instrutor = await DB.findInstrutorNaoVerificado(email);
    if (!instrutor) return res.status(404).json({ erro: 'Nenhuma conta pendente de verificação encontrada.' });
    const codigo = gerarOTP();
    await DB.setOTPInstrutor(instrutor.id, codigo);
    await enviarEmailOTP(email, instrutor.nome, codigo);
    return res.status(200).json({ mensagem: 'Novo código enviado para seu email.' });
  }

  if (url === 'aluno/cadastro' && method === 'POST') {
    const { nome, email, senha, codigo_instrutor, peso, altura, objetivo } = body;
    if (!nome || !email || !senha || !codigo_instrutor) return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    const instrutor = await DB.findInstrutorByCodigo(codigo_instrutor);
    if (!instrutor) return res.status(404).json({ erro: 'Código de instrutor inválido' });
    const existe = await DB.findAlunoByEmail(email);
    if (existe) return res.status(409).json({ erro: 'Email já cadastrado' });
    const senha_hash = await bcrypt.hash(senha, 10);
    const novo = await DB.createAluno({ nome, email, senha_hash, instrutor_id: instrutor.id, peso: peso || 70, altura: altura || 170, objetivo: objetivo || 'hipertrofia', nivel_treino: 'iniciante' });
    const token = gerarToken({ id: novo.id, role: 'aluno', email: novo.email });
    return res.status(201).json({ token, user: { ...semSenha(novo), role: 'aluno', instrutor_nome: instrutor.nome, avatar_initials: nome.slice(0, 2).toUpperCase() } });
  }

  if (url === 'validar-codigo' && method === 'POST') {
    const { codigo } = body;
    if (!codigo) return res.status(400).json({ erro: 'Código obrigatório' });
    const instrutor = await DB.findInstrutorByCodigo(codigo);
    if (!instrutor) return res.status(404).json({ valido: false, erro: 'Código inválido' });
    return res.status(200).json({ valido: true, instrutor_nome: instrutor.nome });
  }

  if (url === 'esqueci-senha' && method === 'POST') {
    return res.status(200).json({ mensagem: 'Se o email existir, você receberá as instruções em breve.' });
  }

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
      return res.status(200).json({ user: { ...semSenha(aluno), role: 'aluno', instrutor_nome: instrutor?.nome || '', avatar_initials: aluno.nome.slice(0, 2).toUpperCase() } });
    }
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
