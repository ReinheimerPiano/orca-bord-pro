import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orcamentos, type Orcamento, type InsertOrcamento, configuracoes, type Configuracao, type InsertConfiguracao, maquinas, type Maquina, type InsertMaquina, materiaisBase, type MaterialBase, type InsertMaterialBase, bastidores, type Bastidor, type InsertBastidor, descontosQuantidade, type DescontoQuantidade, type InsertDescontoQuantidade } from "../drizzle/schema";
import { ENV } from './_core/env';


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Funções para Orçamentos =====

/**
 * Cria um novo orçamento
 */
export async function createOrcamento(orcamento: InsertOrcamento): Promise<Orcamento> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(orcamentos).values(orcamento);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(orcamentos).where(eq(orcamentos.id, insertedId)).limit(1);
  
  if (inserted.length === 0) {
    throw new Error("Failed to retrieve inserted orcamento");
  }

  return inserted[0];
}

/**
 * Lista todos os orçamentos de um usuário
 */
export async function getOrcamentosByUserId(userId: number): Promise<Orcamento[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(orcamentos)
    .where(eq(orcamentos.userId, userId))
    .orderBy(desc(orcamentos.createdAt));
}

/**
 * Busca um orçamento específico por ID
 */
export async function getOrcamentoById(id: number, userId: number): Promise<Orcamento | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca orçamentos similares baseado em forma, tamanho e pontos
 * Retorna até 5 orçamentos mais similares
 */
export async function findSimilarOrcamentos(
  userId: number,
  forma: string,
  tamanhoA: number,
  pontos: number
): Promise<Orcamento[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Tolerância: ±20% para tamanho e pontos
  const tamanhoMin = Math.floor(tamanhoA * 0.8);
  const tamanhoMax = Math.ceil(tamanhoA * 1.2);
  const pontosMin = Math.floor(pontos * 0.8);
  const pontosMax = Math.ceil(pontos * 1.2);

  const result = await db
    .select()
    .from(orcamentos)
    .where(
      and(
        eq(orcamentos.userId, userId),
        eq(orcamentos.forma, forma),
        sql`${orcamentos.tamanhoA} >= ${tamanhoMin}`,
        sql`${orcamentos.tamanhoA} <= ${tamanhoMax}`,
        sql`${orcamentos.pontos} >= ${pontosMin}`,
        sql`${orcamentos.pontos} <= ${pontosMax}`
      )
    )
    .orderBy(desc(orcamentos.createdAt))
    .limit(5);

  return result;
}

/**
 * Deleta um orçamento
 */
export async function deleteOrcamento(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .delete(orcamentos)
    .where(and(eq(orcamentos.id, id), eq(orcamentos.userId, userId)));

  return true;
}


// ===== Funções para Configurações =====

/**
 * Busca as configurações globais (sempre retorna a primeira linha)
 */
export async function getConfiguracoes(): Promise<Configuracao | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(configuracoes).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualiza as configurações globais
 */
export async function updateConfiguracoes(data: Partial<InsertConfiguracao>): Promise<Configuracao> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const config = await getConfiguracoes();
  
  if (!config) {
    // Se não existir, criar
    const result = await db.insert(configuracoes).values(data);
    const insertedId = Number(result[0].insertId);
    const inserted = await db.select().from(configuracoes).where(eq(configuracoes.id, insertedId)).limit(1);
    if (inserted.length === 0) throw new Error("Failed to create configuracoes");
    return inserted[0];
  }

  // Atualizar
  await db.update(configuracoes).set(data).where(eq(configuracoes.id, config.id));
  const updated = await db.select().from(configuracoes).where(eq(configuracoes.id, config.id)).limit(1);
  if (updated.length === 0) throw new Error("Failed to update configuracoes");
  return updated[0];
}

// ===== Funções para Máquinas =====

/**
 * Lista todas as máquinas ativas
 */
export async function getMaquinas(): Promise<Maquina[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(maquinas).where(eq(maquinas.ativo, 1));
}

/**
 * Cria uma nova máquina
 */
export async function createMaquina(data: InsertMaquina): Promise<Maquina> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(maquinas).values(data);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(maquinas).where(eq(maquinas.id, insertedId)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create maquina");
  return inserted[0];
}

