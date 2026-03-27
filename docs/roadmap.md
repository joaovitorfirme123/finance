# Roadmap — Finance

Ordem de execução sugerida para o desenvolvimento da aplicação.

---

## Etapa 1 — Banco de Dados

- [ ] Escolher banco de dados (PostgreSQL recomendado)
- [ ] Escolher ORM (Prisma ou Drizzle)
- [ ] Criar o schema baseado nas [entidades documentadas](./entities.md)
- [ ] Configurar e rodar as migrations iniciais

---

## Etapa 2 — Autenticação

- [ ] Instalar e configurar Auth.js (NextAuth v5)
- [ ] Implementar fluxo de login com e-mail e senha
- [ ] Armazenar sessão do usuário
- [ ] Criar middleware do Next.js para proteger rotas privadas

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
| 1     | Banco de dados          | Não iniciado |
| 2     | Autenticação            | Não iniciado |
| 3     | Estrutura de rotas      | Não iniciado |
| 4     | API                     | Não iniciado |
| 5     | UI                      | Não iniciado |
| 6     | Lógica de relatório     | Não iniciado |
