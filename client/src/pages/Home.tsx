import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/AppContext";
import { Calculator, Box, Save, Lightbulb, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { sugerirBastidorParaQuantidade } from "@/lib/bastidor-optimizer";

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
  rotacao_sugerida: boolean;
  percentual_aproveitamento: number;
  quantidade_total: number;
  desconto_aplicado: number;
  preco_unitario_com_desconto: number;
  preco_total: number;
  venda_online: boolean;
  margem_online_aplicada: number;
  custo_matriz: number;
  matriz_isenta: boolean;
  limite_custo_atingido: boolean;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

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
  const [modoTrabalho, setModoTrabalho] = useState<"patches" | "peca_cliente">("patches");
  const [margemPerdaMaterial, setMargemPerdaMaterial] = useState<string>("5");

  // Estado do resultado
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [orcamentosSimilares, setOrcamentosSimilares] = useState<any[]>([]);

  // Mutação para criar orçamento
  const createOrcamentoMutation = trpc.orcamentos.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento salvo com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar orçamento: ${error.message}`);
    },
  });

  // Query para buscar orçamentos similares
  const { data: similares } = trpc.orcamentos.findSimilar.useQuery(
    {
      forma,
      tamanhoA: parseFloat(tamanhoA) || 0,
      pontos: parseInt(pontos) || 0,
    },
    {
      enabled: isAuthenticated && !!tamanhoA && !!pontos,
    }
  );

  // Atualizar orçamentos similares quando a query retornar
  useEffect(() => {
    if (similares && similares.length > 0) {
      setOrcamentosSimilares(similares);
    } else {
      setOrcamentosSimilares([]);
    }
  }, [similares]);

  // Carregar orçamento duplicado do localStorage
  useEffect(() => {
    const orcamentoDuplicar = localStorage.getItem("orcamento_duplicar");
    if (orcamentoDuplicar) {
      try {
        const orc = JSON.parse(orcamentoDuplicar);
        setForma(orc.forma);
        setTamanhoA(orc.tamanhoA.toString());
        if (orc.tamanhoB) setTamanhoB(orc.tamanhoB.toString());
        setPontos(orc.pontos.toString());
        setCores(orc.cores.toString());
        setFixacao(orc.fixacao);
        setMaquina(orc.maquina);
        setMaterialBase(orc.materialBase);
        setMargemPercentual(orc.margemPercentual.toString());
        setQuantidade(orc.quantidade.toString());
        setVendaOnline(orc.vendaOnline);
        localStorage.removeItem("orcamento_duplicar");
        toast.success("Orçamento carregado! Clique em Calcular Preço.");
      } catch (e) {
        console.error("Erro ao carregar orçamento duplicado", e);
      }
    }
  }, []);

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

    // Aplicar margem de perda de material se modo for "peca_cliente"
    const _margemPerdaMaterial = modoTrabalho === "peca_cliente" ? parseFloat(margemPerdaMaterial) / 100 : 0;
    const area_carregada_com_perda_m2 = area_carregada_m2 * (1 + _margemPerdaMaterial);

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

    const custo_materiais = custo_material_base_m2 * area_carregada_com_perda_m2 * (1 + configuracoes.desperdicio);

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

    // --- 5. Custo por Milhar de Ponto (com limite configurável) ---
    let custo_por_pontos = (_pontos / 1000) * configuracoes.custo_por_1000_pontos;
    const limite_atingido = custo_por_pontos > configuracoes.limite_custo_por_1000_pontos;
    if (limite_atingido) {
      custo_por_pontos = configuracoes.limite_custo_por_1000_pontos;
    }

    // --- 6. Custo de Fixação Adicional ---
    let custo_fixacao_adicional = 0;
    if (fixacao === "velcro") {
      custo_fixacao_adicional = configuracoes.custo_velcro;
    } else if (fixacao === "imantada") {
      custo_fixacao_adicional = configuracoes.custo_imantada;
    } else if (fixacao === "broche") {
      custo_fixacao_adicional = configuracoes.custo_broche;
    }

    // --- 7. Custo de Matriz (com isenção automática) ---
    let custo_matriz = configuracoes.custo_criacao_matriz;
    let matriz_isenta = false;

    // --- 8. Custo Total de Produção (unitário, sem matriz) ---
    const custo_total_producao = custo_materiais + custo_linha + custo_energia + custo_por_pontos + custo_fixacao_adicional;

    // --- 9. Preço de Venda Sugerido (Unitário) ---
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
    let preco_total_sem_matriz = preco_unitario_com_desconto * _quantidade;

    // Verificar isenção de matriz
    if (preco_total_sem_matriz >= configuracoes.valor_isencao_matriz) {
      matriz_isenta = true;
      custo_matriz = 0;
    }

    const preco_total = preco_total_sem_matriz + custo_matriz;

    // --- 10. Sugestão de Bastidor (Sistema Inteligente com Otimização) ---
    let bastidor_sugerido = "Nenhum bastidor adequado";
    let pecas_por_bastidor = 0;
    let rotacao_sugerida = false;
    let percentual_aproveitamento = 0;

    const otimizacao = sugerirBastidorParaQuantidade(
      largura_patch,
      altura_patch,
      _quantidade,
      bastidores,
      configuracoes.margem_entre_bordados
    );

    if (otimizacao) {
      bastidor_sugerido = otimizacao.bastidor.nome;
      pecas_por_bastidor = otimizacao.total_pecas;
      rotacao_sugerida = otimizacao.rotacao_sugerida;
      percentual_aproveitamento = otimizacao.percentual_aproveitamento;
    }

    const resultadoCalculado = {
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
      rotacao_sugerida,
      percentual_aproveitamento,
      quantidade_total: _quantidade,
      desconto_aplicado: desconto_aplicado * 100,
      preco_unitario_com_desconto,
      preco_total,
      venda_online: vendaOnline,
      margem_online_aplicada: margem_online_aplicada * 100,
      custo_matriz,
      matriz_isenta,
      limite_custo_atingido: limite_atingido,
      modo_trabalho: modoTrabalho,
      margem_perda_material: _margemPerdaMaterial * 100,
    };

    setResultado(resultadoCalculado);

    // Salvar automaticamente se o usuário estiver logado
    if (isAuthenticated) {
      createOrcamentoMutation.mutate({
        forma,
        tamanhoA: _tamanhoA,
        tamanhoB: forma === "retangular" ? _tamanhoB : undefined,
        pontos: _pontos,
        cores: _cores,
        fixacao,
        maquina,
        materialBase,
        margemPercentual: _margemPercentual,
        quantidade: _quantidade,
        vendaOnline,
        custoMateriais: custo_materiais,
        custoLinha: custo_linha,
        custoEnergia: custo_energia,
        custoPorPontos: custo_por_pontos,
        custoFixacaoAdicional: custo_fixacao_adicional,
        custoTotalProducao: custo_total_producao,
        precoFinalArredondado: preco_final_arredondado,
        descontoAplicado: desconto_aplicado * 100,
        precoUnitarioComDesconto: preco_unitario_com_desconto,
        precoTotal: preco_total,
        bastidorSugerido: bastidor_sugerido,
        pecasPorBastidor: pecas_por_bastidor,
      });
    }
  };

  const carregarOrcamentoSimilar = (orc: any) => {
    setForma(orc.forma);
    setTamanhoA(orc.tamanhoA.toString());
    if (orc.tamanhoB) setTamanhoB(orc.tamanhoB.toString());
    setPontos(orc.pontos.toString());
    setCores(orc.cores.toString());
    setFixacao(orc.fixacao);
    setMaquina(orc.maquina);
    setMaterialBase(orc.materialBase);
    setMargemPercentual(orc.margemPercentual.toString());
    setQuantidade(orc.quantidade.toString());
    setVendaOnline(orc.vendaOnline);
    toast.success("Dados carregados! Ajuste se necessário e clique em Calcular Preço.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-8 px-3 md:px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Calculadora de Custos de Bordados</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 px-4">Calcule o custo de produção e o preço de venda sugerido para seus bordados computadorizados</p>
        </div>

        {/* Orçamentos Similares */}
        {isAuthenticated && orcamentosSimilares.length > 0 && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Orçamentos Similares Encontrados</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="mb-3">Encontramos {orcamentosSimilares.length} orçamento(s) similar(es) aos dados que você está preenchendo:</p>
              <div className="space-y-2">
                {orcamentosSimilares.slice(0, 3).map((orc) => (
                  <div key={orc.id} className="flex items-center justify-between bg-white p-3 rounded border border-yellow-200">
                    <div className="text-sm">
                      <span className="font-medium">
                        {orc.forma === "retangular" ? `${orc.tamanhoA} × ${orc.tamanhoB} cm` : `Ø ${orc.tamanhoA} cm`}
                      </span>
                      {" • "}
                      <span>{orc.pontos.toLocaleString("pt-BR")} pts</span>
                      {" • "}
                      <span>{orc.cores} cores</span>
                      {" • "}
                      <span className="text-green-700 font-semibold">R$ {orc.precoTotal.toFixed(2)}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => carregarOrcamentoSimilar(orc)}>
                      Usar como Base
                    </Button>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
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

              {/* Modo de Trabalho */}
              <div className="space-y-2">
                <Label htmlFor="modoTrabalho">Modo de Trabalho</Label>
                <Select value={modoTrabalho} onValueChange={(value) => setModoTrabalho(value as "patches" | "peca_cliente")}>
                  <SelectTrigger id="modoTrabalho">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patches">Patches (Avulsos)</SelectItem>
                    <SelectItem value="peca_cliente">Peça de Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Margem de Perda de Material (apenas para Peça de Cliente) */}
              {modoTrabalho === "peca_cliente" && (
                <div className="space-y-2">
                  <Label htmlFor="margemPerdaMaterial">Margem de Perda de Material (%)</Label>
                  <Input id="margemPerdaMaterial" type="number" value={margemPerdaMaterial} onChange={(e) => setMargemPerdaMaterial(e.target.value)} />
                  <p className="text-xs text-gray-500">Margem adicional para perdas no corte e ajuste da peça</p>
                </div>
              )}

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
                          <>
                            <p className="text-xs text-gray-500 mt-1">
                              Capacidade: {resultado.pecas_por_bastidor} peça(s) por bastidor
                            </p>
                            {resultado.rotacao_sugerida && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                <RotateCw className="w-3 h-3" />
                                <span>Sugestão: Rotacionar matriz em 90° para melhor aproveitamento</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Aproveitamento: {resultado.percentual_aproveitamento.toFixed(1)}% da área útil
                            </p>
                          </>
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

                  {/* Custo de Matriz */}
                  {resultado.custo_matriz > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custo de Criação de Matriz:</span>
                          <span className="font-medium">R$ {resultado.custo_matriz.toFixed(2)}</span>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}
                  {resultado.matriz_isenta && (
                    <>
                      <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                        <p className="font-semibold">✓ Matriz Isenta</p>
                        <p className="text-xs mt-1">Pedido acima de R$ {configuracoes.valor_isencao_matriz.toFixed(2)} - custo de matriz não cobrado</p>
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
