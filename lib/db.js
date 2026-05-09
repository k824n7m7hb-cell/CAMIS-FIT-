// lib/db.js
// Camis FIT — PostgreSQL (Supabase / Neon / Railway)
// Substitui o banco em memória — dados persistentes no Vercel

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('[CamisFIT] DATABASE_URL não configurada. Configure a variável de ambiente.');
}

const connStr = (process.env.DATABASE_URL || '').replace('sslmode=require', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Roda uma vez por cold-start; idempotente (IF NOT EXISTS)
const migrationReady = pool.query(`
  ALTER TABLE instrutores
    ADD COLUMN IF NOT EXISTS email_verificado   BOOLEAN   DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS codigo_verificacao VARCHAR(6),
    ADD COLUMN IF NOT EXISTS codigo_expira      TIMESTAMP
`).catch(err => console.warn('[DB] Auto-migration:', err.message));

const q = async (text, params) => {
  await migrationReady;
  return pool.query(text, params);
};

const gerarCodigo = (nome) => {
  const prefix = nome.split(' ')[0].toUpperCase().slice(0, 3);
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${num}`;
};

const DB = {
  gerarCodigo,

  // ── Instrutores ────────────────────────────────────
  findInstrutorByEmail: async (email) => {
    const { rows } = await q('SELECT * FROM instrutores WHERE email = $1 LIMIT 1', [email]);
    return rows[0] || null;
  },

  findInstrutorById: async (id) => {
    const { rows } = await q('SELECT * FROM instrutores WHERE id = $1 LIMIT 1', [id]);
    return rows[0] || null;
  },

  findInstrutorByCodigo: async (codigo) => {
    const { rows } = await q('SELECT * FROM instrutores WHERE codigo_convite = $1 LIMIT 1', [codigo]);
    return rows[0] || null;
  },

  createInstrutor: async ({ nome, email, senha_hash, cref, telefone, pix_chave, codigo_convite, plano, ativo }) => {
    const { rows } = await q(
      `INSERT INTO instrutores (nome, email, senha_hash, cref, telefone, pix_chave, codigo_convite, plano, ativo, email_verificado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE) RETURNING *`,
      [nome, email, senha_hash, cref || '', telefone || '', pix_chave || email, codigo_convite, plano || 'free', ativo !== false]
    );
    return rows[0];
  },

  ativarInstrutor: async (id) => {
    await q(
      'UPDATE instrutores SET email_verificado = TRUE, atualizado_em = NOW() WHERE id = $1',
      [id]
    );
  },

  setOTPInstrutor: async (id, codigo) => {
    const expira = new Date(Date.now() + 30 * 60 * 1000);
    await q(
      'UPDATE instrutores SET codigo_verificacao = $1, codigo_expira = $2 WHERE id = $3',
      [codigo, expira.toISOString(), id]
    );
  },

  verificarOTPInstrutor: async (email, codigo) => {
    const { rows } = await q(
      `SELECT * FROM instrutores
       WHERE email = $1 AND codigo_verificacao = $2 AND codigo_expira > NOW() LIMIT 1`,
      [email, codigo]
    );
    if (!rows[0]) return null;
    await q(
      `UPDATE instrutores
       SET email_verificado = TRUE, codigo_verificacao = NULL, codigo_expira = NULL, atualizado_em = NOW()
       WHERE id = $1`,
      [rows[0].id]
    );
    return rows[0];
  },

  findInstrutorNaoVerificado: async (email) => {
    const { rows } = await q(
      'SELECT * FROM instrutores WHERE email = $1 AND email_verificado = FALSE LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  updateInstrutor: async (id, data) => {
    const allowed = ['nome', 'cref', 'telefone', 'pix_chave', 'codigo_convite', 'plano', 'ativo'];
    const keys = Object.keys(data).filter(k => allowed.includes(k) && data[k] !== undefined);
    if (keys.length === 0) {
      const { rows } = await q('SELECT * FROM instrutores WHERE id = $1', [id]);
      return rows[0];
    }
    const vals = keys.map(k => data[k]);
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await q(
      `UPDATE instrutores SET ${set}, atualizado_em = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...vals, id]
    );
    return rows[0];
  },

  // ── Alunos ────────────────────────────────────────
  findAlunoByEmail: async (email) => {
    const { rows } = await q('SELECT * FROM alunos WHERE email = $1 LIMIT 1', [email]);
    return rows[0] || null;
  },

  findAlunoById: async (id) => {
    const { rows } = await q('SELECT * FROM alunos WHERE id = $1 LIMIT 1', [id]);
    return rows[0] || null;
  },

  findAlunosByInstrutor: async (instrutor_id) => {
    const { rows } = await q(
      'SELECT * FROM alunos WHERE instrutor_id = $1 ORDER BY nome',
      [instrutor_id]
    );
    return rows;
  },

  createAluno: async ({ nome, email, senha_hash, instrutor_id, peso, altura, objetivo, nivel_treino }) => {
    const { rows } = await q(
      `INSERT INTO alunos (nome, email, senha_hash, instrutor_id, peso, peso_inicial, altura, objetivo, nivel_treino)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nome, email, senha_hash, instrutor_id, peso || 70, peso || 70, altura || 170, objetivo || 'hipertrofia', nivel_treino || 'iniciante']
    );
    return rows[0];
  },

  updateAluno: async (id, data) => {
    const allowed = ['nome', 'email', 'peso', 'peso_inicial', 'altura', 'percentual_gordura', 'objetivo', 'nivel_treino', 'nivel_gamif', 'xp', 'ativo', 'push_token', 'instrutor_id'];
    const keys = Object.keys(data).filter(k => allowed.includes(k) && data[k] !== undefined);
    if (keys.length === 0) {
      const { rows } = await q('SELECT * FROM alunos WHERE id = $1', [id]);
      return rows[0];
    }
    const vals = keys.map(k => data[k]);
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await q(
      `UPDATE alunos SET ${set}, atualizado_em = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...vals, id]
    );
    return rows[0];
  },

  incrementarXP: async (id, xp_ganho) => {
    const { rows } = await q(
      'UPDATE alunos SET xp = COALESCE(xp, 0) + $1, atualizado_em = NOW() WHERE id = $2 RETURNING *',
      [xp_ganho, id]
    );
    return rows[0];
  },

  // ── Fichas de treino ──────────────────────────────
  findFichasByInstrutor: async (instrutor_id) => {
    const { rows } = await q(
      `SELECT f.*,
        COALESCE(json_agg(e.* ORDER BY e.ordem) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercicios,
        COALESCE(
          ARRAY(SELECT af.aluno_id::text FROM aluno_fichas af WHERE af.ficha_id = f.id AND af.ativo = true),
          '{}'
        ) AS alunos_vinculados
       FROM fichas_treino f
       LEFT JOIN exercicios e ON e.ficha_id = f.id
       WHERE f.instrutor_id = $1
       GROUP BY f.id
       ORDER BY f.criado_em DESC`,
      [instrutor_id]
    );
    return rows;
  },

  findFichasByAluno: async (aluno_id) => {
    const { rows } = await q(
      `SELECT f.*,
        COALESCE(json_agg(e.* ORDER BY e.ordem) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercicios
       FROM fichas_treino f
       JOIN aluno_fichas af ON af.ficha_id = f.id AND af.aluno_id = $1 AND af.ativo = true
       LEFT JOIN exercicios e ON e.ficha_id = f.id
       GROUP BY f.id
       ORDER BY f.criado_em DESC`,
      [aluno_id]
    );
    return rows;
  },

  findFichaById: async (id) => {
    const { rows } = await q(
      `SELECT f.*,
        COALESCE(json_agg(e.* ORDER BY e.ordem) FILTER (WHERE e.id IS NOT NULL), '[]') AS exercicios,
        COALESCE(
          ARRAY(SELECT af.aluno_id::text FROM aluno_fichas af WHERE af.ficha_id = f.id AND af.ativo = true),
          '{}'
        ) AS alunos_vinculados
       FROM fichas_treino f
       LEFT JOIN exercicios e ON e.ficha_id = f.id
       WHERE f.id = $1
       GROUP BY f.id`,
      [id]
    );
    return rows[0] || null;
  },

  createFicha: async ({ instrutor_id, titulo, descricao, nivel, duracao_min, exercicios = [] }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO fichas_treino (instrutor_id, titulo, descricao, nivel, duracao_min)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [instrutor_id, titulo, descricao || '', nivel || 'intermediario', duracao_min || 60]
      );
      const ficha = rows[0];
      for (let i = 0; i < exercicios.length; i++) {
        const ex = exercicios[i];
        await client.query(
          `INSERT INTO exercicios (ficha_id, nome, grupo_muscular, series, repeticoes, descanso, observacao, ordem)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [ficha.id, ex.nome, ex.grupo_muscular || ex.grupoMuscular || '', ex.series || '3', ex.repeticoes || '12', ex.descanso || '60s', ex.observacao || '', i]
        );
      }
      await client.query('COMMIT');
      return { ...ficha, exercicios, alunos_vinculados: [] };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  updateFicha: async (id, data) => {
    const allowed = ['titulo', 'descricao', 'nivel', 'duracao_min'];
    const keys = Object.keys(data).filter(k => allowed.includes(k) && data[k] !== undefined);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (keys.length > 0) {
        const vals = keys.map(k => data[k]);
        const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        await client.query(
          `UPDATE fichas_treino SET ${set}, atualizado_em = NOW() WHERE id = $${keys.length + 1}`,
          [...vals, id]
        );
      }
      if (data.exercicios && Array.isArray(data.exercicios)) {
        await client.query('DELETE FROM exercicios WHERE ficha_id = $1', [id]);
        for (let i = 0; i < data.exercicios.length; i++) {
          const ex = data.exercicios[i];
          await client.query(
            `INSERT INTO exercicios (ficha_id, nome, grupo_muscular, series, repeticoes, descanso, observacao, ordem)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [id, ex.nome, ex.grupo_muscular || ex.grupoMuscular || '', ex.series || '3', ex.repeticoes || '12', ex.descanso || '60s', ex.observacao || '', i]
          );
        }
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    return DB.findFichaById(id);
  },

  deleteFicha: async (id) => {
    await q('DELETE FROM fichas_treino WHERE id = $1', [id]);
    return true;
  },

  vincularFichaAluno: async (ficha_id, aluno_id) => {
    await q(
      `INSERT INTO aluno_fichas (ficha_id, aluno_id, ativo)
       VALUES ($1,$2,true)
       ON CONFLICT (aluno_id, ficha_id) DO UPDATE SET ativo = true, enviado_em = NOW()`,
      [ficha_id, aluno_id]
    );
    return true;
  },

  // ── Faturas ───────────────────────────────────────
  findFaturasByInstrutor: async (instrutor_id) => {
    const { rows } = await q(
      `SELECT f.*, a.nome AS aluno_nome
       FROM faturas f
       JOIN alunos a ON a.id = f.aluno_id
       WHERE f.instrutor_id = $1
       ORDER BY f.criado_em DESC`,
      [instrutor_id]
    );
    return rows;
  },

  findFaturasByAluno: async (aluno_id) => {
    const { rows } = await q(
      'SELECT * FROM faturas WHERE aluno_id = $1 ORDER BY vencimento DESC',
      [aluno_id]
    );
    return rows;
  },

  createFatura: async ({ instrutor_id, aluno_id, tipo, descricao, valor, vencimento }) => {
    const { rows } = await q(
      `INSERT INTO faturas (instrutor_id, aluno_id, tipo, descricao, valor, vencimento)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [instrutor_id, aluno_id, tipo || 'mensalidade', descricao || '', parseFloat(valor), vencimento]
    );
    return rows[0];
  },

  updateFatura: async (id, data) => {
    const allowed = ['status', 'pago_em', 'metodo_pag', 'externo_id'];
    const keys = Object.keys(data).filter(k => allowed.includes(k) && data[k] !== undefined);
    if (keys.length === 0) {
      const { rows } = await q('SELECT * FROM faturas WHERE id = $1', [id]);
      return rows[0];
    }
    const vals = keys.map(k => data[k]);
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await q(
      `UPDATE faturas SET ${set}, atualizado_em = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...vals, id]
    );
    return rows[0];
  },

  // ── Evolução ──────────────────────────────────────
  findEvolucaoByAluno: async (aluno_id) => {
    const { rows } = await q(
      'SELECT * FROM evolucao WHERE aluno_id = $1 ORDER BY data ASC',
      [aluno_id]
    );
    return rows;
  },

  createEvolucao: async ({ aluno_id, data, peso, gordura, observacao }) => {
    const { rows } = await q(
      `INSERT INTO evolucao (aluno_id, data, peso, gordura, observacao)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [aluno_id, data || new Date().toISOString().split('T')[0], peso, gordura || null, observacao || '']
    );
    return rows[0];
  },

  // ── Sessões de treino ─────────────────────────────
  createSessao: async (aluno_id, ficha_id) => {
    const { rows } = await q(
      'INSERT INTO sessoes_treino (aluno_id, ficha_id) VALUES ($1,$2) RETURNING *',
      [aluno_id, ficha_id]
    );
    return rows[0];
  },

  finalizarSessao: async (sessao_id, xp_ganho) => {
    const { rows } = await q(
      'UPDATE sessoes_treino SET finalizado_em = NOW(), xp_ganho = $1 WHERE id = $2 RETURNING *',
      [xp_ganho, sessao_id]
    );
    return rows[0];
  },

  contarSessoesAluno: async (aluno_id) => {
    const { rows } = await q(
      'SELECT COUNT(*)::int AS total FROM sessoes_treino WHERE aluno_id = $1 AND finalizado_em IS NOT NULL',
      [aluno_id]
    );
    return rows[0]?.total || 0;
  },

  // ── Chat Camila ───────────────────────────────────
  saveMensagem: async ({ aluno_id, remetente, conteudo }) => {
    const { rows } = await q(
      'INSERT INTO chat_camila (aluno_id, remetente, conteudo) VALUES ($1,$2,$3) RETURNING *',
      [aluno_id, remetente, conteudo]
    );
    return rows[0];
  },

  getHistoricoChat: async (aluno_id, limit = 10) => {
    const { rows } = await q(
      `SELECT * FROM (
         SELECT * FROM chat_camila WHERE aluno_id = $1 ORDER BY criado_em DESC LIMIT $2
       ) sub ORDER BY criado_em ASC`,
      [aluno_id, limit]
    );
    return rows;
  },

  // ── Notificações ──────────────────────────────────
  createNotificacao: async ({ aluno_id, tipo, titulo, corpo }) => {
    const { rows } = await q(
      'INSERT INTO notificacoes (aluno_id, tipo, titulo, corpo) VALUES ($1,$2,$3,$4) RETURNING *',
      [aluno_id, tipo, titulo, corpo]
    );
    return rows[0];
  },

  findNotificacoesByAluno: async (aluno_id) => {
    const { rows } = await q(
      'SELECT * FROM notificacoes WHERE aluno_id = $1 ORDER BY criado_em DESC LIMIT 20',
      [aluno_id]
    );
    return rows;
  },

  marcarNotificacaoLida: async (id) => {
    await q('UPDATE notificacoes SET lida = true WHERE id = $1', [id]);
    return true;
  },
};

module.exports = DB;
