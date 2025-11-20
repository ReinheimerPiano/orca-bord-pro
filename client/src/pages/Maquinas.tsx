import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Maquinas() {
  const [nome, setNome] = useState("");
  const [velocidade, setVelocidade] = useState("");
  const [potencia, setPotencia] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Query para listar máquinas
  const { data: maquinas = [], refetch } = trpc.maquinas.list.useQuery();

  // Mutação para criar máquina
  const createMutation = trpc.maquinas.create.useMutation({
    onSuccess: () => {
      toast.success("Máquina criada com sucesso!");
      setNome("");
      setVelocidade("");
      setPotencia("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutação para atualizar máquina
  const updateMutation = trpc.maquinas.update.useMutation({
    onSuccess: () => {
      toast.success("Máquina atualizada com sucesso!");
      setNome("");
      setVelocidade("");
      setPotencia("");
      setEditandoId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutação para deletar máquina
  const deleteMutation = trpc.maquinas.delete.useMutation({
    onSuccess: () => {
      toast.success("Máquina deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !velocidade || !potencia) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (editandoId) {
      updateMutation.mutate({
        id: editandoId,
        nome,
        velocidade: parseFloat(velocidade),
        potencia: parseFloat(potencia),
      });
    } else {
      createMutation.mutate({
        nome,
        velocidade: parseFloat(velocidade),
        potencia: parseFloat(potencia),
      });
    }
  };

  const handleEditar = (maquina: any) => {
    setEditandoId(maquina.id);
    setNome(maquina.nome);
    setVelocidade(maquina.velocidade.toString());
    setPotencia((maquina.potencia / 100).toString());
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setNome("");
    setVelocidade("");
    setPotencia("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de Máquinas</h1>
          <p className="text-gray-600">Cadastre e gerencie as máquinas de bordado disponíveis</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{editandoId ? "Editar Máquina" : "Nova Máquina"}</CardTitle>
              <CardDescription>Preencha os dados da máquina</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Máquina</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: BP2100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="velocidade">Velocidade (pontos/min)</Label>
                  <Input
                    id="velocidade"
                    type="number"
                    value={velocidade}
                    onChange={(e) => setVelocidade(e.target.value)}
                    placeholder="Ex: 1050"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="potencia">Potência (kW)</Label>
                  <Input
                    id="potencia"
                    type="number"
                    step="0.01"
                    value={potencia}
                    onChange={(e) => setPotencia(e.target.value)}
                    placeholder="Ex: 0.12"
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

          {/* Tabela de Máquinas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Máquinas Cadastradas</CardTitle>
              <CardDescription>Total: {maquinas.length} máquina(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Velocidade (pts/min)</TableHead>
                      <TableHead>Potência (kW)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maquinas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          Nenhuma máquina cadastrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      maquinas.map((maquina: any) => (
                        <TableRow key={maquina.id}>
                          <TableCell className="font-medium">{maquina.nome}</TableCell>
                          <TableCell>{maquina.velocidade}</TableCell>
                          <TableCell>{(maquina.potencia / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditar(maquina)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate({ id: maquina.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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
