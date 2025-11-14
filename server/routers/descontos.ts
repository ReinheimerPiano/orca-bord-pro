import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const descontosRouter = router({
  // Listar todos os descontos
  list: protectedProcedure.query(async () => {
    return await db.getDescontosQuantidade();
  }),

  // Criar um novo desconto
  create: protectedProcedure
    .input(z.object({
      quantidade_minima: z.number().positive().int(),
      desconto_percentual: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      return await db.createDescontoQuantidade({
        quantidade_minima: input.quantidade_minima,
        desconto_percentual: Math.round(input.desconto_percentual * 100),
        ativo: 1,
      });
    }),

  // Atualizar um desconto
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      quantidade_minima: z.number().optional(),
      desconto_percentual: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.quantidade_minima) updateData.quantidade_minima = data.quantidade_minima;
      if (data.desconto_percentual) updateData.desconto_percentual = Math.round(data.desconto_percentual * 100);
      
      return await db.updateDescontoQuantidade(id, updateData);
    }),

  // Deletar um desconto
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteDescontoQuantidade(input.id);
      return { success: true };
    }),
});