/**
 * Atualiza uma máquina
 */
export async function updateMaquina(id: number, data: Partial<InsertMaquina>): Promise<Maquina> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(maquinas).set(data).where(eq(maquinas.id, id));
  const updated = await db.select().from(maquinas).where(eq(maquinas.id, id)).limit(1);
  if (updated.length === 0) throw new Error("Failed to update maquina");
  return updated[0];
}

/**
 * Deleta uma máquina (soft delete)
 */
export async function deleteMaquina(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(maquinas).set({ ativo: 0 }).where(eq(maquinas.id, id));
  return true;
}

// ===== Funções para Materiais Base =====

/**
 * Lista todos os materiais ativos
 */
export async function getMateriaisBase(): Promise<MaterialBase[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(materiaisBase).where(eq(materiaisBase.ativo, 1));
}

/**
 * Cria um novo material
 */
export async function createMaterialBase(data: InsertMaterialBase): Promise<MaterialBase> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(materiaisBase).values(data);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(materiaisBase).where(eq(materiaisBase.id, insertedId)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create material");
  return inserted[0];
}

/**
 * Atualiza um material
 */
export async function updateMaterialBase(id: number, data: Partial<InsertMaterialBase>): Promise<MaterialBase> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(materiaisBase).set(data).where(eq(materiaisBase.id, id));
  const updated = await db.select().from(materiaisBase).where(eq(materiaisBase.id, id)).limit(1);
  if (updated.length === 0) throw new Error("Failed to update material");
  return updated[0];
}

/**
 * Deleta um material (soft delete)
 */
export async function deleteMaterialBase(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(materiaisBase).set({ ativo: 0 }).where(eq(materiaisBase.id, id));
  return true;
}

// ===== Funções para Bastidores =====

/**
 * Lista todos os bastidores ativos
 */
export async function getBastidores(): Promise<Bastidor[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(bastidores).where(eq(bastidores.ativo, 1));
}

/**
 * Cria um novo bastidor
 */
export async function createBastidor(data: InsertBastidor): Promise<Bastidor> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(bastidores).values(data);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(bastidores).where(eq(bastidores.id, insertedId)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create bastidor");
  return inserted[0];
}

/**
 * Atualiza um bastidor
 */
export async function updateBastidor(id: number, data: Partial<InsertBastidor>): Promise<Bastidor> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(bastidores).set(data).where(eq(bastidores.id, id));
  const updated = await db.select().from(bastidores).where(eq(bastidores.id, id)).limit(1);
  if (updated.length === 0) throw new Error("Failed to update bastidor");
  return updated[0];
}

/**
 * Deleta um bastidor (soft delete)
 */
export async function deleteBastidor(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(bastidores).set({ ativo: 0 }).where(eq(bastidores.id, id));
  return true;
}

// ===== Funções para Descontos por Quantidade =====

/**
 * Lista todos os descontos ativos
 */
export async function getDescontosQuantidade(): Promise<DescontoQuantidade[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(descontosQuantidade).where(eq(descontosQuantidade.ativo, 1)).orderBy(descontosQuantidade.quantidade_minima);
}

/**
 * Cria um novo desconto
 */
export async function createDescontoQuantidade(data: InsertDescontoQuantidade): Promise<DescontoQuantidade> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(descontosQuantidade).values(data);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(descontosQuantidade).where(eq(descontosQuantidade.id, insertedId)).limit(1);
  if (inserted.length === 0) throw new Error("Failed to create desconto");
  return inserted[0];
}

/**
 * Atualiza um desconto
 */
export async function updateDescontoQuantidade(id: number, data: Partial<InsertDescontoQuantidade>): Promise<DescontoQuantidade> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(descontosQuantidade).set(data).where(eq(descontosQuantidade.id, id));
  const updated = await db.select().from(descontosQuantidade).where(eq(descontosQuantidade.id, id)).limit(1);
  if (updated.length === 0) throw new Error("Failed to update desconto");
  return updated[0];
}

/**
 * Deleta um desconto (soft delete)
 */
export async function deleteDescontoQuantidade(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(descontosQuantidade).set({ ativo: 0 }).where(eq(descontosQuantidade.id, id));
  return true;
}
