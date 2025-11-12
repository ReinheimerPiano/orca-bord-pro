import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";
import { useState } from "react";

// Constantes extraídas da planilha "Config"
const CONSTANTS = {
  // Materiais
  NYLON_600_M2: 9.0 / 1.4, // R$ 6.43/m²
  SARJA_M2: 29.0 / 1.4, // R$ 20.71/m²
  ENTRETELA_M2: 80.0 / (50 * 0.5), // R$ 3.20/m²
  TERMOCOLANTE_M2: 9.0 / 0.5, // R$ 18.00/m²
  DESPERDICIO: 0.15, // 15%
  ORELHA_CM: 2.0, // Orelha para fixação (cm)

  // Linha
  LINHA_CUSTO_M: 10.5 / 4000, // R$ 0.002625/m
  CONSUMO_PONTO_M: 3.0 / 1000, // 3m / 1000 pontos
  PERDA_TROCA_M: 0.15, // 0.15m por troca

  // Energia e Máquinas
  TARIFA_ENERGIA_KWH: 0.9,
  BP1430_PTS_MIN: 650.0,
  BP1430_KW: 0.09,
  BP2100_PTS_MIN: 1050.0,
  BP2100_KW: 0.12,

  // Fixações
  CUSTO_VELCRO: 2.5,
  CUSTO_IMANTADA: 3.0,
  CUSTO_BROCHE: 2.0,

  // Margem e Preço
  MARGEM_PADRAO: 0.40, // 40%
  ARREDONDAMENTO: 0.5, // Múltiplo de R$ 0,50
  CUSTO_PONTO_MILHAR: 0.10, // R$ 0,10 por 1.000 pontos
};

interface ResultadoCalculo {
  custo_materiais: number;
  custo_linha: number;
  custo_energia: number;
  custo_por_pontos: number;
  custo_fixacao_adicional: number;
  custo_total_producao: number;
  preco_sugerido_sem_arredondamento: number;
  preco_final_arredondado: number;
  area_patch_cm2: number;
  area_carregada_m2: number;
}

