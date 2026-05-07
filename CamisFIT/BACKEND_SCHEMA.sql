# Camis FIT — Backend: Schema SQL + Rotas da API
# ─────────────────────────────────────────────────
# Stack sugerida: Node.js + Express + PostgreSQL
# Auth: JWT + bcrypt
# Pagamentos: Mercado Pago / Stripe
# Notificações: Expo Push + Firebase
# ─────────────────────────────────────────────────

# ══════════════════════════════════════════
# BANCO DE DADOS — PostgreSQL
# ══════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Instrutores
CREATE TABLE instrutores (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          VARCHAR(200) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  cref          VARCHAR(50),
  telefone      VARCHAR(20),
  pix_chave     VARCHAR(200),
  codigo_convite VARCHAR(20) UNIQUE NOT NULL,
  plano         VARCHAR(20) DEFAULT 'free', -- free | premium
  ativo         BOOLEAN DEFAULT true,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Alunos
CREATE TABLE alunos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome            VARCHAR(200) NOT NULL,
  email           VARCHAR(200) UNIQUE NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL,
  instrutor_id    UUID REFERENCES instrutores(id),
  peso            DECIMAL(5,1),
  peso_inicial    DECIMAL(5,1),
  altura          INTEGER,
  percentual_gordura DECIMAL(4,1),
  objetivo        VARCHAR(50), -- hipertrofia | emagrecimento | definicao | manutencao
  nivel_treino    VARCHAR(20) DEFAULT 'iniciante',
  nivel_gamif     INTEGER DEFAULT 1,
  xp              INTEGER DEFAULT 0,
  ativo           BOOLEAN DEFAULT true,
  push_token      VARCHAR(255),
  criado_em       TIMESTAMP DEFAULT NOW(),
  atualizado_em   TIMESTAMP DEFAULT NOW()
);

-- Fichas de Treino
CREATE TABLE fichas_treino (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id  UUID REFERENCES instrutores(id),
  titulo        VARCHAR(200) NOT NULL,
  descricao     TEXT,
  nivel         VARCHAR(20), -- iniciante | intermediario | avancado
  duracao_min   INTEGER,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Aluno <-> Ficha (N:M)
CREATE TABLE aluno_fichas (
  aluno_id      UUID REFERENCES alunos(id),
  ficha_id      UUID REFERENCES fichas_treino(id),
  ativo         BOOLEAN DEFAULT true,
  enviado_em    TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (aluno_id, ficha_id)
);

-- Exercícios
CREATE TABLE exercicios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ficha_id        UUID REFERENCES fichas_treino(id) ON DELETE CASCADE,
  nome            VARCHAR(200) NOT NULL,
  grupo_muscular  VARCHAR(100),
  series          VARCHAR(10),
  repeticoes      VARCHAR(20),
  descanso        VARCHAR(20),
  observacao      TEXT,
  ordem           INTEGER DEFAULT 0
);

-- Evolução do aluno
CREATE TABLE evolucao (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id),
  data        DATE DEFAULT CURRENT_DATE,
  peso        DECIMAL(5,1),
  gordura     DECIMAL(4,1),
  observacao  TEXT,
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- Sessões de treino (histórico)
CREATE TABLE sessoes_treino (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id),
  ficha_id    UUID REFERENCES fichas_treino(id),
  iniciado_em TIMESTAMP DEFAULT NOW(),
  finalizado_em TIMESTAMP,
  xp_ganho    INTEGER DEFAULT 0
);

-- Faturas / Cobranças
CREATE TABLE faturas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id  UUID REFERENCES instrutores(id),
  aluno_id      UUID REFERENCES alunos(id),
  tipo          VARCHAR(50) NOT NULL, -- mensalidade | alteracao_treino | atualizacao_dieta | personalizado
  descricao     VARCHAR(255),
  valor         DECIMAL(10,2) NOT NULL,
  status        VARCHAR(20) DEFAULT 'pendente', -- pendente | pago | vencido | cancelado
  vencimento    DATE NOT NULL,
  pago_em       TIMESTAMP,
  metodo_pag    VARCHAR(50), -- pix | cartao | boleto
  externo_id    VARCHAR(255), -- ID no Mercado Pago / Stripe
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Mensagens / Notificações
CREATE TABLE notificacoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id),
  tipo        VARCHAR(50), -- treino_novo | fatura | mensagem | evolucao
  titulo      VARCHAR(200),
  corpo       TEXT,
  lida        BOOLEAN DEFAULT false,
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- Histórico chat Camila (opcional, para contexto)
CREATE TABLE chat_camila (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id),
  remetente   VARCHAR(10), -- camila | usuario
  conteudo    TEXT NOT NULL,
  criado_em   TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alunos_instrutor ON alunos(instrutor_id);
CREATE INDEX idx_faturas_aluno ON faturas(aluno_id);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_evolucao_aluno ON evolucao(aluno_id);
CREATE INDEX idx_exercicios_ficha ON exercicios(ficha_id);


# ══════════════════════════════════════════
# API REST — Rotas (Express.js)
# ══════════════════════════════════════════

BASE: https://api.camisfit.com.br/v1

