import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { Settings, Save, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Configuracoes() {
  const { configuracoes, setConfiguracoes } = useApp();
  const [config, setConfig] = useState(configuracoes);

  const handleSalvar = () => {
    setConfiguracoes(config);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleRestaurar = () => {
    if (confirm("Deseja realmente restaurar as configurações padrão? Esta ação não pode ser desfeita.")) {
      const configPadrao = {
        nylon_preco_metro: 9.0,
        nylon_largura: 1.4,
        sarja_preco_metro: 29.0,
        sarja_largura: 1.4,
        entretela_preco_total: 80.0,
        entretela_metragem: 50,
        entretela_largura: 0.5,
        termocolante_preco_metro: 9.0,
        termocolante_largura: 0.5,
        desperdicio: 0.15,
        orelha_cm: 2.0,
        gutter_cm: 0.5,
        linha_preco_rolo: 10.5,
        linha_metros_rolo: 4000,
        consumo_por_1000_pontos: 3.0,
        perda_por_troca: 0.15,
        tarifa_energia: 0.9,
        bp1430_velocidade: 650,
        bp1430_potencia: 0.09,
        bp2100_velocidade: 1050,
        bp2100_potencia: 0.12,
        custo_velcro: 2.5,
        custo_imantada: 3.0,
        custo_broche: 2.0,
        margem_padrao: 0.4,
        margem_minima: 0.25,
        arredondamento: 0.5,
        margem_venda_online: 0.1,
        custo_por_1000_pontos: 0.1,
        margem_entre_bordados: 0.5,
        limite_custo_por_1000_pontos: 5.0,
        custo_criacao_matriz: 50.0,
        valor_isencao_matriz: 150.0,
      };
      setConfig(configPadrao);
      setConfiguracoes(configPadrao);
      toast.success("Configurações restauradas para os valores padrão!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRestaurar}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrão
            </Button>
            <Button onClick={handleSalvar}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Materiais */}
          <Card>
            <CardHeader>
              <CardTitle>Materiais</CardTitle>
              <CardDescription>Preços e especificações dos materiais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nylon 600 - Preço por Metro (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.nylon_preco_metro}
                    onChange={(e) => setConfig({ ...config, nylon_preco_metro: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nylon 600 - Largura do Rolo (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.nylon_largura}
                    onChange={(e) => setConfig({ ...config, nylon_largura: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sarja - Preço por Metro (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.sarja_preco_metro}
                    onChange={(e) => setConfig({ ...config, sarja_preco_metro: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sarja - Largura do Rolo (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.sarja_largura}
                    onChange={(e) => setConfig({ ...config, sarja_largura: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entretela - Preço Total (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.entretela_preco_total}
                    onChange={(e) => setConfig({ ...config, entretela_preco_total: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entretela - Metragem Total (m)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.entretela_metragem}
                    onChange={(e) => setConfig({ ...config, entretela_metragem: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Entretela - Largura (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.entretela_largura}
                    onChange={(e) => setConfig({ ...config, entretela_largura: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termocolante - Preço por Metro (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.termocolante_preco_metro}
                    onChange={(e) => setConfig({ ...config, termocolante_preco_metro: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termocolante - Largura (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.termocolante_largura}
                    onChange={(e) => setConfig({ ...config, termocolante_largura: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desperdício (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.desperdicio * 100}
                    onChange={(e) => setConfig({ ...config, desperdicio: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Orelha para Fixação (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.orelha_cm}
                    onChange={(e) => setConfig({ ...config, orelha_cm: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gutter entre Patches (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.gutter_cm}
                    onChange={(e) => setConfig({ ...config, gutter_cm: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linha */}
          <Card>
            <CardHeader>
              <CardTitle>Linha</CardTitle>
              <CardDescription>Configurações de consumo e custo de linha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço do Rolo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.linha_preco_rolo}
                    onChange={(e) => setConfig({ ...config, linha_preco_rolo: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metros por Rolo (m)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.linha_metros_rolo}
                    onChange={(e) => setConfig({ ...config, linha_metros_rolo: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Consumo por 1.000 Pontos (m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.consumo_por_1000_pontos}
                    onChange={(e) => setConfig({ ...config, consumo_por_1000_pontos: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perda por Troca de Cor (m)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.perda_por_troca}
                    onChange={(e) => setConfig({ ...config, perda_por_troca: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energia e Máquinas */}
          <Card>
            <CardHeader>
              <CardTitle>Energia e Máquinas</CardTitle>
              <CardDescription>Configurações de consumo energético</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarifa de Energia (R$/kWh)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.tarifa_energia}
                    onChange={(e) => setConfig({ ...config, tarifa_energia: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2"></div>
                <div className="space-y-2">
                  <Label>BP1430 - Velocidade (pts/min)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.bp1430_velocidade}
                    onChange={(e) => setConfig({ ...config, bp1430_velocidade: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP1430 - Potência (kW)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.bp1430_potencia}
                    onChange={(e) => setConfig({ ...config, bp1430_potencia: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP2100 - Velocidade (pts/min)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.bp2100_velocidade}
                    onChange={(e) => setConfig({ ...config, bp2100_velocidade: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP2100 - Potência (kW)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.bp2100_potencia}
                    onChange={(e) => setConfig({ ...config, bp2100_potencia: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixações */}
          <Card>
            <CardHeader>
              <CardTitle>Fixações</CardTitle>
              <CardDescription>Custos adicionais por tipo de fixação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Velcro Macho (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.custo_velcro}
                    onChange={(e) => setConfig({ ...config, custo_velcro: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manta Imantada (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.custo_imantada}
                    onChange={(e) => setConfig({ ...config, custo_imantada: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Base de Broche (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.custo_broche}
                    onChange={(e) => setConfig({ ...config, custo_broche: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preços e Margens */}
          <Card>
            <CardHeader>
              <CardTitle>Preços e Margens</CardTitle>
              <CardDescription>Configurações de precificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Margem Padrão (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.margem_padrao * 100}
                    onChange={(e) => setConfig({ ...config, margem_padrao: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margem Mínima Alerta (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.margem_minima * 100}
                    onChange={(e) => setConfig({ ...config, margem_minima: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arredondamento (R$)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.arredondamento}
                    onChange={(e) => setConfig({ ...config, arredondamento: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margem Extra Venda Online (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={config.margem_venda_online * 100}
                    onChange={(e) => setConfig({ ...config, margem_venda_online: parseFloat(e.target.value) / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo por 1.000 Pontos (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.custo_por_1000_pontos}
                    onChange={(e) => setConfig({ ...config, custo_por_1000_pontos: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite Máximo Custo por 1.000 Pontos (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.limite_custo_por_1000_pontos}
                    onChange={(e) => setConfig({ ...config, limite_custo_por_1000_pontos: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Teto máximo que pode ser cobrado por 1.000 pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bastidores e Produção */}
          <Card>
            <CardHeader>
              <CardTitle>Bastidores e Produção</CardTitle>
              <CardDescription>Configurações de otimização de bastidores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Margem Entre Bordados no Bastidor (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.margem_entre_bordados}
                    onChange={(e) => setConfig({ ...config, margem_entre_bordados: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Espaço mínimo entre bordados dentro do bastidor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matriz */}
          <Card>
            <CardHeader>
              <CardTitle>Custo de Matriz</CardTitle>
              <CardDescription>Configurações de cobrança de criação de matriz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo de Criação de Matriz (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.custo_criacao_matriz}
                    onChange={(e) => setConfig({ ...config, custo_criacao_matriz: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Valor cobrado pela criação da matriz do bordado</p>
                </div>
                <div className="space-y-2">
                  <Label>Valor Mínimo para Isenção de Matriz (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.valor_isencao_matriz}
                    onChange={(e) => setConfig({ ...config, valor_isencao_matriz: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">Pedidos acima deste valor não pagam custo de matriz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
