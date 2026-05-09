// api/ia.js — Camis FIT Camila IA (Claude + PostgreSQL)

const Anthropic = require('@anthropic-ai/sdk');
const DB = require('../lib/db');
const { autenticar, handler } = require('../lib/auth');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CAMILA_SYSTEM = `Você é a Camila, coach de fitness e nutrição do app Camis FIT.
Você é uma mulher especialista, motivadora, empática e muito prestativa.
Responda sempre em português brasileiro, de forma animada e acolhedora.
Use emojis moderadamente para tornar as respostas mais vivas.

Suas especialidades:
- Treinos de musculação, funcional e cardio
- Nutrição esportiva e dietas personalizadas
- Periodização de treinos
- Suplementação esportiva
- Recuperação muscular e descanso
- Motivação e acompanhamento fitness

Seja sempre específica, prática e motivadora.
Mantenha respostas concisas (máximo 150 palavras) a menos que seja pedido algo detalhado.
Nunca substitua um médico ou nutricionista para questões de saúde sérias.`;

module.exports = handler(async (req, res) => {
  const user = autenticar(req);
  if (!user) return res.status(401).json({ erro: 'Não autorizado' });

  const url = req.url.split('?')[0].replace('/api/ia/', '').replace('/api/ia', '');
  const method = req.method;
  const body = req.body || {};

  if (url === 'camila/chat' && method === 'POST') {
    const { mensagem } = body;
    if (!mensagem) return res.status(400).json({ erro: 'Mensagem obrigatória' });

    let systemCtx = CAMILA_SYSTEM;
    if (user.role === 'aluno') {
      const aluno = await DB.findAlunoById(user.id);
      if (aluno) systemCtx += `\n\nContexto do aluno: Nome: ${aluno.nome}, Peso: ${aluno.peso}kg, Objetivo: ${aluno.objetivo}, Nível: ${aluno.nivel_treino}`;
    }

    const historico = await DB.getHistoricoChat(user.id, 6);
    const messages = [
      ...historico.map(m => ({ role: m.remetente === 'camila' ? 'assistant' : 'user', content: m.conteudo })),
      { role: 'user', content: mensagem },
    ];

    try {
      const response = await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 400, system: systemCtx, messages });
      const resposta = response.content[0].text;
      await Promise.all([
        DB.saveMensagem({ aluno_id: user.id, remetente: 'usuario', conteudo: mensagem }),
        DB.saveMensagem({ aluno_id: user.id, remetente: 'camila', conteudo: resposta }),
      ]);
      return res.status(200).json({ resposta });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao comunicar com a Camila IA', detalhes: err.message });
    }
  }

  if (url === 'treino/gerar' && method === 'POST') {
    const { nivel, objetivo, dias_semana, grupos_musculares } = body;
    const prompt = `Crie uma ficha de treino completa em JSON para:
- Nível: ${nivel || 'intermediario'}
- Objetivo: ${objetivo || 'hipertrofia'}
- Dias por semana: ${dias_semana || 3}
- Grupos musculares: ${grupos_musculares?.join(', ') || 'corpo todo'}

Responda APENAS com JSON válido no formato:
{"titulo":"Nome","descricao":"Descrição","nivel":"${nivel || 'intermediario'}","duracao_min":50,"exercicios":[{"nome":"Exercício","series":"4","repeticoes":"10-12","descanso":"90s","grupo_muscular":"Peito","observacao":"Dica"}]}`;
    try {
      const response = await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] });
      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON inválido');
      return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao gerar treino', detalhes: err.message });
    }
  }

  if (url === 'dieta/gerar' && method === 'POST') {
    const { peso, altura, objetivo, rotina, orcamento, restricoes } = body;
    const prompt = `Crie um plano alimentar em JSON para peso:${peso}kg altura:${altura}cm objetivo:${objetivo} rotina:${rotina} orçamento:${orcamento} restrições:${restricoes?.join(',') || 'nenhuma'}. Responda APENAS JSON: {"calorias_diarias":2500,"proteina_g":150,"carboidrato_g":300,"gordura_g":70,"refeicoes":[{"horario":"7h","alimentos":"Lista","calorias":500,"proteina_g":35,"carboidrato_g":60}]}`;
    try {
      const response = await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] });
      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON inválido');
      return res.status(200).json(JSON.parse(jsonMatch[0]));
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao gerar dieta', detalhes: err.message });
    }
  }

  if (url === 'scanner/alimento' && method === 'POST') {
    return res.status(200).json({ alimento: 'Frango grelhado', porcao: '100g', calorias: 165, proteina_g: 31, carboidrato_g: 0, gordura_g: 3.6 });
  }

  return res.status(404).json({ erro: 'Rota não encontrada' });
});
