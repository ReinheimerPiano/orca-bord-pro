import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orcamentos, type Orcamento, type InsertOrcamento } from "../drizzle/schema";
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
