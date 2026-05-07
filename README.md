# Camis FIT — Backend API
### Node.js Serverless · Vercel · Claude AI

---

## Como fazer o deploy

### 1. Subir no GitHub
```bash
cd camis-backend
git init
git remote add origin https://github.com/k824n7m7hb-cell/CAMIS-FIT-backend
git add .
git commit -m "Camis FIT - Backend completo"
git branch -M main
git push -u origin main
```

### 2. Deploy na Vercel
- Acesse vercel.com → Add New Project
- Selecione o repositório `CAMIS-FIT-backend`
- Clique em Deploy

### 3. Variáveis de ambiente (Settings → Environment Variables)
| Nome | Valor |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `JWT_SECRET` | `camisfitsecret2025` |
| `NODE_ENV` | `production` |

---

## Endpoints disponíveis

### Auth
- `POST /api/auth/instrutor/login`
- `POST /api/auth/instrutor/cadastro`
- `POST /api/auth/aluno/login`
- `POST /api/auth/aluno/cadastro`
- `POST /api/auth/validar-codigo`

### Instrutor (Bearer Token)
- `GET /api/instrutor/painel`
- `GET /api/instrutor/alunos`
- `POST /api/instrutor/alunos/liberar`
- `GET /api/instrutor/fichas`
- `POST /api/instrutor/fichas`
- `POST /api/instrutor/fichas/:id/enviar`
- `GET /api/instrutor/faturas`
- `POST /api/instrutor/faturas`
- `PATCH /api/instrutor/faturas/:id/pago`

### Aluno (Bearer Token)
- `GET /api/aluno/perfil`
- `GET /api/aluno/treinos`
- `POST /api/aluno/evolucao`
- `GET /api/aluno/faturas`
- `POST /api/aluno/faturas/:id/pagar`

### Camila IA
- `POST /api/ia/camila/chat` ← Powered by Claude
- `POST /api/ia/treino/gerar`
- `POST /api/ia/dieta/gerar`

---

## Usuários de teste
- **Instrutor:** ana@camisfit.com.br / 123456
- **Aluno:** rafael@email.com / 123456
- **Código de convite:** ANA-847

---

## Próximos passos para produção
1. Substituir `lib/db.js` por PostgreSQL (Supabase ou Railway)
2. Integrar Mercado Pago para pagamentos reais
3. Configurar envio de emails (SendGrid / Resend)
4. Implementar push notifications (Expo / Firebase)
