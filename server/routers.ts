import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orcamentos: router({
    // Criar um novo orçamento
    create: protectedProcedure
      .input(
        z.object({
          forma: z.enum(["retangular", "circular"]),
          tamanhoA: z.number(),
          tamanhoB: z.number().optional(),
          pontos: z.number(),
          cores: z.number(),
          fixacao: z.string(),
          maquina: z.string(),
          materialBase: z.string(),
          margemPercentual: z.number(),
          quantidade: z.number(),
          vendaOnline: z.boolean(),
          custoMateriais: z.number(),
          custoLinha: z.number(),
          custoEnergia: z.number(),
          custoPorPontos: z.number(),
          custoFixacaoAdicional: z.number(),
          custoTotalProducao: z.number(),
          precoFinalArredondado: z.number(),
          descontoAplicado: z.number(),
          precoUnitarioComDesconto: z.number(),
          precoTotal: z.number(),
          bastidorSugerido: z.string().optional(),
          pecasPorBastidor: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const orcamentoData = {
          userId: ctx.user.id,
          forma: input.forma,
          tamanhoA: Math.round(input.tamanhoA * 100),
          tamanhoB: input.tamanhoB ? Math.round(input.tamanhoB * 100) : null,
          pontos: input.pontos,
          cores: input.cores,
          fixacao: input.fixacao,
          maquina: input.maquina,
          materialBase: input.materialBase,
          margemPercentual: Math.round(input.margemPercentual * 100),
          quantidade: input.quantidade,
          vendaOnline: input.vendaOnline ? 1 : 0,
          custoMateriais: Math.round(input.custoMateriais * 100),
          custoLinha: Math.round(input.custoLinha * 100),
          custoEnergia: Math.round(input.custoEnergia * 100),
          custoPorPontos: Math.round(input.custoPorPontos * 100),
          custoFixacaoAdicional: Math.round(input.custoFixacaoAdicional * 100),
          custoTotalProducao: Math.round(input.custoTotalProducao * 100),
          precoFinalArredondado: Math.round(input.precoFinalArredondado * 100),
          descontoAplicado: Math.round(input.descontoAplicado * 100),
          precoUnitarioComDesconto: Math.round(input.precoUnitarioComDesconto * 100),
          precoTotal: Math.round(input.precoTotal * 100),
          bastidorSugerido: input.bastidorSugerido || null,
          pecasPorBastidor: input.pecasPorBastidor || null,
        };
        const orcamento = await db.createOrcamento(orcamentoData);
        return orcamento;
      }),

    // Listar todos os orçamentos do usuário
    list: protectedProcedure.query(async ({ ctx }) => {
      const orcamentos = await db.getOrcamentosByUserId(ctx.user.id);
      return orcamentos.map(orc => ({
        ...orc,
        tamanhoA: orc.tamanhoA / 100,
        tamanhoB: orc.tamanhoB ? orc.tamanhoB / 100 : null,
        margemPercentual: orc.margemPercentual / 100,
        vendaOnline: orc.vendaOnline === 1,
        custoMateriais: orc.custoMateriais / 100,
        custoLinha: orc.custoLinha / 100,
        custoEnergia: orc.custoEnergia / 100,
        custoPorPontos: orc.custoPorPontos / 100,
        custoFixacaoAdicional: orc.custoFixacaoAdicional / 100,
        custoTotalProducao: orc.custoTotalProducao / 100,
        precoFinalArredondado: orc.precoFinalArredondado / 100,
        descontoAplicado: orc.descontoAplicado / 100,
        precoUnitarioComDesconto: orc.precoUnitarioComDesconto / 100,
        precoTotal: orc.precoTotal / 100,
      }));
    }),

    // Buscar um orçamento específico
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const orcamento = await db.getOrcamentoById(input.id, ctx.user.id);
        if (!orcamento) return null;
        return {
          ...orcamento,
          tamanhoA: orcamento.tamanhoA / 100,
          tamanhoB: orcamento.tamanhoB ? orcamento.tamanhoB / 100 : null,
          margemPercentual: orcamento.margemPercentual / 100,
          vendaOnline: orcamento.vendaOnline === 1,
          custoMateriais: orcamento.custoMateriais / 100,
          custoLinha: orcamento.custoLinha / 100,
          custoEnergia: orcamento.custoEnergia / 100,
          custoPorPontos: orcamento.custoPorPontos / 100,
          custoFixacaoAdicional: orcamento.custoFixacaoAdicional / 100,
          custoTotalProducao: orcamento.custoTotalProducao / 100,
          precoFinalArredondado: orcamento.precoFinalArredondado / 100,
          descontoAplicado: orcamento.descontoAplicado / 100,
          precoUnitarioComDesconto: orcamento.precoUnitarioComDesconto / 100,
          precoTotal: orcamento.precoTotal / 100,
        };
      }),

    // Buscar orçamentos similares
    findSimilar: protectedProcedure
      .input(z.object({ forma: z.string(), tamanhoA: z.number(), pontos: z.number() }))
      .query(async ({ ctx, input }) => {
        const tamanhoAInt = Math.round(input.tamanhoA * 100);
        const orcamentos = await db.findSimilarOrcamentos(ctx.user.id, input.forma, tamanhoAInt, input.pontos);
        return orcamentos.map(orc => ({
          ...orc,
          tamanhoA: orc.tamanhoA / 100,
          tamanhoB: orc.tamanhoB ? orc.tamanhoB / 100 : null,
          margemPercentual: orc.margemPercentual / 100,
          vendaOnline: orc.vendaOnline === 1,
          custoMateriais: orc.custoMateriais / 100,
          custoLinha: orc.custoLinha / 100,
          custoEnergia: orc.custoEnergia / 100,
          custoPorPontos: orc.custoPorPontos / 100,
          custoFixacaoAdicional: orc.custoFixacaoAdicional / 100,
          custoTotalProducao: orc.custoTotalProducao / 100,
          precoFinalArredondado: orc.precoFinalArredondado / 100,
          descontoAplicado: orc.descontoAplicado / 100,
          precoUnitarioComDesconto: orc.precoUnitarioComDesconto / 100,
          precoTotal: orc.precoTotal / 100,
        }));
      }),

    // Deletar um orçamento
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteOrcamento(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
