import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const configuracoesRouter = router({
  // Buscar configurações
  get: protectedProcedure.query(async () => {
    return await db.getConfiguracoes();
  }),

  // Atualizar configurações
  update: protectedProcedure
    .input(z.object({
      // Materiais
      nylon_preco_metro: z.number().optional(),
      nylon_largura: z.number().optional(),
      sarja_preco_metro: z.number().optional(),
      sarja_largura: z.number().optional(),
      entretela_preco_total: z.number().optional(),
      entretela_metragem: z.number().optional(),
      entretela_largura: z.number().optional(),
      termocolante_preco_metro: z.number().optional(),
      termocolante_largura: z.number().optional(),
      desperdicio: z.number().optional(),
      orelha_cm: z.number().optional(),
      gutter_cm: z.number().optional(),
      margem_entre_bordados: z.number().optional(),
      
      // Linha
      linha_preco_rolo: z.number().optional(),
      linha_metros_rolo: z.number().optional(),
      consumo_por_1000_pontos: z.number().optional(),
      perda_por_troca: z.number().optional(),
      
      // Energia
      tarifa_energia: z.number().optional(),
      
      // Fixações
      custo_velcro: z.number().optional(),
      custo_imantada: z.number().optional(),
      custo_broche: z.number().optional(),
      
      // Preços e Margens
      margem_padrao: z.number().optional(),
      margem_minima: z.number().optional(),
      arredondamento: z.number().optional(),
      margem_venda_online: z.number().optional(),
      custo_por_1000_pontos: z.number().optional(),
      limite_custo_por_1000_pontos: z.number().optional(),
      custo_criacao_matriz: z.number().optional(),
      valor_isencao_matriz: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.updateConfiguracoes(input);
    }),
});