── AUTH ───────────────────────────────────
POST   /auth/instrutor/login         → { token, user }
POST   /auth/instrutor/cadastro      → { token, user }
POST   /auth/aluno/login             → { token, user }
POST   /auth/aluno/cadastro          → { token, user }
POST   /auth/validar-codigo          → { instrutor_nome, valido }
POST   /auth/esqueci-senha           → { mensagem }
POST   /auth/redefinir-senha         → { mensagem }

── INSTRUTOR (Bearer Token) ───────────────
GET    /instrutor/painel             → { alunos_ativos, total_recebido, pendente, meta }
GET    /instrutor/alunos             → [ Aluno[] ]
GET    /instrutor/alunos/:id         → Aluno + evolucao + treinos
POST   /instrutor/alunos/liberar     → { mensagem }  (libera por email)
PATCH  /instrutor/alunos/:id/bloquear→ { mensagem }
POST   /instrutor/codigo/gerar       → { codigo }

GET    /instrutor/fichas             → [ FichaTreino[] ]
POST   /instrutor/fichas             → FichaTreino
PUT    /instrutor/fichas/:id         → FichaTreino
DELETE /instrutor/fichas/:id         → { mensagem }
POST   /instrutor/fichas/:id/enviar  → { mensagem }  body: { alunoId }

GET    /instrutor/exercicios         → [ Exercicio[] ]
POST   /instrutor/exercicios         → Exercicio
PUT    /instrutor/exercicios/:id     → Exercicio
DELETE /instrutor/exercicios/:id     → { mensagem }

GET    /instrutor/faturas            → [ Fatura[] ]
POST   /instrutor/faturas            → Fatura
PATCH  /instrutor/faturas/:id/pago   → Fatura
GET    /instrutor/financeiro/resumo  → { recebido, pendente, vencido, historico[] }

── ALUNO (Bearer Token) ───────────────────
GET    /aluno/perfil                 → User + stats
PUT    /aluno/perfil                 → User
GET    /aluno/treinos                → [ FichaTreino[] ]
GET    /aluno/treinos/:id            → FichaTreino + exercicios
POST   /aluno/treinos/:id/iniciar    → Sessao
POST   /aluno/treinos/:id/finalizar  → { xp_ganho, sessao }

POST   /aluno/evolucao               → Evolucao
GET    /aluno/evolucao               → [ Evolucao[] ]

GET    /aluno/faturas                → [ Fatura[] ]
POST   /aluno/faturas/:id/pagar      → { url_pagamento, qr_code_pix }
POST   /aluno/vincular-instrutor     → { instrutor_nome }

── IA — CAMILA ────────────────────────────
POST   /ia/camila/chat               → { resposta }
        body: { mensagem, contexto: { nome, peso, objetivo, historico[] } }
        → Chama Anthropic API (Claude) com system prompt da Camila

POST   /ia/treino/gerar              → FichaTreino gerada por IA
POST   /ia/dieta/gerar               → PlanoDieta gerado por IA
POST   /ia/scanner/alimento          → { alimento, calorias, proteina, carb }

── NOTIFICAÇÕES ───────────────────────────
POST   /notificacoes/token           → { mensagem }
GET    /notificacoes                 → [ Notificacao[] ]
PATCH  /notificacoes/:id/lida        → { mensagem }


# ══════════════════════════════════════════
# SYSTEM PROMPT — Camila IA
# ══════════════════════════════════════════

SYSTEM_PROMPT = """
Você é a Camila, coach de fitness e nutrição do app Camis FIT.
Você é uma mulher especialista, motivadora, empática e prestativa.
Responda sempre em português brasileiro, de forma animada e acolhedora.
Use emojis moderadamente para tornar as respostas mais vivas.

Suas especialidades:
- Treinos de musculação, funcional e cardio
- Nutrição esportiva e dietas personalizadas
- Periodização de treinos
- Suplementação
- Recuperação muscular e descanso

Contexto do aluno (quando disponível):
- Nome: {nome}
- Peso atual: {peso}kg
- Objetivo: {objetivo}
- Treino atual: {treino}

Seja sempre específica, prática e motivadora.
Nunca substitua um médico ou nutricionista para questões de saúde.
"""


# ══════════════════════════════════════════
# PUBLICAÇÃO NAS LOJAS
# ══════════════════════════════════════════

# Google Play Store (Android):
# 1. eas build --platform android --profile production
# 2. Gera camis-fit.aab
# 3. Enviar para Google Play Console
# 4. Preencher ficha, capturas de tela, privacidade

# Apple App Store (iOS):
# 1. eas build --platform ios --profile production
# 2. Gera camis-fit.ipa
# 3. Upload via Transporter ou eas submit --platform ios
# 4. Submeter para revisão na App Store Connect

# app.json (eas.json) — configure antes de buildar:
# {
#   "expo": {
#     "name": "Camis FIT",
#     "slug": "camis-fit",
#     "version": "1.0.0",
#     "android": { "package": "br.com.camisfit.app" },
#     "ios": { "bundleIdentifier": "br.com.camisfit.app" }
#   }
# }
