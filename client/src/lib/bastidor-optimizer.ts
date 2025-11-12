import type { Bastidor } from "@/contexts/AppContext";

export interface OtimizacaoBastidor {
  bastidor: Bastidor;
  pecas_largura: number;
  pecas_altura: number;
  total_pecas: number;
  rotacao_sugerida: boolean; // true = rotacionar 90°
  area_util_usada: number; // cm²
  area_util_total: number; // cm²
  percentual_aproveitamento: number;
  perda_material: number; // cm²
}

/**
 * Calcula quantos bordados cabem em um bastidor considerando:
 * - Área útil real do bastidor
 * - Margem entre bordados
 * - Possibilidade de rotação da matriz (90°)
 * - Orelha de segurança para esticar o tecido
 */
export function calcularOtimizacaoBastidor(
  larguraBordado: number, // cm
  alturaBordado: number, // cm
  bastidor: Bastidor,
  margemEntreBordados: number // cm
): OtimizacaoBastidor {
  const larguraUtil = bastidor.largura_util;
  const alturaUtil = bastidor.altura_util;
  const areaUtilTotal = larguraUtil * alturaUtil;

  // Tamanho do bordado com margem entre peças
  const larguraBordadoComMargem = larguraBordado + margemEntreBordados;
  const alturaBordadoComMargem = alturaBordado + margemEntreBordados;

  // Calcular sem rotação
  const pecasLarguraSemRotacao = Math.floor(larguraUtil / larguraBordadoComMargem);
  const pecasAlturaSemRotacao = Math.floor(alturaUtil / alturaBordadoComMargem);
  const totalPecasSemRotacao = pecasLarguraSemRotacao * pecasAlturaSemRotacao;

  // Calcular com rotação (90°)
  const pecasLarguraComRotacao = Math.floor(larguraUtil / alturaBordadoComMargem);
  const pecasAlturaComRotacao = Math.floor(alturaUtil / larguraBordadoComMargem);
  const totalPecasComRotacao = pecasLarguraComRotacao * pecasAlturaComRotacao;

  // Escolher a melhor opção (maior número de peças)
  const usarRotacao = totalPecasComRotacao > totalPecasSemRotacao;
  const pecasLargura = usarRotacao ? pecasLarguraComRotacao : pecasLarguraSemRotacao;
  const pecasAltura = usarRotacao ? pecasAlturaComRotacao : pecasAlturaSemRotacao;
  const totalPecas = usarRotacao ? totalPecasComRotacao : totalPecasSemRotacao;

  // Calcular área usada e aproveitamento
  const areaBordado = larguraBordado * alturaBordado;
  const areaUtilUsada = totalPecas * areaBordado;
  const percentualAproveitamento = (areaUtilUsada / areaUtilTotal) * 100;
  const perdaMaterial = areaUtilTotal - areaUtilUsada;

  return {
    bastidor,
    pecas_largura: pecasLargura,
    pecas_altura: pecasAltura,
    total_pecas: totalPecas,
    rotacao_sugerida: usarRotacao,
    area_util_usada: areaUtilUsada,
    area_util_total: areaUtilTotal,
    percentual_aproveitamento: percentualAproveitamento,
    perda_material: perdaMaterial,
  };
}

/**
 * Encontra o melhor bastidor para um bordado específico
 * Critérios de seleção (em ordem de prioridade):
 * 1. Bastidor que cabe pelo menos 1 peça
 * 2. Maior percentual de aproveitamento de área
 * 3. Menor perda de material
 */
export function encontrarMelhorBastidor(
  larguraBordado: number,
  alturaBordado: number,
  bastidores: Bastidor[],
  margemEntreBordados: number
): OtimizacaoBastidor | null {
  if (bastidores.length === 0) {
    return null;
  }

  // Calcular otimização para todos os bastidores
  const otimizacoes = bastidores
    .map((bastidor) => calcularOtimizacaoBastidor(larguraBordado, alturaBordado, bastidor, margemEntreBordados))
    .filter((opt) => opt.total_pecas >= 1); // Apenas bastidores que cabem pelo menos 1 peça

  if (otimizacoes.length === 0) {
    return null;
  }

  // Ordenar por:
  // 1. Maior percentual de aproveitamento
  // 2. Menor perda de material (desempate)
  otimizacoes.sort((a, b) => {
    if (Math.abs(a.percentual_aproveitamento - b.percentual_aproveitamento) < 1) {
      // Se aproveitamento for similar (diferença < 1%), escolher menor perda
      return a.perda_material - b.perda_material;
    }
    return b.percentual_aproveitamento - a.percentual_aproveitamento;
  });

  return otimizacoes[0];
}

/**
 * Sugere o bastidor ideal para uma quantidade específica de bordados
 * Tenta encontrar o bastidor que melhor acomoda a quantidade desejada
 */
export function sugerirBastidorParaQuantidade(
  larguraBordado: number,
  alturaBordado: number,
  quantidade: number,
  bastidores: Bastidor[],
  margemEntreBordados: number
): OtimizacaoBastidor | null {
  if (bastidores.length === 0 || quantidade <= 0) {
    return null;
  }

  // Calcular otimização para todos os bastidores
  const otimizacoes = bastidores
    .map((bastidor) => calcularOtimizacaoBastidor(larguraBordado, alturaBordado, bastidor, margemEntreBordados))
    .filter((opt) => opt.total_pecas >= 1);

  if (otimizacoes.length === 0) {
    return null;
  }

  // Encontrar bastidor que melhor acomoda a quantidade
  // Prioridade:
  // 1. Bastidor que cabe exatamente a quantidade (ou mais próximo)
  // 2. Menor número de bastidores necessários
  // 3. Maior aproveitamento de área

  const bastidorIdeal = otimizacoes.reduce((melhor, atual) => {
    const bastidoresNecessariosMelhor = Math.ceil(quantidade / melhor.total_pecas);
    const bastidoresNecessariosAtual = Math.ceil(quantidade / atual.total_pecas);

    // Preferir bastidor que precisa de menos unidades
    if (bastidoresNecessariosAtual < bastidoresNecessariosMelhor) {
      return atual;
    }

    // Se precisam do mesmo número de bastidores, preferir maior aproveitamento
    if (bastidoresNecessariosAtual === bastidoresNecessariosMelhor) {
      if (atual.percentual_aproveitamento > melhor.percentual_aproveitamento) {
        return atual;
      }
    }

    return melhor;
  });

  return bastidorIdeal;
}