export default function Home() {
  // Estados do formulário
  const [forma, setForma] = useState<"retangular" | "circular">("retangular");
  const [tamanhoA, setTamanhoA] = useState<string>("12");
  const [tamanhoB, setTamanhoB] = useState<string>("9");
  const [pontos, setPontos] = useState<string>("28000");
  const [cores, setCores] = useState<string>("14");
  const [fixacao, setFixacao] = useState<string>("termocolante");
  const [maquina, setMaquina] = useState<string>("BP2100");
  const [materialBase, setMaterialBase] = useState<string>("Nylon 600");
  const [margemPercentual, setMargemPercentual] = useState<string>("40");

  // Estado do resultado
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const calcularCusto = () => {
    // Conversão de valores
    const _tamanhoA = parseFloat(tamanhoA);
    const _tamanhoB = parseFloat(tamanhoB);
    const _pontos = parseInt(pontos);
    const _cores = parseInt(cores);
    const _margemPercentual = parseFloat(margemPercentual) / 100;

    // Validação básica
    if (isNaN(_tamanhoA) || isNaN(_pontos) || isNaN(_cores) || isNaN(_margemPercentual)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (forma === "retangular" && isNaN(_tamanhoB)) {
      alert("Por favor, preencha o lado menor para forma retangular.");
      return;
    }

    // --- 1. Cálculo da Área ---
    let area_patch_cm2: number;
    let area_carregada_cm2: number;

    if (forma === "retangular") {
      area_patch_cm2 = _tamanhoA * _tamanhoB;
      area_carregada_cm2 = (_tamanhoA + CONSTANTS.ORELHA_CM) * (_tamanhoB + CONSTANTS.ORELHA_CM);
    } else {
      // Circular
      area_patch_cm2 = Math.PI * Math.pow(_tamanhoA / 2, 2);
      area_carregada_cm2 = Math.pow(_tamanhoA + CONSTANTS.ORELHA_CM, 2);
    }

    const area_carregada_m2 = area_carregada_cm2 / 10000;

    // --- 2. Custo de Materiais ---
    let custo_tecido_m2: number;
    if (materialBase === "Nylon 600") {
      custo_tecido_m2 = CONSTANTS.NYLON_600_M2;
    } else {
      custo_tecido_m2 = CONSTANTS.SARJA_M2;
    }

    let custo_material_base_m2 = custo_tecido_m2 + CONSTANTS.ENTRETELA_M2;

    if (fixacao === "termocolante") {
      custo_material_base_m2 += CONSTANTS.TERMOCOLANTE_M2;
    }

    const custo_materiais = custo_material_base_m2 * area_carregada_m2 * (1 + CONSTANTS.DESPERDICIO);

    // --- 3. Custo de Linha ---
    const consumo_linha = _pontos * CONSTANTS.CONSUMO_PONTO_M;
    const perda_trocas = _cores * CONSTANTS.PERDA_TROCA_M;
    const custo_linha = (consumo_linha + perda_trocas) * CONSTANTS.LINHA_CUSTO_M;

    // --- 4. Custo de Energia ---
    let pts_min: number;
    let kw: number;

    if (maquina === "BP1430") {
      pts_min = CONSTANTS.BP1430_PTS_MIN;
      kw = CONSTANTS.BP1430_KW;
    } else {
      pts_min = CONSTANTS.BP2100_PTS_MIN;
      kw = CONSTANTS.BP2100_KW;
    }

    const tempo_min = _pontos / pts_min;
    const tempo_h = tempo_min / 60;
    const consumo_kwh = kw * tempo_h;
    const custo_energia = consumo_kwh * CONSTANTS.TARIFA_ENERGIA_KWH;

    // --- 5. Custo por Milhar de Ponto ---
    const custo_por_pontos = (_pontos / 1000) * CONSTANTS.CUSTO_PONTO_MILHAR;

    // --- 6. Custo de Fixação Adicional ---
    let custo_fixacao_adicional = 0;
    if (fixacao === "velcro") {
      custo_fixacao_adicional = CONSTANTS.CUSTO_VELCRO;
    } else if (fixacao === "imantada") {
      custo_fixacao_adicional = CONSTANTS.CUSTO_IMANTADA;
    } else if (fixacao === "broche") {
      custo_fixacao_adicional = CONSTANTS.CUSTO_BROCHE;
    }

    // --- 7. Custo Total de Produção ---
    const custo_total_producao = custo_materiais + custo_linha + custo_energia + custo_por_pontos + custo_fixacao_adicional;

    // --- 8. Preço de Venda Sugerido ---
    const preco_sugerido_sem_arredondamento = custo_total_producao * (1 + _margemPercentual);
    const preco_final_arredondado = Math.ceil(preco_sugerido_sem_arredondamento / CONSTANTS.ARREDONDAMENTO) * CONSTANTS.ARREDONDAMENTO;

    setResultado({
      custo_materiais,
      custo_linha,
      custo_energia,
      custo_por_pontos,
      custo_fixacao_adicional,
      custo_total_producao,
      preco_sugerido_sem_arredondamento,
      preco_final_arredondado,
      area_patch_cm2,
      area_carregada_m2,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Calculadora de Custos de Bordados</h1>
          </div>
          <p className="text-gray-600">Calcule o custo de produção e o preço de venda sugerido para seus bordados computadorizados</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card de Entrada */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Dados do Bordado</CardTitle>
              <CardDescription>Preencha as informações do seu projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Forma */}
              <div className="space-y-2">
                <Label htmlFor="forma">Forma</Label>
                <Select value={forma} onValueChange={(value) => setForma(value as "retangular" | "circular")}>
                  <SelectTrigger id="forma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retangular">Retangular</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanho */}
              {forma === "retangular" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tamanhoA">Lado Maior (cm)</Label>
                    <Input id="tamanhoA" type="number" value={tamanhoA} onChange={(e) => setTamanhoA(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamanhoB">Lado Menor (cm)</Label>
                    <Input id="tamanhoB" type="number" value={tamanhoB} onChange={(e) => setTamanhoB(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="tamanhoA">Diâmetro (cm)</Label>
                  <Input id="tamanhoA" type="number" value={tamanhoA} onChange={(e) => setTamanhoA(e.target.value)} />
                </div>
              )}

              {/* Pontos e Cores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pontos">Pontos da Matriz</Label>
                  <Input id="pontos" type="number" value={pontos} onChange={(e) => setPontos(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cores">Nº de Cores</Label>
                  <Input id="cores" type="number" value={cores} onChange={(e) => setCores(e.target.value)} />
                </div>
              </div>

              {/* Material Base */}
              <div className="space-y-2">
                <Label htmlFor="materialBase">Material Base</Label>
                <Select value={materialBase} onValueChange={setMaterialBase}>
                  <SelectTrigger id="materialBase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nylon 600">Nylon 600</SelectItem>
                    <SelectItem value="Sarja">Sarja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fixação */}
              <div className="space-y-2">
                <Label htmlFor="fixacao">Fixação</Label>
                <Select value={fixacao} onValueChange={setFixacao}>
                  <SelectTrigger id="fixacao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem">Sem Fixação</SelectItem>
                    <SelectItem value="termocolante">Termocolante</SelectItem>
                    <SelectItem value="velcro">Velcro Macho</SelectItem>
                    <SelectItem value="imantada">Manta Imantada</SelectItem>
                    <SelectItem value="broche">Base de Broche</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Máquina */}
              <div className="space-y-2">
                <Label htmlFor="maquina">Máquina</Label>
                <Select value={maquina} onValueChange={setMaquina}>
                  <SelectTrigger id="maquina">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BP1430">BP1430</SelectItem>
                    <SelectItem value="BP2100">BP2100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Margem */}
              <div className="space-y-2">
                <Label htmlFor="margem">Margem de Lucro (%)</Label>
                <Input id="margem" type="number" value={margemPercentual} onChange={(e) => setMargemPercentual(e.target.value)} />
              </div>

              <Button onClick={calcularCusto} className="w-full" size="lg">
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Preço
              </Button>
            </CardContent>
          </Card>

          {/* Card de Resultado */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Resultado do Cálculo</CardTitle>
              <CardDescription>Detalhamento de custos e preço final</CardDescription>
            </CardHeader>
            <CardContent>
              {resultado ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo de Materiais:</span>
                      <span className="font-medium">R$ {resultado.custo_materiais.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo de Linha:</span>
                      <span className="font-medium">R$ {resultado.custo_linha.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo de Energia:</span>
                      <span className="font-medium">R$ {resultado.custo_energia.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo Técnico (por pontos):</span>
                      <span className="font-medium">R$ {resultado.custo_por_pontos.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo de Fixação Adicional:</span>
                      <span className="font-medium">R$ {resultado.custo_fixacao_adicional.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Custo Total de Produção:</span>
                      <span className="font-bold text-blue-700">R$ {resultado.custo_total_producao.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço com Margem ({margemPercentual}%):</span>
                      <span className="font-medium">R$ {resultado.preco_sugerido_sem_arredondamento.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Preço Final Sugerido:</span>
                      <span className="text-2xl font-bold text-green-700">R$ {resultado.preco_final_arredondado.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* Arredondado para múltiplos de R$ 0,50</p>
                  </div>

                  <Separator />

                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Área do patch:</span>
                      <span>{resultado.area_patch_cm2.toFixed(2)} cm²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Área carregada (com orelha):</span>
                      <span>{(resultado.area_carregada_m2 * 10000).toFixed(2)} cm²</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Preencha os dados e clique em "Calcular Preço" para ver os resultados</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Desenvolvido com base na planilha de precificação Trilinha Bordados v6</p>
        </div>
      </div>
    </div>
  );
}
