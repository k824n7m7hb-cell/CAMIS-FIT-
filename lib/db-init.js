// lib/db-init.js
// Camis FIT — Criação do schema PostgreSQL (roda uma vez)

const { Pool } = require('pg');

const connStr = (process.env.DATABASE_URL || '').replace('sslmode=require', 'sslmode=no-verify');

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
});

const initSchema = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS instrutores (
      id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nome           VARCHAR(200) NOT NULL,
      email          VARCHAR(200) UNIQUE NOT NULL,
      senha_hash     VARCHAR(255) NOT NULL,
      cref           VARCHAR(50),
      telefone       VARCHAR(20),
      pix_chave      VARCHAR(200),
      codigo_convite VARCHAR(20) UNIQUE NOT NULL,
      plano          VARCHAR(20) DEFAULT 'free',
      ativo          BOOLEAN DEFAULT true,
      criado_em      TIMESTAMP DEFAULT NOW(),
      atualizado_em  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      nome               VARCHAR(200) NOT NULL,
      email              VARCHAR(200) UNIQUE NOT NULL,
      senha_hash         VARCHAR(255) NOT NULL,
      instrutor_id       UUID REFERENCES instrutores(id),
      peso               DECIMAL(5,1),
      peso_inicial       DECIMAL(5,1),
      altura             INTEGER,
      percentual_gordura DECIMAL(4,1),
      objetivo           VARCHAR(50),
      nivel_treino       VARCHAR(20) DEFAULT 'iniciante',
      nivel_gamif        INTEGER DEFAULT 1,
      xp                 INTEGER DEFAULT 0,
      ativo              BOOLEAN DEFAULT true,
      push_token         VARCHAR(255),
      criado_em          TIMESTAMP DEFAULT NOW(),
      atualizado_em      TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fichas_treino (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      instrutor_id  UUID REFERENCES instrutores(id) ON DELETE CASCADE,
      titulo        VARCHAR(200) NOT NULL,
      descricao     TEXT,
      nivel         VARCHAR(20),
      duracao_min   INTEGER,
      criado_em     TIMESTAMP DEFAULT NOW(),
      atualizado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS aluno_fichas (
      aluno_id   UUID REFERENCES alunos(id) ON DELETE CASCADE,
      ficha_id   UUID REFERENCES fichas_treino(id) ON DELETE CASCADE,
      ativo      BOOLEAN DEFAULT true,
      enviado_em TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (aluno_id, ficha_id)
    );

    CREATE TABLE IF NOT EXISTS exercicios (
      id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ficha_id       UUID REFERENCES fichas_treino(id) ON DELETE CASCADE,
      nome           VARCHAR(200) NOT NULL,
      grupo_muscular VARCHAR(100),
      series         VARCHAR(10),
      repeticoes     VARCHAR(20),
      descanso       VARCHAR(20),
      observacao     TEXT,
      ordem          INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS evolucao (
      id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      aluno_id   UUID REFERENCES alunos(id) ON DELETE CASCADE,
      data       DATE DEFAULT CURRENT_DATE,
      peso       DECIMAL(5,1),
      gordura    DECIMAL(4,1),
      observacao TEXT,
      criado_em  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessoes_treino (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      aluno_id      UUID REFERENCES alunos(id) ON DELETE CASCADE,
      ficha_id      UUID REFERENCES fichas_treino(id) ON DELETE SET NULL,
      iniciado_em   TIMESTAMP DEFAULT NOW(),
      finalizado_em TIMESTAMP,
      xp_ganho      INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS faturas (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      instrutor_id  UUID REFERENCES instrutores(id),
      aluno_id      UUID REFERENCES alunos(id),
      tipo          VARCHAR(50) NOT NULL,
      descricao     VARCHAR(255),
      valor         DECIMAL(10,2) NOT NULL,
      status        VARCHAR(20) DEFAULT 'pendente',
      vencimento    DATE NOT NULL,
      pago_em       TIMESTAMP,
      metodo_pag    VARCHAR(50),
      externo_id    VARCHAR(255),
      criado_em     TIMESTAMP DEFAULT NOW(),
      atualizado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notificacoes (
      id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      aluno_id  UUID REFERENCES alunos(id) ON DELETE CASCADE,
      tipo      VARCHAR(50),
      titulo    VARCHAR(200),
      corpo     TEXT,
      lida      BOOLEAN DEFAULT false,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_camila (
      id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      aluno_id  UUID REFERENCES alunos(id) ON DELETE CASCADE,
      remetente VARCHAR(10),
      conteudo  TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_alunos_instrutor   ON alunos(instrutor_id);
    CREATE INDEX IF NOT EXISTS idx_faturas_aluno       ON faturas(aluno_id);
    CREATE INDEX IF NOT EXISTS idx_faturas_instrutor   ON faturas(instrutor_id);
    CREATE INDEX IF NOT EXISTS idx_faturas_status      ON faturas(status);
    CREATE INDEX IF NOT EXISTS idx_evolucao_aluno      ON evolucao(aluno_id);
    CREATE INDEX IF NOT EXISTS idx_exercicios_ficha    ON exercicios(ficha_id);
    CREATE INDEX IF NOT EXISTS idx_chat_camila_aluno   ON chat_camila(aluno_id);
    CREATE INDEX IF NOT EXISTS idx_sessoes_aluno       ON sessoes_treino(aluno_id);
    CREATE INDEX IF NOT EXISTS idx_notificacoes_aluno  ON notificacoes(aluno_id);
  `);

  // Migração: colunas de verificação de email (DEFAULT TRUE para não bloquear instrutores existentes)
  await pool.query(`
    ALTER TABLE instrutores
      ADD COLUMN IF NOT EXISTS email_verificado   BOOLEAN   DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS codigo_verificacao VARCHAR(6),
      ADD COLUMN IF NOT EXISTS codigo_expira      TIMESTAMP;
  `);
};

module.exports = initSchema;
