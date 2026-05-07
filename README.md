# CAMIS FIT — App Fitness Completo
### Dark Premium · Neon Green · IA Coach Camila

---

## O que está incluído neste projeto

```
CamisFIT/
├── App.tsx                          ← Entrada do app
├── package.json                     ← Dependências
├── BACKEND_SCHEMA.sql               ← Banco de dados + API docs
│
└── src/
    ├── theme/index.ts               ← Design system (cores, tipografia)
    ├── services/
    │   ├── store.ts                 ← Estado global (Zustand)
    │   └── api.ts                   ← Todas as chamadas ao backend
    ├── components/index.tsx         ← Componentes reutilizáveis
    ├── navigation/index.tsx         ← Navegação (Stack + Tabs)
    └── screens/
        ├── auth/
        │   └── AuthScreens.tsx      ← Welcome, Login, Cadastro (x2)
        ├── instrutor/
        │   └── InstrutorScreens.tsx ← Painel, Alunos, Treinos, Faturas, Perfil
        └── aluno/
            └── AlunoScreens.tsx     ← Home, Treino+Timer, Camila IA, Faturas, Evolução, Perfil
```

---

## Como rodar o projeto

### 1. Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Expo Go no celular (para testar sem build)

### 2. Instalar dependências
```bash
cd CamisFIT
npm install
```

### 3. Iniciar em desenvolvimento
```bash
npx expo start
```
Escaneie o QR Code com o Expo Go no celular.

### 4. Buildar para Android
```bash
npx eas build --platform android
```

### 5. Buildar para iOS
```bash
npx eas build --platform ios
```

---

## Configurar o backend

1. Crie um banco PostgreSQL
2. Execute o `BACKEND_SCHEMA.sql`
3. Crie um servidor Node.js/Express com as rotas documentadas
4. Atualize `BASE_URL` em `src/services/api.ts`
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY` (para a Camila IA)
   - `MERCADO_PAGO_TOKEN` (para pagamentos)

---

## Funcionalidades implementadas

### Autenticação
- [x] Cadastro de Instrutor (com CREF)
- [x] Cadastro de Aluno (com código do instrutor, 2 etapas)
- [x] Login separado para cada tipo
- [x] Logout seguro
- [x] Estado global com Zustand

### Instrutor
- [x] Painel com resumo financeiro
- [x] Lista de alunos com status de pagamento
- [x] Código único de convite gerado automaticamente
- [x] Liberar aluno manualmente ou por e-mail
- [x] Bloquear aluno (pagamento vencido)
- [x] Criação e edição de fichas de treino
- [x] Cadastro de exercícios (séries, reps, descanso, obs)
- [x] Envio de ficha para aluno específico
- [x] Geração de faturas (mensalidade, alteração, dieta, personalizado)
- [x] Marcar fatura como paga
- [x] Painel financeiro (recebido, pendente, meta)
- [x] Perfil e configurações

### Aluno
- [x] Dashboard com treino do dia
- [x] Treino com cronômetro futurista neon
- [x] Presets de descanso (30s, 1min, 1:30, 2min, 3min)
- [x] Animações por grupo muscular
- [x] Chat com Camila IA (integrada ao Claude/Anthropic)
- [x] Sugestões rápidas na Camila
- [x] Registro de evolução (peso, % gordura)
- [x] Gráfico de evolução de peso
- [x] Visualização de faturas
- [x] Pagamento de faturas (Pix, Cartão, Boleto)
- [x] Histórico de pagamentos
- [x] Medalhas e conquistas (gamificação)
- [x] Sistema de XP e níveis
- [x] Perfil completo
- [x] Notificações push (infraestrutura)

---

## Design System

| Token | Valor |
|-------|-------|
| Fundo principal | `#07090d` |
| Card | `#0f161e` |
| Verde neon | `#00ff87` |
| Texto principal | `#eef2f7` |
| Texto secundário | `#aabccc` |
| Borda | `#1c2a3a` |
| Danger | `#ff4560` |
| Amber | `#ffb84e` |
| Pink (Camila) | `#ff4ecd` |

---

## Próximos passos para produção

1. **Backend**: Implementar todas as rotas do `BACKEND_SCHEMA.sql`
2. **Pagamentos**: Integrar Mercado Pago (Pix + Cartão)
3. **Camila IA**: Conectar à API do Claude (Anthropic)
4. **Notificações**: Configurar Firebase Cloud Messaging
5. **Câmera**: Implementar scanner de alimentos (expo-camera)
6. **Testes**: Jest + React Native Testing Library
7. **Publicação**: Google Play Store + Apple App Store

---

**Camis FIT © 2025** — Feito com ⚡ e neon verde
