# TODO - Calculadora de Custos de Bordados

## Funcionalidades Principais

- [x] Implementar a lógica de cálculo de custos (materiais, linha, energia, custo técnico por ponto)
- [x] Criar formulário de entrada com todos os campos necessários (forma, tamanho, pontos, cores, fixação, máquina, material base, margem)
- [x] Exibir o resultado detalhado do cálculo (custos separados e preço final)
- [x] Adicionar validação de campos de entrada
- [x] Implementar design responsivo e moderno
- [x] Adicionar suporte para ambos os materiais (Nylon 600 e Sarja)
- [x] Adicionar todas as opções de fixação (Sem, Termocolante, Velcro, Manta Imantada, Base de Broche)
- [x] Adicionar suporte para ambas as máquinas (BP1430 e BP2100)
- [x] Implementar arredondamento de preço para múltiplos de R$ 0,50
- [x] Adicionar campo para ajustar margem de lucro personalizada

## Novas Funcionalidades Solicitadas

- [x] Criar área de configurações para ajustar constantes (preços de materiais, energia, linha, etc.)
- [x] Implementar persistência de dados usando localStorage
- [x] Criar sistema de cadastro de bastidores
- [x] Implementar listagem e edição de bastidores cadastrados
- [x] Adicionar lógica de sugestão automática de bastidor ideal
- [x] Calcular quantidade de peças que cabem por bastidor
- [x] Adicionar campo de quantidade de bordados no formulário
- [x] Implementar tabela de descontos por quantidade
- [x] Adicionar opção "Venda Online" com margem extra de 10%
- [x] Criar navegação entre as diferentes seções (Calculadora, Bastidores, Configurações)
- [x] Exibir bastidor sugerido e quantidade de peças no resultado

## Sistema de Autenticação e Orçamentos

- [x] Adicionar funcionalidades de backend (web-db-user)
- [x] Criar schema do banco de dados para usuários e orçamentos
- [x] Implementar sistema de autenticação (login e registro)
- [x] Criar página de login/registro (OAuth Manus integrado)
- [x] Adicionar proteção de rotas para usuários autenticados
- [x] Criar modelo de dados para orçamentos salvos
- [x] Implementar salvamento automático de orçamentos após cálculo (frontend)
- [x] Criar página de listagem de orçamentos
- [x] Adicionar filtros e busca na listagem de orçamentos
- [x] Implementar busca inteligente de orçamentos similares (backend)
- [x] Adicionar botão para duplicar orçamento existente
- [x] Exibir sugestões de orçamentos similares durante a criação
- [x] Adicionar informações do usuário no orçamento (quem criou, quando)

## Sistema Avançado de Bastidores e Otimização

- [x] Atualizar modelo de bastidores com área útil real (descontando margem interna não bordável)
- [x] Adicionar campo de margem interna não bordável nos bastidores
- [x] Adicionar campo de orelha de segurança (padrão 2cm) para esticar tecido
- [x] Implementar cálculo de quantos bordados cabem com segurança no bastidor
- [x] Adicionar sugestão de rotação de matriz (90°) para otimizar espaço
- [x] Criar configuração de margem entre bordados dentro do bastidor
- [x] Sugerir melhor bastidor baseado em menor perda de material
- [x] Sugerir melhor bastidor baseado em quantidade de peças que cabem

## Dois Modos de Trabalho

- [x] Criar seletor de modo: "Patches" vs "Peça de Cliente"
- [x] Modo Patches: manter lógica atual
- [x] Modo Peça de Cliente: adicionar campo de margem de perda de material/peça
- [x] Ajustar cálculos de custo baseado no modo selecionado

## Sistema de Custo de Matriz

- [x] Adicionar campo "Custo de Criação de Matriz" nas configurações
- [x] Adicionar campo "Valor Mínimo para Isenção de Matriz" nas configurações
- [x] Implementar lógica de isenção automática quando pedido ultrapassa valor mínimo
- [x] Exibir custo de matriz no resultado do cálculo
- [x] Mostrar mensagem quando matriz for isenta

## Limite de Custo por Milhar

- [x] Adicionar campo "Limite Máximo de Custo por Milhar" nas configurações
- [x] Aplicar teto configurável no cálculo de custo técnico por pontos
- [x] Exibir aviso quando o limite for atingido (armazenado no resultado)

## Melhorias de Interface

- [ ] Melhorar responsividade mobile (formulários, tabelas, navegação)
- [ ] Renomear aplicação para "BordaCalc Pro" ou "Trilinha Manager"
- [ ] Otimizar layout para telas pequenas
- [ ] Melhorar usabilidade em dispositivos touch

## Melhorias Mobile (Navegação)

- [x] Implementar menu hamburger para mobile (≤768px)
- [x] Criar navegação responsiva que se adapta ao tamanho da tela
- [x] Adicionar transições suaves e animações
- [x] Aumentar área de toque dos botões para mobile
- [x] Testar em diferentes tamanhos de tela

## Persistência Completa de Dados em Banco

- [x] Criar tabela de configurações no banco
- [x] Criar tabela de máquinas no banco
- [x] Criar tabela de tecidos no banco
- [x] Migrar bastidores do localStorage para o banco (schema criado)
- [x] Migrar descontos do localStorage para o banco (schema criado)
- [x] Criar APIs tRPC para gerenciar configurações
- [x] Criar APIs tRPC para gerenciar máquinas
- [x] Criar APIs tRPC para gerenciar tecidos
- [x] Atualizar interfaces para usar dados do banco

## Cadastro de Máquinas e Tecidos- [x] Criar página de gerenciamento de máquinas (frontend)
- [x] Criar formulário de cadastro/edição de máquina- [x] Criar página de gerenciamento de tecidos (frontend)
- [x] Criar formulário de cadastro/edição de tecidos
- [x] Adicionar validações nos formulários

## Workflow de Orçamento com Etapas

- [x] Adicionar campo "status" na tabela de orçamentos (orçamento, matriz_arte, finalizado)
- [x] Criar tabela para dados de matriz e arte (pontos finais, cores, arquivos)
- [x] Criar tabela para dados de finalização (fotos, numeração de linhas)
- [ ] Implementar upload de arquivos (Wilcom .dst, vetores .ai/.svg)
- [ ] Implementar upload de fotos do resultado final
- [ ] Criar página de edição de orçamento com etapas
- [ ] Adicionar botões de ação na listagem de orçamentos (Editar, Adicionar Matriz, Finalizar)

## Dois Modos de Trabalho

- [x] Adicionar campo "modo_trabalho" no formulário (patches, peca_cliente- [x] Adicionar campo "margem_perda_material" para modo peça de cliente
- [x] Ajustar cálculo de custo baseado no modo selecionado
- [x] Salvar modo de trabalho no orçamento
- [x] Exibir modo de trabalho no resultado e na listagem
