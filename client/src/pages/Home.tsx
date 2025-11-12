import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/AppContext";
import { Calculator, Box } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  bastidor_sugerido: string;
  pecas_por_bastidor: number;
  quantidade_total: number;
  desconto_aplicado: number;
  preco_unitario_com_desconto: number;
  preco_total: number;
  venda_online: boolean;
  margem_online_aplicada: number;
}

export default function Home() {
  const { configuracoes, bastidores, descontosQuantidade } = useApp();

  // Estados do formulário
  const [forma, setForma] = useState<"retangular" | "circular">("retangular");
  const [tamanhoA, setTamanhoA] = useState<string>("12");
  const [tamanhoB, setTamanhoB] = useState<string>("9");
  const [pontos, setPontos] = useState<string>("28000");
  const [cores, setCores] = useState<string>("14");
  const [fixacao, setFixacao] = useState<string>("termocolante");
  const [maquina, setMaquina] = useState<string>("BP2100");
  const [materialBase, setMaterialBase] = useState<string>("Nylon 600");
  const [margemPercentual, setMargemPercentual] = useState<string>((configuracoes.margem_padrao * 100).toString());
  const [quantidade, setQuantidade] = useState<string>("1");
  const [vendaOnline, setVendaOnline] = useState<boolean>(false);

  // Estado do resultado
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  const calcularCusto = () => {
    // Conversão de valores
    const _tamanhoA = parseFloat(tamanhoA);
    const _tamanhoB = parseFloat(tamanhoB);
    const _pontos = parseInt(pontos);
    const _cores = parseInt(cores);
    const _margemPercentual = parseFloat(margemPercentual) / 100;
    const _quantidade = parseInt(quantidade);

    // Validação básica
    if (isNaN(_tamanhoA) || isNaN(_pontos) || isNaN(_cores) || isNaN(_margemPercentual) || isNaN(_quantidade)) {
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (forma === "retangular" && isNaN(_tamanhoB)) {
      toast.error("Por favor, preencha o lado menor para forma retangular.");
      return;
    }

    if (_quantidade <= 0) {
      toast.error("A quantidade deve ser maior que zero.");
      return;
    }

    // --- 1. Cálculo da Área ---
    let area_patch_cm2: number;
    let area_carregada_cm2: number;
    let largura_patch: number;
    let altura_patch: number;

    if (forma === "retangular") {
      area_patch_cm2 = _tamanhoA * _tamanhoB;
      area_carregada_cm2 = (_tamanhoA + configuracoes.orelha_cm) * (_tamanhoB + configuracoes.orelha_cm);
      largura_patch = _tamanhoA;
      altura_patch = _tamanhoB;
    } else {
      // Circular
      area_patch_cm2 = Math.PI * Math.pow(_tamanhoA / 2, 2);
      area_carregada_cm2 = Math.pow(_tamanhoA + configuracoes.orelha_cm, 2);
      largura_patch = _tamanhoA;
      altura_patch = _tamanhoA;
    }

    const area_carregada_m2 = area_carregada_cm2 / 10000;

    // --- 2. Custo de Materiais ---
    let custo_tecido_m2: number;
    if (materialBase === "Nylon 600") {
      custo_tecido_m2 = configuracoes.nylon_preco_metro / configuracoes.nylon_largura;
    } else {
      custo_tecido_m2 = configuracoes.sarja_preco_metro / configuracoes.sarja_largura;
    }

    const custo_entretela_m2 =
      configuracoes.entretela_preco_total / (configuracoes.entretela_metragem * configuracoes.entretela_largura);

    let custo_material_base_m2 = custo_tecido_m2 + custo_entretela_m2;

    if (fixacao === "termocolante") {
      const custo_termocolante_m2 = configuracoes.termocolante_preco_metro / configuracoes.termocolante_largura;
      custo_material_base_m2 += custo_termocolante_m2;
    }

    const custo_materiais = custo_material_base_m2 * area_carregada_m2 * (1 + configuracoes.desperdicio);

    // --- 3. Custo de Linha ---
    const consumo_linha = _pontos * (configuracoes.consumo_por_1000_pontos / 1000);
    const perda_trocas = _cores * configuracoes.perda_por_troca;
    const custo_linha_metro = configuracoes.linha_preco_rolo / configuracoes.linha_metros_rolo;
    const custo_linha = (consumo_linha + perda_trocas) * custo_linha_metro;

    // --- 4. Custo de Energia ---
    let pts_min: number;
    let kw: number;

    if (maquina === "BP1430") {
      pts_min = configuracoes.bp1430_velocidade;
      kw = configuracoes.bp1430_potencia;
    } else {
      pts_min = configuracoes.bp2100_velocidade;
      kw = configuracoes.bp2100_potencia;
    }

    const tempo_min = _pontos / pts_min;
    const tempo_h = tempo_min / 60;
    const consumo_kwh = kw * tempo_h;
    const custo_energia = consumo_kwh * configuracoes.tarifa_energia;

    // --- 5. Custo por Milhar de Ponto ---
    const custo_por_pontos = (_pontos / 1000) * configuracoes.custo_por_1000_pontos;

    // --- 6. Custo de Fixação Adicional ---
    let custo_fixacao_adicional = 0;
    if (fixacao === "velcro") {
      custo_fixacao_adicional = configuracoes.custo_velcro;
    } else if (fixacao === "imantada") {
      custo_fixacao_adicional = configuracoes.custo_imantada;
    } else if (fixacao === "broche") {
      custo_fixacao_adicional = configuracoes.custo_broche;
    }

    // --- 7. Custo Total de Produção ---
    const custo_total_producao = custo_materiais + custo_linha + custo_energia + custo_por_pontos + custo_fixacao_adicional;

    // --- 8. Preço de Venda Sugerido (Unitário) ---
    let margem_final = _margemPercentual;
    let margem_online_aplicada = 0;

    if (vendaOnline) {
      margem_online_aplicada = configuracoes.margem_venda_online;
      margem_final += margem_online_aplicada;
    }

    const preco_sugerido_sem_arredondamento = custo_total_producao * (1 + margem_final);
    const preco_final_arredondado =
      Math.ceil(preco_sugerido_sem_arredondamento / configuracoes.arredondamento) * configuracoes.arredondamento;

    // --- 9. Desconto por Quantidade ---
    let desconto_aplicado = 0;
    const descontosOrdenados = [...descontosQuantidade].sort((a, b) => b.quantidade_minima - a.quantidade_minima);

    for (const desconto of descontosOrdenados) {
      if (_quantidade >= desconto.quantidade_minima) {
        desconto_aplicado = desconto.desconto_percentual / 100;
        break;
      }
    }

    const preco_unitario_com_desconto = preco_final_arredondado * (1 - desconto_aplicado);
    const preco_total = preco_unitario_com_desconto * _quantidade;

    // --- 10. Sugestão de Bastidor ---
    let bastidor_sugerido = "Nenhum bastidor adequado";
    let pecas_por_bastidor = 0;

    // Ordenar bastidores por área (menor para maior)
    const bastidoresOrdenados = [...bastidores].sort((a, b) => a.largura * a.altura - b.largura * b.altura);

    for (const bastidor of bastidoresOrdenados) {
      // Calcular quantas peças cabem no bastidor (considerando gutter)
      const pecas_largura = Math.floor(bastidor.largura / (largura_patch + configuracoes.gutter_cm));
      const pecas_altura = Math.floor(bastidor.altura / (altura_patch + configuracoes.gutter_cm));
      const total_pecas = pecas_largura * pecas_altura;

      if (total_pecas >= 1) {
        bastidor_sugerido = bastidor.nome;
        pecas_por_bastidor = total_pecas;
        break;
      }
    }

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
      bastidor_sugerido,
      pecas_por_bastidor,
      quantidade_total: _quantidade,
      desconto_aplicado: desconto_aplicado * 100,
      preco_unitario_com_desconto,
      preco_total,
      venda_online: vendaOnline,
      margem_online_aplicada: margem_online_aplicada * 100,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Calculadora de Custos de Bordados</h1>
          </div>
          <p className="text-gray-600">Calcule o custo de produção e o preço de venda sugerido para seus bordados computadorizados</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
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

              {/* Margem e Quantidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margem">Margem de Lucro (%)</Label>
                  <Input id="margem" type="number" value={margemPercentual} onChange={(e) => setMargemPercentual(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input id="quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                </div>
              </div>

              {/* Venda Online */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex-1">
                  <Label htmlFor="vendaOnline" className="cursor-pointer">
                    Venda Online (Shopee, etc.)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Adiciona {(configuracoes.margem_venda_online * 100).toFixed(0)}% de margem extra
                  </p>
                </div>
                <Switch id="vendaOnline" checked={vendaOnline} onCheckedChange={setVendaOnline} />
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
                  {/* Bastidor Sugerido */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-start gap-3">
                      <Box className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">Bastidor Sugerido</p>
                        <p className="text-sm text-gray-600 mt-1">{resultado.bastidor_sugerido}</p>
                        {resultado.pecas_por_bastidor > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Capacidade: {resultado.pecas_por_bastidor} peça(s) por bastidor
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Custos Detalhados */}
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

                  {/* Custo Total */}
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Custo Total de Produção:</span>
                      <span className="font-bold text-blue-700">R$ {resultado.custo_total_producao.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço Unitário (com margem):</span>
                      <span className="font-medium">R$ {resultado.preco_final_arredondado.toFixed(2)}</span>
                    </div>
                    {resultado.venda_online && (
                      <div className="flex justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <span>Margem extra venda online:</span>
                        <span>+{resultado.margem_online_aplicada.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Quantidade e Desconto */}
                  {resultado.quantidade_total > 1 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Quantidade:</span>
                          <span className="font-medium">{resultado.quantidade_total} unidade(s)</span>
                        </div>
                        {resultado.desconto_aplicado > 0 && (
                          <div className="flex justify-between text-sm text-green-700 bg-green-50 p-2 rounded">
                            <span>Desconto por quantidade:</span>
                            <span className="font-semibold">-{resultado.desconto_aplicado.toFixed(0)}%</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Preço Unitário (com desconto):</span>
                          <span className="font-medium">R$ {resultado.preco_unitario_com_desconto.toFixed(2)}</span>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Preço Final */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Preço Total:</span>
                      <span className="text-2xl font-bold text-green-700">R$ {resultado.preco_total.toFixed(2)}</span>
                    </div>
                    {resultado.quantidade_total === 1 && (
                      <p className="text-xs text-gray-500 mt-2">* Arredondado para múltiplos de R$ {configuracoes.arredondamento.toFixed(2)}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Informações Adicionais */}
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
                <div className="flex items-center justify-center h-96 text-gray-400">
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
