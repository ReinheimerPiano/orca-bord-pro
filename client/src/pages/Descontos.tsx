import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp, type DescontoQuantidade } from "@/contexts/AppContext";
import { Percent, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Descontos() {
  const { descontosQuantidade, setDescontosQuantidade } = useApp();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState<number | null>(null);
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState("");

  const abrirDialogNovo = () => {
    setModoEdicao(false);
    setIndiceAtual(null);
    setQuantidadeMinima("");
    setDescontoPercentual("");
    setDialogAberto(true);
  };

  const abrirDialogEditar = (desconto: DescontoQuantidade, indice: number) => {
    setModoEdicao(true);
    setIndiceAtual(indice);
    setQuantidadeMinima(desconto.quantidade_minima.toString());
    setDescontoPercentual(desconto.desconto_percentual.toString());
    setDialogAberto(true);
  };

  const handleSalvar = () => {
    if (!quantidadeMinima || !descontoPercentual) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const _quantidadeMinima = parseInt(quantidadeMinima);
    const _descontoPercentual = parseFloat(descontoPercentual);

    if (isNaN(_quantidadeMinima) || isNaN(_descontoPercentual) || _quantidadeMinima <= 0 || _descontoPercentual <= 0) {
      toast.error("Quantidade e desconto devem ser números positivos!");
      return;
    }

    if (_descontoPercentual > 100) {
      toast.error("O desconto não pode ser maior que 100%!");
      return;
    }

    const novoDesconto: DescontoQuantidade = {
      quantidade_minima: _quantidadeMinima,
      desconto_percentual: _descontoPercentual,
    };

    if (modoEdicao && indiceAtual !== null) {
      const novosDescontos = [...descontosQuantidade];
      novosDescontos[indiceAtual] = novoDesconto;
      setDescontosQuantidade(novosDescontos);
      toast.success("Desconto atualizado com sucesso!");
    } else {
      setDescontosQuantidade([...descontosQuantidade, novoDesconto]);
      toast.success("Desconto adicionado com sucesso!");
    }

    setDialogAberto(false);
  };

  const handleRemover = (indice: number) => {
    if (confirm("Deseja realmente remover este desconto?")) {
      const novosDescontos = descontosQuantidade.filter((_, i) => i !== indice);
      setDescontosQuantidade(novosDescontos);
      toast.success("Desconto removido com sucesso!");
    }
  };

  // Ordenar descontos por quantidade mínima
  const descontosOrdenados = [...descontosQuantidade].sort((a, b) => a.quantidade_minima - b.quantidade_minima);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Descontos por Quantidade</h1>
          </div>
          <Button onClick={abrirDialogNovo}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Desconto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tabela de Descontos</CardTitle>
            <CardDescription>Configure descontos progressivos baseados na quantidade de peças</CardDescription>
          </CardHeader>
          <CardContent>
            {descontosOrdenados.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Percent className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum desconto cadastrado. Clique em "Novo Desconto" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantidade Mínima</TableHead>
                    <TableHead className="text-center">Desconto (%)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {descontosOrdenados.map((desconto, indice) => {
                    const indiceOriginal = descontosQuantidade.findIndex(
                      (d) => d.quantidade_minima === desconto.quantidade_minima && d.desconto_percentual === desconto.desconto_percentual
                    );
                    return (
                      <TableRow key={indice}>
                        <TableCell className="font-medium">{desconto.quantidade_minima} unidades ou mais</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {desconto.desconto_percentual}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => abrirDialogEditar(desconto, indiceOriginal)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRemover(indiceOriginal)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {descontosOrdenados.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Como funciona:</strong> O desconto é aplicado automaticamente quando a quantidade de peças atinge o valor mínimo
                  configurado. O maior desconto disponível para a quantidade será aplicado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Adicionar/Editar */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modoEdicao ? "Editar Desconto" : "Novo Desconto"}</DialogTitle>
              <DialogDescription>
                {modoEdicao ? "Atualize as informações do desconto" : "Adicione um novo desconto por quantidade"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantidadeMinima">Quantidade Mínima</Label>
                <Input
                  id="quantidadeMinima"
                  type="number"
                  value={quantidadeMinima}
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-gray-500">A partir de quantas unidades este desconto será aplicado</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descontoPercentual">Desconto (%)</Label>
                <Input
                  id="descontoPercentual"
                  type="number"
                  step="0.1"
                  value={descontoPercentual}
                  onChange={(e) => setDescontoPercentual(e.target.value)}
                  placeholder="Ex: 5"
                />
                <p className="text-xs text-gray-500">Percentual de desconto a ser aplicado</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvar}>{modoEdicao ? "Atualizar" : "Adicionar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
