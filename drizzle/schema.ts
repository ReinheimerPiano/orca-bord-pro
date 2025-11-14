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
  
  // Workflow de orçamento
  status: varchar("status", { length: 20 }).notNull().default("orcamento"), // "orcamento", "matriz_arte", "finalizado"
  modoTrabalho: varchar("modoTrabalho", { length: 20 }).notNull().default("vendedor"), // "vendedor" ou "cliente"
  
  // Etapa: Matriz e Arte
  pontos_finais: int("pontos_finais"),
  cores_finais: int("cores_finais"),
  arquivo_wilcom: text("arquivo_wilcom"),
  arquivo_vetor: text("arquivo_vetor"),
  observacoes_matriz: text("observacoes_matriz"),
  data_matriz_concluida: timestamp("data_matriz_concluida"),
  
  // Etapa: Finalização
  fotos_resultado: text("fotos_resultado"), // JSON string
  numeracao_linhas: text("numeracao_linhas"), // JSON string
  observacoes_finalizacao: text("observacoes_finalizacao"),
  data_finalizacao: timestamp("data_finalizacao"),
  
  // Informações do cliente
  cliente_nome: varchar("cliente_nome", { length: 255 }),
  cliente_email: varchar("cliente_email", { length: 255 }),
  cliente_telefone: varchar("cliente_telefone", { length: 50 }),
  cliente_observacoes: text("cliente_observacoes"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;

/**
 * Tabela de Configurações Globais
 * Armazena todas as constantes do sistema (materiais, energia, margens, etc.)
 */
export const configuracoes = mysqlTable("configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  
  // Materiais
  nylon_preco_metro: int("nylon_preco_metro").notNull().default(900), // R$ 9.00 em centavos
  nylon_largura: int("nylon_largura").notNull().default(140), // 1.40m em centímetros
  sarja_preco_metro: int("sarja_preco_metro").notNull().default(2900),
  sarja_largura: int("sarja_largura").notNull().default(140),
  entretela_preco_total: int("entretela_preco_total").notNull().default(8000),
  entretela_metragem: int("entretela_metragem").notNull().default(5000), // 50m em centímetros
  entretela_largura: int("entretela_largura").notNull().default(50),
  termocolante_preco_metro: int("termocolante_preco_metro").notNull().default(900),
  termocolante_largura: int("termocolante_largura").notNull().default(50),
  desperdicio: int("desperdicio").notNull().default(15), // 15% (percentual * 100)
  orelha_cm: int("orelha_cm").notNull().default(200), // 2.00cm em centímetros * 100
  gutter_cm: int("gutter_cm").notNull().default(50),
  margem_entre_bordados: int("margem_entre_bordados").notNull().default(50),
  
  // Linha
  linha_preco_rolo: int("linha_preco_rolo").notNull().default(1050), // R$ 10.50
  linha_metros_rolo: int("linha_metros_rolo").notNull().default(4000),
  consumo_por_1000_pontos: int("consumo_por_1000_pontos").notNull().default(300), // 3.00m * 100
  perda_por_troca: int("perda_por_troca").notNull().default(15), // 0.15m * 100
  
  // Energia
  tarifa_energia: int("tarifa_energia").notNull().default(90), // R$ 0.90
  
  // Fixações
  custo_velcro: int("custo_velcro").notNull().default(250),
  custo_imantada: int("custo_imantada").notNull().default(300),
  custo_broche: int("custo_broche").notNull().default(200),
  
  // Preços e Margens
  margem_padrao: int("margem_padrao").notNull().default(40), // 40%
  margem_minima: int("margem_minima").notNull().default(25),
  arredondamento: int("arredondamento").notNull().default(50), // R$ 0.50
  margem_venda_online: int("margem_venda_online").notNull().default(10),
  custo_por_1000_pontos: int("custo_por_1000_pontos").notNull().default(10), // R$ 0.10
  limite_custo_por_1000_pontos: int("limite_custo_por_1000_pontos").notNull().default(500),
  custo_criacao_matriz: int("custo_criacao_matriz").notNull().default(5000),
  valor_isencao_matriz: int("valor_isencao_matriz").notNull().default(15000),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = typeof configuracoes.$inferInsert;

/**
 * Tabela de Bastidores
 */
export const bastidores = mysqlTable("bastidores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  largura: int("largura").notNull(), // em centímetros * 100
  altura: int("altura").notNull(),
  largura_util: int("largura_util").notNull(),
  altura_util: int("altura_util").notNull(),
  margem_interna: int("margem_interna").notNull().default(25), // 0.25cm
  orelha_seguranca: int("orelha_seguranca").notNull().default(200),
  ativo: int("ativo").notNull().default(1), // boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bastidor = typeof bastidores.$inferSelect;
export type InsertBastidor = typeof bastidores.$inferInsert;

/**
 * Tabela de Descontos por Quantidade
 */
export const descontosQuantidade = mysqlTable("descontos_quantidade", {
  id: int("id").autoincrement().primaryKey(),
  quantidade_minima: int("quantidade_minima").notNull(),
  desconto_percentual: int("desconto_percentual").notNull(), // percentual * 100
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DescontoQuantidade = typeof descontosQuantidade.$inferSelect;
export type InsertDescontoQuantidade = typeof descontosQuantidade.$inferInsert;

/**
 * Tabela de Máquinas
 */
export const maquinas = mysqlTable("maquinas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  velocidade: int("velocidade").notNull(), // pontos por minuto
  potencia: int("potencia").notNull(), // kW * 100
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Maquina = typeof maquinas.$inferSelect;
export type InsertMaquina = typeof maquinas.$inferInsert;

/**
 * Tabela de Materiais Base (Tecidos)
 */
export const materiaisBase = mysqlTable("materiais_base", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  preco_metro: int("preco_metro").notNull(), // em centavos
  largura: int("largura").notNull(), // em centímetros * 100
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaterialBase = typeof materiaisBase.$inferSelect;
export type InsertMaterialBase = typeof materiaisBase.$inferInsert;

/**
 * Tabela de Tipos de Fixação
 */
export const tiposFixacao = mysqlTable("tipos_fixacao", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  custo_adicional: int("custo_adicional").notNull().default(0),
  ativo: int("ativo").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TipoFixacao = typeof tiposFixacao.$inferSelect;
export type InsertTipoFixacao = typeof tiposFixacao.$inferInsert;

/**
 * Tabela de Histórico de Status de Orçamento
 */
export const historicoStatusOrcamento = mysqlTable("historico_status_orcamento", {
  id: int("id").autoincrement().primaryKey(),
  orcamento_id: int("orcamento_id").notNull(),
  status_anterior: varchar("status_anterior", { length: 20 }),
  status_novo: varchar("status_novo", { length: 20 }).notNull(),
  observacao: text("observacao"),
  user_id: int("user_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoStatusOrcamento = typeof historicoStatusOrcamento.$inferSelect;
export type InsertHistoricoStatusOrcamento = typeof historicoStatusOrcamento.$inferInsert;