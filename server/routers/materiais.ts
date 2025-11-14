import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const materiaisRouter = router({
  // Listar todos os materiais
  list: protectedProcedure.query(async () => {
    return await db.getMateriaisBase();
  }),

  // Criar um novo material
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      preco_metro: z.number().positive(),
      largura: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      return await db.createMaterialBase({
        nome: input.nome,
        preco_metro: Math.round(input.preco_metro * 100),
        largura: Math.round(input.largura * 100),
        ativo: 1,
      });
    }),

  // Atualizar um material
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      preco_metro: z.number().optional(),
      largura: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.nome) updateData.nome = data.nome;
      if (data.preco_metro) updateData.preco_metro = Math.round(data.preco_metro * 100);
      if (data.largura) updateData.largura = Math.round(data.largura * 100);
      
      return await db.updateMaterialBase(id, updateData);
    }),

  // Deletar um material
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteMaterialBase(input.id);
      return { success: true };
    }),
});
