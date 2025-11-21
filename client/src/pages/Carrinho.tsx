import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2, ShoppingCart, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

interface ItemCarrinho {
  id: string;
  forma: "retangular" | "circular";
  tamanhoA: number;
  tamanhoB?: number;
  pontos: number;
  cores: number;
  fixacao: string;
  maquina: string;
  materialBase: string;
  quantidade: number;
  modoTrabalho: "patches" | "peca_cliente";
  margemPerdaMaterial: number;
  margemLucro: number;
  precoUnitario: number;
  precoTotal: number;
  custoTotal: number;
}

export default function Carrinho() {
  const { configuracoes } = useApp();
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Formulário para novo item
  const [forma, setForma] = useState<"retangular" | "circular">("retangular");
  const [tamanhoA, setTamanhoA] = useState("12");
  const [tamanhoB, setTamanhoB] = useState("9");
  const [pontos, setPontos] = useState("28000");
  const [cores, setCores] = useState("14");
  const [fixacao, setFixacao] = useState("termocolante");
  const [maquina, setMaquina] = useState("BP2100");
  const [materialBase, setMaterialBase] = useState("Nylon 600");
  const [quantidade, setQuantidade] = useState("1");
  const [modoTrabalho, setModoTrabalho] = useState<"patches" | "peca_cliente">("patches");
  const [margemPerdaMaterial, setMargemPerdaMaterial] = useState("5");
  const [margemLucro, setMargemLucro] = useState((configuracoes.margem_padrao * 100).toString());

  // Carregar itens do localStorage
  useEffect(() => {
    const itensArmazenados = localStorage.getItem("carrinho_itens");
    if (itensArmazenados) {
      try {
        setItens(JSON.parse(itensArmazenados));
      } catch (e) {
        console.error("Erro ao carregar itens do carrinho", e);
      }
    }
  }, []);

  // Salvar itens no localStorage
  useEffect(() => {
    localStorage.setItem("carrinho_itens", JSON.stringify(itens));
  }, [itens]);

  const adicionarItem = () => {
    const _tamanhoA = parseFloat(tamanhoA);
    const _tamanhoB = parseFloat(tamanhoB);
    const _pontos = parseInt(pontos);
    const _cores = parseInt(cores);
    const _quantidade = parseInt(quantidade);
    const _margemLucro = parseFloat(margemLucro) / 100;

    if (isNaN(_tamanhoA) || isNaN(_pontos) || isNaN(_cores) || isNaN(_quantidade)) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    if (forma === "retangular" && isNaN(_tamanhoB)) {
      toast.error("Preencha o lado menor para forma retangular");
      return;
    }

    // Cálculo simplificado (você pode usar a mesma lógica da calculadora)
    const custoBase = 10; // Placeholder - usar lógica real da calculadora
    const precoUnitario = custoBase * (1 + _margemLucro);
    const precoTotal = precoUnitario * _quantidade;
    const custoTotal = custoBase * _quantidade;

    const novoItem: ItemCarrinho = {
      id: editandoId || Date.now().toString(),
      forma,
      tamanhoA: _tamanhoA,
      tamanhoB: forma === "retangular" ? _tamanhoB : undefined,
      pontos: _pontos,
      cores: _cores,
      fixacao,
      maquina,
      materialBase,
      quantidade: _quantidade,
      modoTrabalho,
      margemPerdaMaterial: parseFloat(margemPerdaMaterial),
      margemLucro: _margemLucro * 100,
      precoUnitario,
      precoTotal,
      custoTotal,
    };

    if (editandoId) {
      setItens(itens.map((item) => (item.id === editandoId ? novoItem : item)));
      setEditandoId(null);
      toast.success("Item atualizado!");
    } else {
      setItens([...itens, novoItem]);
      toast.success("Item adicionado ao carrinho!");
    }

    // Limpar formulário
    setForma("retangular");
    setTamanhoA("12");
    setTamanhoB("9");
    setPontos("28000");
    setCores("14");
    setFixacao("termocolante");
    setMaquina("BP2100");
    setMaterialBase("Nylon 600");
    setQuantidade("1");
    setModoTrabalho("patches");
    setMargemPerdaMaterial("5");
    setMargemLucro((configuracoes.margem_padrao * 100).toString());
  };

  const editarItem = (item: ItemCarrinho) => {
    setEditandoId(item.id);
    setForma(item.forma);
    setTamanhoA(item.tamanhoA.toString());
    if (item.tamanhoB) setTamanhoB(item.tamanhoB.toString());
    setPontos(item.pontos.toString());
    setCores(item.cores.toString());
    setFixacao(item.fixacao);
    setMaquina(item.maquina);
    setMaterialBase(item.materialBase);
    setQuantidade(item.quantidade.toString());
    setModoTrabalho(item.modoTrabalho);
    setMargemPerdaMaterial(item.margemPerdaMaterial.toString());
    setMargemLucro(item.margemLucro.toString());
  };

  const removerItem = (id: string) => {
    setItens(itens.filter((item) => item.id !== id));
    if (editandoId === id) {
      setEditandoId(null);
    }
    toast.success("Item removido do carrinho");
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForma("retangular");
    setTamanhoA("12");
    setTamanhoB("9");
    setPontos("28000");
    setCores("14");
    setFixacao("termocolante");
    setMaquina("BP2100");
    setMaterialBase("Nylon 600");
    setQuantidade("1");
    setModoTrabalho("patches");
    setMargemPerdaMaterial("5");
    setMargemLucro((configuracoes.margem_padrao * 100).toString());
  };

  // Cálculos consolidados
  const custoTotalCarrinho = itens.reduce((sum, item) => sum + item.custoTotal, 0);
  const precoTotalCarrinho = itens.reduce((sum, item) => sum + item.precoTotal, 0);
  
  // Cálculo de desconto progressivo
  let descontoPercentual = 0;
  if (precoTotalCarrinho >= 50000) descontoPercentual = 5;
  if (precoTotalCarrinho >= 100000) descontoPercentual = 10;
  if (precoTotalCarrinho >= 200000) descontoPercentual = 15;
  if (precoTotalCarrinho >= 500000) descontoPercentual = 20;
  
  const descontoValor = Math.round(precoTotalCarrinho * (descontoPercentual / 100));
  const precoComDesconto = precoTotalCarrinho - descontoValor;
  const margemTotalCarrinho = precoComDesconto - custoTotalCarrinho;
  const margemPercentual = custoTotalCarrinho > 0 ? (margemTotalCarrinho / custoTotalCarrinho) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Carrinho de Orçamento</h1>
          </div>
          <p className="text-gray-600">Adicione múltiplos itens para criar um orçamento consolidado</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulário de Novo Item */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editandoId ? "Editar Item" : "Novo Item"}</CardTitle>
              <CardDescription>Preencha os dados do bordado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
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

              {forma === "retangular" ? (
                <div className="grid grid-cols-2 gap-2">
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="pontos">Pontos</Label>
                  <Input id="pontos" type="number" value={pontos} onChange={(e) => setPontos(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cores">Cores</Label>
                  <Input id="cores" type="number" value={cores} onChange={(e) => setCores(e.target.value)} />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input id="quantidade" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              </div>

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

              {modoTrabalho === "peca_cliente" && (
                <div className="space-y-2">
                  <Label htmlFor="margemPerdaMaterial">Margem de Perda (%)</Label>
                  <Input
                    id="margemPerdaMaterial"
                    type="number"
                    value={margemPerdaMaterial}
                    onChange={(e) => setMargemPerdaMaterial(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                <Input
                  id="margemLucro"
                  type="number"
                  value={margemLucro}
                  onChange={(e) => setMargemLucro(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={adicionarItem} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  {editandoId ? "Atualizar" : "Adicionar"}
                </Button>
                {editandoId && (
                  <Button variant="outline" onClick={cancelarEdicao}>
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Itens e Resumo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabela de Itens */}
            <Card>
              <CardHeader>
                <CardTitle>Itens no Carrinho</CardTitle>
                <CardDescription>Total: {itens.length} item(ns)</CardDescription>
              </CardHeader>
              <CardContent>
                {itens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item no carrinho. Adicione itens acima.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">
                              <div className="font-medium">
                                {item.forma === "retangular"
                                  ? `${item.tamanhoA} × ${item.tamanhoB} cm`
                                  : `Ø ${item.tamanhoA} cm`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.pontos.toLocaleString("pt-BR")} pts • {item.cores} cores
                              </div>
                            </TableCell>
                            <TableCell>{item.quantidade}</TableCell>
                            <TableCell>R$ {(item.precoUnitario / 100).toFixed(2)}</TableCell>
                            <TableCell className="font-medium">R$ {(item.precoTotal / 100).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => editarItem(item)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => removerItem(item.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo Consolidado */}
            {itens.length > 0 && (
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                <CardHeader>
                  <CardTitle>Resumo do Orçamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Custo Total</p>
                      <p className="text-2xl font-bold text-red-600">R$ {(custoTotalCarrinho / 100).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Preço Total</p>
                      <p className="text-2xl font-bold text-green-600">R$ {(precoTotalCarrinho / 100).toFixed(2)}</p>
                    </div>
                  </div>

                  {descontoPercentual > 0 && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Desconto Progressivo ({descontoPercentual}%)</p>
                      <p className="text-2xl font-bold text-green-600">-R$ {(descontoValor / 100).toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="bg-indigo-50 border-2 border-indigo-300 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Preço Final (com desconto)</p>
                    <p className="text-2xl font-bold text-indigo-600">R$ {(precoComDesconto / 100).toFixed(2)}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Margem Total</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-indigo-600">R$ {(margemTotalCarrinho / 100).toFixed(2)}</p>
                      <p className="text-lg text-indigo-600">({margemPercentual.toFixed(1)}%)</p>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    Finalizar Orçamento
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
