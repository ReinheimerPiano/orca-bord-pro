import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Materiais() {
  const [nome, setNome] = useState("");
  const [precoMetro, setPrecoMetro] = useState("");
  const [largura, setLargura] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Query para listar materiais
  const { data: materiais = [], refetch } = trpc.materiais.list.useQuery();

  // Mutação para criar material
  const createMutation = trpc.materiais.create.useMutation({
    onSuccess: () => {
      toast.success("Material criado com sucesso!");
      setNome("");
      setPrecoMetro("");
      setLargura("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutação para atualizar material
  const updateMutation = trpc.materiais.update.useMutation({
    onSuccess: () => {
      toast.success("Material atualizado com sucesso!");
      setNome("");
      setPrecoMetro("");
      setLargura("");
      setEditandoId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutação para deletar material
  const deleteMutation = trpc.materiais.delete.useMutation({
    onSuccess: () => {
      toast.success("Material deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !precoMetro || !largura) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (editandoId) {
      updateMutation.mutate({
        id: editandoId,
        nome,
        preco_metro: parseFloat(precoMetro),
        largura: parseFloat(largura),
      });
    } else {
      createMutation.mutate({
        nome,
        preco_metro: parseFloat(precoMetro),
        largura: parseFloat(largura),
      });
    }
  };

  const handleEditar = (material: any) => {
    setEditandoId(material.id);
    setNome(material.nome);
    setPrecoMetro((material.preco_metro / 100).toString());
    setLargura((material.largura / 100).toString());
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setNome("");
    setPrecoMetro("");
    setLargura("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Materiais</h1>
          <p className="text-gray-600">Cadastre e gerencie os tecidos disponíveis</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editandoId ? "Editar Material" : "Novo Material"}</CardTitle>
              <CardDescription>Preencha os dados do tecido</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Material</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Nylon 600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precoMetro">Preço por Metro (R$)</Label>
                  <Input
                    id="precoMetro"
                    type="number"
                    step="0.01"
                    value={precoMetro}
                    onChange={(e) => setPrecoMetro(e.target.value)}
                    placeholder="Ex: 9.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (m)</Label>
                  <Input
                    id="largura"
                    type="number"
                    step="0.01"
                    value={largura}
                    onChange={(e) => setLargura(e.target.value)}
                    placeholder="Ex: 1.40"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {editandoId ? "Atualizar" : "Adicionar"}
                  </Button>
                  {editandoId && (
                    <Button type="button" variant="outline" onClick={handleCancelar}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tabela de Materiais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Materiais Cadastrados</CardTitle>
              <CardDescription>Total: {materiais.length} material(is)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço/Metro (R$)</TableHead>
                      <TableHead>Largura (m)</TableHead>
                      <TableHead>Preço/m² (R$)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiais.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Nenhum material cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      materiais.map((material: any) => {
                        const precoM2 = (material.preco_metro / 100) / (material.largura / 100);
                        return (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.nome}</TableCell>
                            <TableCell>R$ {(material.preco_metro / 100).toFixed(2)}</TableCell>
                            <TableCell>{(material.largura / 100).toFixed(2)}</TableCell>
                            <TableCell>R$ {precoM2.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditar(material)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate({ id: material.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
