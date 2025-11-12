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
  const [larguraUtil, setLarguraUtil] = useState("");
  const [alturaUtil, setAlturaUtil] = useState("");
  const [margemInterna, setMargemInterna] = useState("0.25");
  const [orelhaSeguranca, setOrelhaSeguranca] = useState("2.0");

  const abrirDialogNovo = () => {
    setModoEdicao(false);
    setBastidorAtual(null);
    setNome("");
    setLargura("");
    setAltura("");
    setLarguraUtil("");
    setAlturaUtil("");
    setMargemInterna("0.25");
    setOrelhaSeguranca("2.0");
    setDialogAberto(true);
  };

  const abrirDialogEditar = (bastidor: Bastidor) => {
    setModoEdicao(true);
    setBastidorAtual(bastidor);
    setNome(bastidor.nome);
    setLargura(bastidor.largura.toString());
    setAltura(bastidor.altura.toString());
    setLarguraUtil(bastidor.largura_util.toString());
    setAlturaUtil(bastidor.altura_util.toString());
    setMargemInterna(bastidor.margem_interna.toString());
    setOrelhaSeguranca(bastidor.orelha_seguranca.toString());
    setDialogAberto(true);
  };

  const handleSalvar = () => {
    if (!nome || !largura || !altura || !larguraUtil || !alturaUtil || !margemInterna || !orelhaSeguranca) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const _largura = parseFloat(largura);
    const _altura = parseFloat(altura);
    const _larguraUtil = parseFloat(larguraUtil);
    const _alturaUtil = parseFloat(alturaUtil);
    const _margemInterna = parseFloat(margemInterna);
    const _orelhaSeguranca = parseFloat(orelhaSeguranca);

    if (
      isNaN(_largura) || isNaN(_altura) || isNaN(_larguraUtil) || isNaN(_alturaUtil) ||
      isNaN(_margemInterna) || isNaN(_orelhaSeguranca) ||
      _largura <= 0 || _altura <= 0 || _larguraUtil <= 0 || _alturaUtil <= 0
    ) {
      toast.error("Todos os valores devem ser números positivos!");
      return;
    }

    if (_larguraUtil >= _largura || _alturaUtil >= _altura) {
      toast.error("Área útil deve ser menor que o tamanho total do bastidor!");
      return;
    }

    const bastidorData = {
      nome,
      largura: _largura,
      altura: _altura,
      largura_util: _larguraUtil,
      altura_util: _alturaUtil,
      margem_interna: _margemInterna,
      orelha_seguranca: _orelhaSeguranca,
    };

    if (modoEdicao && bastidorAtual) {
      editarBastidor(bastidorAtual.id, bastidorData);
      toast.success("Bastidor atualizado com sucesso!");
    } else {
      adicionarBastidor(bastidorData);
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
                  <Label htmlFor="largura">Largura Total (cm)</Label>
                  <Input id="largura" type="number" step="0.1" value={largura} onChange={(e) => setLargura(e.target.value)} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura Total (cm)</Label>
                  <Input id="altura" type="number" step="0.1" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="18" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="larguraUtil">Largura Útil (cm)</Label>
                  <Input id="larguraUtil" type="number" step="0.1" value={larguraUtil} onChange={(e) => setLarguraUtil(e.target.value)} placeholder="29.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alturaUtil">Altura Útil (cm)</Label>
                  <Input id="alturaUtil" type="number" step="0.1" value={alturaUtil} onChange={(e) => setAlturaUtil(e.target.value)} placeholder="17.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="margemInterna">Margem Interna Não Bordável (cm)</Label>
                  <Input id="margemInterna" type="number" step="0.1" value={margemInterna} onChange={(e) => setMargemInterna(e.target.value)} placeholder="0.25" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orelhaSeguranca">Orelha de Segurança (cm)</Label>
                  <Input id="orelhaSeguranca" type="number" step="0.1" value={orelhaSeguranca} onChange={(e) => setOrelhaSeguranca(e.target.value)} placeholder="2.0" />
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Área Útil:</strong> área real disponível para bordado (descontando margem interna não bordável)</p>
                <p><strong>Orelha de Segurança:</strong> margem externa necessária para esticar o tecido no bastidor (padrão 2cm)</p>
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
