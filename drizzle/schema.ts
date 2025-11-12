import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de orçamentos de bordados
 * Armazena todos os cálculos realizados pelos usuários
 */
export const orcamentos = mysqlTable("orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Referência ao usuário que criou
  
  // Dados do bordado
  forma: varchar("forma", { length: 20 }).notNull(), // "retangular" ou "circular"
  tamanhoA: int("tamanhoA").notNull(), // em cm (multiplicado por 100 para armazenar decimais)
  tamanhoB: int("tamanhoB"), // em cm (multiplicado por 100, null para circular)
  pontos: int("pontos").notNull(),
  cores: int("cores").notNull(),
  fixacao: varchar("fixacao", { length: 20 }).notNull(),
  maquina: varchar("maquina", { length: 20 }).notNull(),
  materialBase: varchar("materialBase", { length: 50 }).notNull(),
  margemPercentual: int("margemPercentual").notNull(), // multiplicado por 100
  quantidade: int("quantidade").notNull(),
  vendaOnline: int("vendaOnline").notNull(), // 0 ou 1 (boolean)
  
  // Resultados do cálculo (armazenados em centavos para precisão)
  custoMateriais: int("custoMateriais").notNull(),
  custoLinha: int("custoLinha").notNull(),
  custoEnergia: int("custoEnergia").notNull(),
  custoPorPontos: int("custoPorPontos").notNull(),
  custoFixacaoAdicional: int("custoFixacaoAdicional").notNull(),
  custoTotalProducao: int("custoTotalProducao").notNull(),
  precoFinalArredondado: int("precoFinalArredondado").notNull(),
  descontoAplicado: int("descontoAplicado").notNull(), // percentual * 100
  precoUnitarioComDesconto: int("precoUnitarioComDesconto").notNull(),
  precoTotal: int("precoTotal").notNull(),
  
  // Informações adicionais
  bastidorSugerido: varchar("bastidorSugerido", { length: 100 }),
  pecasPorBastidor: int("pecasPorBastidor"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;