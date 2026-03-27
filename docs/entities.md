# Entidades do Projeto — Finance

Documentação das entidades de domínio da aplicação de controle financeiro pessoal.

---

## Visão Geral

O fluxo principal da aplicação é:

1. Usuário faz login → acessa a **página inicial**
2. Na página inicial, cadastra **receitas e gastos fixos** (mensais, recorrentes)
3. Ao longo do mês, registra **rendas e gastos ocasionais** (eventos pontuais)
4. Pode solicitar o **relatório parcial** a qualquer momento (com dados do dia 1 até o dia atual)
5. Ao final do mês, um **relatório mensal final** é gerado automaticamente com gráficos
6. Na **página de histórico**, o usuário acessa os relatórios e gráficos dos meses anteriores

---

## Entidades

### 1. `User` — Usuário

Representa a conta do usuário na plataforma.

| Campo          | Tipo      | Descrição                              |
|----------------|-----------|----------------------------------------|
| `id`           | `string`  | Identificador único (UUID)             |
| `name`         | `string`  | Nome completo do usuário               |
| `email`        | `string`  | E-mail (único, usado no login)         |
| `passwordHash` | `string`  | Senha armazenada em hash (bcrypt)      |
| `createdAt`    | `Date`    | Data de criação da conta               |
| `updatedAt`    | `Date`    | Data da última atualização             |

---

### 2. `Category` — Categoria

Categorias usadas para classificar receitas e gastos. Cada usuário pode ter as suas próprias categorias além das categorias padrão do sistema.

| Campo       | Tipo                    | Descrição                                      |
|-------------|-------------------------|------------------------------------------------|
| `id`        | `string`                | Identificador único (UUID)                     |
| `userId`    | `string \| null`        | FK → `User`. `null` se for categoria do sistema |
| `name`      | `string`                | Nome da categoria (ex: "Alimentação", "Salário") |
| `type`      | `'income' \| 'expense'` | Se é categoria de receita ou de gasto          |
| `color`     | `string`                | Cor em hexadecimal (ex: `#4ade80`)             |
| `icon`      | `string \| null`        | Nome do ícone (ex: nome do ícone Lucide)       |
| `createdAt` | `Date`                  | Data de criação                                |

---

### 3. `FixedEntry` — Lançamento Fixo

Receitas e gastos que se repetem todo mês (ex: salário, aluguel, plano de saúde). São cadastrados uma vez e aplicados automaticamente a cada ciclo mensal.

| Campo         | Tipo                    | Descrição                                                 |
|---------------|-------------------------|-----------------------------------------------------------|
| `id`          | `string`                | Identificador único (UUID)                                |
| `userId`      | `string`                | FK → `User`                                               |
| `categoryId`  | `string`                | FK → `Category`                                           |
| `type`        | `'income' \| 'expense'` | Se é uma receita fixa ou um gasto fixo                    |
| `description` | `string`                | Descrição (ex: "Aluguel", "Salário CLT")                  |
| `amount`      | `number`                | Valor em reais (positivo)                                 |
| `dayOfMonth`  | `number`                | Dia do mês em que o lançamento ocorre (1–31)              |
| `isActive`    | `boolean`               | Se o lançamento fixo está ativo                           |
| `startMonth`  | `string`                | Mês de início no formato `YYYY-MM`                        |
| `endMonth`    | `string \| null`        | Mês de encerramento no formato `YYYY-MM`. `null` = indefinido |
| `createdAt`   | `Date`                  | Data de criação do registro                               |
| `updatedAt`   | `Date`                  | Data da última atualização                                |

---

### 4. `OccasionalEntry` — Lançamento Ocasional

Receitas e gastos pontuais que o usuário registra manualmente ao longo do mês (ex: uma compra inesperada, uma renda extra, um presente).

| Campo         | Tipo                    | Descrição                                       |
|---------------|-------------------------|-------------------------------------------------|
| `id`          | `string`                | Identificador único (UUID)                      |
| `userId`      | `string`                | FK → `User`                                     |
| `categoryId`  | `string`                | FK → `Category`                                 |
| `type`        | `'income' \| 'expense'` | Se é uma renda ou um gasto ocasional            |
| `description` | `string`                | Descrição do lançamento                         |
| `amount`      | `number`                | Valor em reais (positivo)                       |
| `date`        | `Date`                  | Data em que o evento ocorreu                    |
| `createdAt`   | `Date`                  | Data de criação do registro                     |
| `updatedAt`   | `Date`                  | Data da última atualização                      |

---

### 5. `MonthlyReport` — Relatório Mensal

Consolida todas as receitas e gastos (fixos e ocasionais) de um determinado mês para um usuário. Pode ser **parcial** (solicitado durante o mês) ou **final** (gerado automaticamente ao encerrar o mês).

| Campo                  | Tipo                      | Descrição                                                           |
|------------------------|---------------------------|---------------------------------------------------------------------|
| `id`                   | `string`                  | Identificador único (UUID)                                          |
| `userId`               | `string`                  | FK → `User`                                                         |
| `month`                | `number`                  | Mês de referência (1–12)                                            |
| `year`                 | `number`                  | Ano de referência                                                   |
| `status`               | `'partial' \| 'final'`    | `partial` = solicitado durante o mês; `final` = encerramento mensal |
| `totalIncome`          | `number`                  | Soma total de receitas do mês                                       |
| `totalExpenses`        | `number`                  | Soma total de gastos do mês                                         |
| `netBalance`           | `number`                  | Saldo líquido (`totalIncome - totalExpenses`)                       |
| `expensesByCategory`   | `CategoryBreakdown[]`     | Detalhamento dos gastos por categoria (usado nos gráficos)          |
| `incomesByCategory`    | `CategoryBreakdown[]`     | Detalhamento das receitas por categoria                             |
| `referenceStartDate`   | `Date`                    | Data inicial do período coberto (sempre dia 1 do mês)               |
| `referenceEndDate`     | `Date`                    | Data final do período coberto (dia de geração ou último dia do mês) |
| `generatedAt`          | `Date`                    | Data e hora em que o relatório foi gerado                           |

#### Tipo auxiliar: `CategoryBreakdown`

```ts
type CategoryBreakdown = {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number // em relação ao total de receitas ou gastos
}
```

---

## Relacionamentos

```
User
 ├── tem muitos → FixedEntry
 ├── tem muitos → OccasionalEntry
 ├── tem muitos → MonthlyReport
 └── tem muitas → Category (próprias)

Category
 ├── pertence a → User (ou é do sistema se userId = null)
 ├── classifica → FixedEntry
 └── classifica → OccasionalEntry

MonthlyReport
 └── agrega → FixedEntry + OccasionalEntry do mesmo mês/ano
```

---

## Páginas e entidades relacionadas

| Página                  | Entidades envolvidas                       |
|-------------------------|--------------------------------------------|
| Login                   | `User`                                     |
| Página inicial          | `FixedEntry`, `OccasionalEntry`, `Category`|
| Relatório atual         | `MonthlyReport` (status: `partial`)        |
| Relatório final do mês  | `MonthlyReport` (status: `final`)          |
| Histórico de relatórios | `MonthlyReport` (todos os meses anteriores)|
