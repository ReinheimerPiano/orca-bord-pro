import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Tipos
export interface Bastidor {
  id: string;
  nome: string;
  largura: number; // cm
  altura: number; // cm
}

export interface Configuracoes {
  // Materiais
  nylon_preco_metro: number;
  nylon_largura: number;
  sarja_preco_metro: number;
  sarja_largura: number;
  entretela_preco_total: number;
  entretela_metragem: number;
  entretela_largura: number;
  termocolante_preco_metro: number;
  termocolante_largura: number;
  desperdicio: number;
  orelha_cm: number;
  gutter_cm: number;

  // Linha
  linha_preco_rolo: number;
  linha_metros_rolo: number;
  consumo_por_1000_pontos: number;
  perda_por_troca: number;

  // Energia
  tarifa_energia: number;
  bp1430_velocidade: number;
  bp1430_potencia: number;
  bp2100_velocidade: number;
  bp2100_potencia: number;

  // Fixações
  custo_velcro: number;
  custo_imantada: number;
  custo_broche: number;

  // Preços
  margem_padrao: number;
  margem_minima: number;
  arredondamento: number;
  margem_venda_online: number;
  custo_por_1000_pontos: number;
}

export interface DescontoQuantidade {
  quantidade_minima: number;
  desconto_percentual: number;
}

interface AppContextType {
  configuracoes: Configuracoes;
  setConfiguracoes: (config: Configuracoes) => void;
  bastidores: Bastidor[];
  adicionarBastidor: (bastidor: Omit<Bastidor, "id">) => void;
  editarBastidor: (id: string, bastidor: Omit<Bastidor, "id">) => void;
  removerBastidor: (id: string) => void;
  descontosQuantidade: DescontoQuantidade[];
  setDescontosQuantidade: (descontos: DescontoQuantidade[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Configurações padrão
const configuracoesIniciaisDefault: Configuracoes = {
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
};

// Bastidores padrão da planilha
const bastidoresIniciaisDefault: Bastidor[] = [
  { id: "1", nome: "Brother Small 20x60", largura: 6, altura: 2 },
  { id: "2", nome: "Brother Small 30x50", largura: 5, altura: 3 },
  { id: "3", nome: "Brother Small 40x30", largura: 4, altura: 3 },
  { id: "4", nome: "Brother Regular 10x10", largura: 10, altura: 10 },
  { id: "5", nome: "Brother Medium 13x18", largura: 18, altura: 13 },
  { id: "6", nome: "Brother Extra Large 16x26", largura: 26, altura: 16 },
  { id: "7", nome: "Brother Large 18x30", largura: 30, altura: 18 },
];

// Descontos padrão por quantidade
const descontosIniciaisDefault: DescontoQuantidade[] = [
  { quantidade_minima: 10, desconto_percentual: 5 },
  { quantidade_minima: 50, desconto_percentual: 10 },
  { quantidade_minima: 100, desconto_percentual: 15 },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoesState] = useState<Configuracoes>(() => {
    const saved = localStorage.getItem("configuracoes");
    return saved ? JSON.parse(saved) : configuracoesIniciaisDefault;
  });

  const [bastidores, setBastidores] = useState<Bastidor[]>(() => {
    const saved = localStorage.getItem("bastidores");
    return saved ? JSON.parse(saved) : bastidoresIniciaisDefault;
  });

  const [descontosQuantidade, setDescontosQuantidadeState] = useState<DescontoQuantidade[]>(() => {
    const saved = localStorage.getItem("descontosQuantidade");
    return saved ? JSON.parse(saved) : descontosIniciaisDefault;
  });

  // Persistir configurações
  useEffect(() => {
    localStorage.setItem("configuracoes", JSON.stringify(configuracoes));
  }, [configuracoes]);

  // Persistir bastidores
  useEffect(() => {
    localStorage.setItem("bastidores", JSON.stringify(bastidores));
  }, [bastidores]);

  // Persistir descontos
  useEffect(() => {
    localStorage.setItem("descontosQuantidade", JSON.stringify(descontosQuantidade));
  }, [descontosQuantidade]);

  const setConfiguracoes = (config: Configuracoes) => {
    setConfiguracoesState(config);
  };

  const adicionarBastidor = (bastidor: Omit<Bastidor, "id">) => {
    const novoId = Date.now().toString();
    setBastidores([...bastidores, { ...bastidor, id: novoId }]);
  };

  const editarBastidor = (id: string, bastidor: Omit<Bastidor, "id">) => {
    setBastidores(bastidores.map((b) => (b.id === id ? { ...bastidor, id } : b)));
  };

  const removerBastidor = (id: string) => {
    setBastidores(bastidores.filter((b) => b.id !== id));
  };

  const setDescontosQuantidade = (descontos: DescontoQuantidade[]) => {
    setDescontosQuantidadeState(descontos);
  };

  return (
    <AppContext.Provider
      value={{
        configuracoes,
        setConfiguracoes,
        bastidores,
        adicionarBastidor,
        editarBastidor,
        removerBastidor,
        descontosQuantidade,
        setDescontosQuantidade,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp deve ser usado dentro de um AppProvider");
  }
  return context;
}
