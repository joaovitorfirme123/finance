# Roadmap — Finance

Ordem de execução sugerida para o desenvolvimento da aplicação.

---

## Etapa 1 — Banco de Dados

- [x] Escolher banco de dados (Neon — PostgreSQL serverless)
- [x] Escolher ORM (Drizzle)
- [x] Criar o schema baseado nas [entidades documentadas](./entities.md)
- [x] Rodar a primeira migration (`npm run db:generate && npm run db:migrate`)

---

## Etapa 2 — Autenticação

- [x] Instalar e configurar Auth.js (NextAuth v5)
- [x] Implementar fluxo de login com e-mail e senha (Credentials Provider + bcryptjs)
- [x] Armazenar sessão do usuário (JWT)
- [x] Criar middleware do Next.js para proteger rotas privadas

---

## Etapa 3 — Estrutura de Rotas

Definir e criar as páginas da aplicação seguindo o App Router:

```
app/
 ├── (app)/               # route group — layout compartilhado (header + nav)
 │   ├── dashboard/       # página inicial ✓
 │   ├── entries/         # gerenciamento de lançamentos fixos e ocasionais ✓
 │   ├── report/          # relatório atual (parcial, do dia 1 até hoje) ✓
 │   └── history/         # histórico de relatórios mensais anteriores ✓
 ├── login/               # já existia ✓
 └── signup/              # já existia ✓
```

- [x] Criar route group `(app)` com layout compartilhado (header + nav)
- [x] Componente `AppNav` com destaque do link ativo
- [x] Páginas placeholder para dashboard, entries, report e history

---

## Etapa 4 — API (Server Actions)

- [x] CRUD de `Category` (`src/actions/categories.ts`)
- [x] CRUD de `FixedEntry` (`src/actions/fixed-entries.ts`)
- [x] CRUD de `OccasionalEntry` (`src/actions/occasional-entries.ts`)
- [x] Geração de `MonthlyReport` parcial e final (`src/actions/reports.ts`)

---

## Etapa 5 — UI dos Fluxos Principais

- [x] Dashboard: visão geral do mês atual (saldo, receitas, gastos)
- [x] Formulário para cadastro e edição de lançamentos fixos
- [x] Formulário para registro de lançamentos ocasionais
- [x] Página de relatório atual com gráficos (`recharts`)
- [x] Página de histórico de relatórios com gráficos por mês

---

## Etapa 6 — Lógica de Relatório

- [x] Agregar `FixedEntry` + `OccasionalEntry` por mês/ano
- [x] Calcular `expensesByCategory` e `incomesByCategory` para os gráficos
- [x] Finalização automática on-demand: `finalizePastReportsAction()` chamada ao acessar `/history`
- [x] Cron job via `vercel.json` (`0 3 1 * *`) chamando `GET /api/cron/finalize-reports` (protegido por `CRON_SECRET`)

---

## Status geral

| Etapa | Descrição               | Status      |
|-------|-------------------------|-------------|
| 1     | Banco de dados          | Concluído |
| 2     | Autenticação            | Concluído |
| 3     | Estrutura de rotas      | Concluído |
| 4     | API                     | Concluído |
| 5     | UI                      | Concluído |
| 6     | Lógica de relatório     | Concluído |
