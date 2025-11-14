import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const bastidoresRouter = router({
  // Listar todos os bastidores
  list: protectedProcedure.query(async () => {
    return await db.getBastidores();
  }),

  // Criar um novo bastidor
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      largura: z.number().positive(),
      altura: z.number().positive(),
      largura_util: z.number().positive(),
      altura_util: z.number().positive(),
      margem_interna: z.number().optional(),
      orelha_seguranca: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createBastidor({
        nome: input.nome,
        largura: Math.round(input.largura * 100),
        altura: Math.round(input.altura * 100),
        largura_util: Math.round(input.largura_util * 100),
        altura_util: Math.round(input.altura_util * 100),
        margem_interna: input.margem_interna ? Math.round(input.margem_interna * 100) : 25,
        orelha_seguranca: input.orelha_seguranca ? Math.round(input.orelha_seguranca * 100) : 200,
        ativo: 1,
      });
    }),

  // Atualizar um bastidor
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      largura: z.number().optional(),
      altura: z.number().optional(),
      largura_util: z.number().optional(),
      altura_util: z.number().optional(),
      margem_interna: z.number().optional(),
      orelha_seguranca: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.nome) updateData.nome = data.nome;
      if (data.largura) updateData.largura = Math.round(data.largura * 100);
      if (data.altura) updateData.altura = Math.round(data.altura * 100);
      if (data.largura_util) updateData.largura_util = Math.round(data.largura_util * 100);
      if (data.altura_util) updateData.altura_util = Math.round(data.altura_util * 100);
      if (data.margem_interna) updateData.margem_interna = Math.round(data.margem_interna * 100);
      if (data.orelha_seguranca) updateData.orelha_seguranca = Math.round(data.orelha_seguranca * 100);
      
      return await db.updateBastidor(id, updateData);
    }),

  // Deletar um bastidor
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteBastidor(input.id);
      return { success: true };
    }),
});
