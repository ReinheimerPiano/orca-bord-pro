import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp, type Bastidor } from "@/contexts/AppContext";
import { Box, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Bastidores() {
  const { bastidores, adicionarBastidor, editarBastidor, removerBastidor } = useApp();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [bastidorAtual, setBastidorAtual] = useState<Bastidor | null>(null);
  const [nome, setNome] = useState("");
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");

  const abrirDialogNovo = () => {
    setModoEdicao(false);
    setBastidorAtual(null);
    setNome("");
    setLargura("");
    setAltura("");
    setDialogAberto(true);
  };

  const abrirDialogEditar = (bastidor: Bastidor) => {
    setModoEdicao(true);
    setBastidorAtual(bastidor);
    setNome(bastidor.nome);
    setLargura(bastidor.largura.toString());
    setAltura(bastidor.altura.toString());
    setDialogAberto(true);
  };

  const handleSalvar = () => {
    if (!nome || !largura || !altura) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const _largura = parseFloat(largura);
    const _altura = parseFloat(altura);

    if (isNaN(_largura) || isNaN(_altura) || _largura <= 0 || _altura <= 0) {
      toast.error("Largura e altura devem ser números positivos!");
      return;
    }

    if (modoEdicao && bastidorAtual) {
      editarBastidor(bastidorAtual.id, { nome, largura: _largura, altura: _altura });
      toast.success("Bastidor atualizado com sucesso!");
    } else {
      adicionarBastidor({ nome, largura: _largura, altura: _altura });
      toast.success("Bastidor adicionado com sucesso!");
    }

    setDialogAberto(false);
  };

  const handleRemover = (id: string, nome: string) => {
    if (confirm(`Deseja realmente remover o bastidor "${nome}"?`)) {
      removerBastidor(id);
      toast.success("Bastidor removido com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Box className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Bastidores</h1>
          </div>
          <Button onClick={abrirDialogNovo}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Bastidor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bastidores Cadastrados</CardTitle>
            <CardDescription>Gerencie os bastidores disponíveis para cálculo de capacidade</CardDescription>
          </CardHeader>
          <CardContent>
            {bastidores.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum bastidor cadastrado. Clique em "Novo Bastidor" para adicionar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-center">Largura (cm)</TableHead>
                    <TableHead className="text-center">Altura (cm)</TableHead>
                    <TableHead className="text-center">Área (cm²)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bastidores.map((bastidor) => (
                    <TableRow key={bastidor.id}>
                      <TableCell className="font-medium">{bastidor.nome}</TableCell>
                      <TableCell className="text-center">{bastidor.largura}</TableCell>
                      <TableCell className="text-center">{bastidor.altura}</TableCell>
                      <TableCell className="text-center">{(bastidor.largura * bastidor.altura).toFixed(0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => abrirDialogEditar(bastidor)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRemover(bastidor.id, bastidor.nome)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Adicionar/Editar */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modoEdicao ? "Editar Bastidor" : "Novo Bastidor"}</DialogTitle>
              <DialogDescription>
                {modoEdicao ? "Atualize as informações do bastidor" : "Adicione um novo bastidor ao sistema"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Bastidor</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Brother Large 18x30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="largura">Largura (cm)</Label>
                  <Input id="largura" type="number" value={largura} onChange={(e) => setLargura(e.target.value)} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input id="altura" type="number" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="18" />
                </div>
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
