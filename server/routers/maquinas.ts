import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const maquinasRouter = router({
  // Listar todas as máquinas
  list: protectedProcedure.query(async () => {
    return await db.getMaquinas();
  }),

  // Criar uma nova máquina
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      velocidade: z.number().positive(),
      potencia: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      return await db.createMaquina({
        nome: input.nome,
        velocidade: input.velocidade,
        potencia: Math.round(input.potencia * 100),
        ativo: 1,
      });
    }),

  // Atualizar uma máquina
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      velocidade: z.number().optional(),
      potencia: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.nome) updateData.nome = data.nome;
      if (data.velocidade) updateData.velocidade = data.velocidade;
      if (data.potencia) updateData.potencia = Math.round(data.potencia * 100);
      
      return await db.updateMaquina(id, updateData);
    }),

  // Deletar uma máquina
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteMaquina(input.id);
      return { success: true };
    }),
});
