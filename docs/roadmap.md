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
 ├── login/               # já existe
 ├── dashboard/           # página inicial
 ├── entries/             # gerenciamento de lançamentos fixos e ocasionais
 ├── report/              # relatório atual (parcial, do dia 1 até hoje)
 └── history/             # histórico de relatórios mensais anteriores
```

---

## Etapa 4 — API (Server Actions ou Route Handlers)

- [ ] CRUD de `Category` (categorias do usuário)
- [ ] CRUD de `FixedEntry` (lançamentos fixos)
- [ ] CRUD de `OccasionalEntry` (lançamentos ocasionais)
- [ ] Geração de `MonthlyReport` parcial (sob demanda)
- [ ] Geração de `MonthlyReport` final (automático ao encerrar o mês)

---

## Etapa 5 — UI dos Fluxos Principais

- [ ] Dashboard: visão geral do mês atual (saldo, receitas, gastos)
- [ ] Formulário para cadastro e edição de lançamentos fixos
- [ ] Formulário para registro de lançamentos ocasionais
- [ ] Página de relatório atual com gráficos (`recharts`)
- [ ] Página de histórico de relatórios com gráficos por mês

---

## Etapa 6 — Lógica de Relatório

- [ ] Agregar `FixedEntry` + `OccasionalEntry` por mês/ano
- [ ] Calcular `expensesByCategory` e `incomesByCategory` para os gráficos
- [ ] Implementar trigger para geração automática do relatório final (cron job ou on-demand no encerramento do mês)

---

## Status geral

| Etapa | Descrição               | Status      |
|-------|-------------------------|-------------|
| 1     | Banco de dados          | Concluído |
| 2     | Autenticação            | Concluído |
| 3     | Estrutura de rotas      | Não iniciado |
| 4     | API                     | Não iniciado |
| 5     | UI                      | Não iniciado |
| 6     | Lógica de relatório     | Não iniciado |
