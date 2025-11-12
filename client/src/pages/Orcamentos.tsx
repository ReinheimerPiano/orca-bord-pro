import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FileText, Trash2, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Orcamentos() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orcamentos, isLoading, refetch } = trpc.orcamentos.list.useQuery();
  const deleteMutation = trpc.orcamentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento removido com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao remover orçamento: ${error.message}`);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Deseja realmente remover este orçamento?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicate = (orcamento: any) => {
    // Redirecionar para a calculadora com os dados preenchidos
    // Armazenar no localStorage temporariamente
    localStorage.setItem("orcamento_duplicar", JSON.stringify(orcamento));
    setLocation("/");
    toast.success("Orçamento carregado na calculadora!");
  };

  // Filtrar orçamentos baseado no termo de busca
  const orcamentosFiltrados = orcamentos?.filter((orc) => {
    const termo = searchTerm.toLowerCase();
    return (
      orc.forma.toLowerCase().includes(termo) ||
      orc.materialBase.toLowerCase().includes(termo) ||
      orc.fixacao.toLowerCase().includes(termo) ||
      orc.maquina.toLowerCase().includes(termo) ||
      (orc.bastidorSugerido && orc.bastidorSugerido.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Orçamentos Salvos</h1>
          </div>
          <Button onClick={() => setLocation("/")}>Voltar para Calculadora</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Orçamentos</CardTitle>
            <CardDescription>Todos os orçamentos que você calculou ficam salvos aqui</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por forma, material, fixação, máquina ou bastidor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabela */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : !orcamentosFiltrados || orcamentosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>
                  {searchTerm
                    ? "Nenhum orçamento encontrado com esse termo de busca."
                    : "Nenhum orçamento salvo ainda. Calcule um orçamento para começar!"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Cores</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead className="text-right">Preço Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosFiltrados.map((orc) => (
                      <TableRow key={orc.id}>
                        <TableCell className="font-medium">
                          {new Date(orc.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="capitalize">{orc.forma}</TableCell>
                        <TableCell>
                          {orc.forma === "retangular"
                            ? `${orc.tamanhoA} × ${orc.tamanhoB} cm`
                            : `Ø ${orc.tamanhoA} cm`}
                        </TableCell>
                        <TableCell>{orc.pontos.toLocaleString("pt-BR")}</TableCell>
                        <TableCell>{orc.cores}</TableCell>
                        <TableCell>{orc.materialBase}</TableCell>
                        <TableCell>{orc.quantidade}</TableCell>
                        <TableCell className="text-right font-semibold text-green-700">
                          R$ {orc.precoTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleDuplicate(orc)}>
                              Duplicar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(orc.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Estatísticas */}
            {orcamentosFiltrados && orcamentosFiltrados.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total de orçamentos:</p>
                    <p className="text-lg font-semibold text-gray-900">{orcamentosFiltrados.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor total:</p>
                    <p className="text-lg font-semibold text-green-700">
                      R${" "}
                      {orcamentosFiltrados
                        .reduce((sum, orc) => sum + orc.precoTotal, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Peças totais:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {orcamentosFiltrados.reduce((sum, orc) => sum + orc.quantidade, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
