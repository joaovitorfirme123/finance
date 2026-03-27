import { pgTable, text, numeric, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const entryTypeEnum = pgEnum("entry_type", ["income", "expense"])
export const reportStatusEnum = pgEnum("report_status", ["partial", "final"])

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Categories ──────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // null = sistema
  name: text("name").notNull(),
  type: entryTypeEnum("type").notNull(),
  color: text("color").notNull(),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Fixed Entries ────────────────────────────────────────────────────────────

export const fixedEntries = pgTable("fixed_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id),
  type: entryTypeEnum("type").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  startMonth: text("start_month").notNull(), // formato YYYY-MM
  endMonth: text("end_month"),               // formato YYYY-MM, null = indefinido
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Occasional Entries ───────────────────────────────────────────────────────

export const occasionalEntries = pgTable("occasional_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id),
  type: entryTypeEnum("type").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export const monthlyReports = pgTable("monthly_reports", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: integer("month").notNull(),           // 1–12
  year: integer("year").notNull(),
  status: reportStatusEnum("status").notNull(),
  totalIncome: numeric("total_income", { precision: 12, scale: 2 }).notNull(),
  totalExpenses: numeric("total_expenses", { precision: 12, scale: 2 }).notNull(),
  netBalance: numeric("net_balance", { precision: 12, scale: 2 }).notNull(),
  // JSON com CategoryBreakdown[] — armazenado como JSONB para flexibilidade nos gráficos
  expensesByCategory: text("expenses_by_category").notNull().default("[]"),
  incomesByCategory: text("incomes_by_category").notNull().default("[]"),
  referenceStartDate: timestamp("reference_start_date").notNull(),
  referenceEndDate: timestamp("reference_end_date").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type FixedEntry = typeof fixedEntries.$inferSelect
export type NewFixedEntry = typeof fixedEntries.$inferInsert

export type OccasionalEntry = typeof occasionalEntries.$inferSelect
export type NewOccasionalEntry = typeof occasionalEntries.$inferInsert

export type MonthlyReport = typeof monthlyReports.$inferSelect
export type NewMonthlyReport = typeof monthlyReports.$inferInsert

export type CategoryBreakdown = {
  categoryId: string
  categoryName: string
  color: string
  total: number
  percentage: number
}
