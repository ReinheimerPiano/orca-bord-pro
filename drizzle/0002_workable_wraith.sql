CREATE TABLE `bastidores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`largura` int NOT NULL,
	`altura` int NOT NULL,
	`largura_util` int NOT NULL,
	`altura_util` int NOT NULL,
	`margem_interna` int NOT NULL DEFAULT 25,
	`orelha_seguranca` int NOT NULL DEFAULT 200,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bastidores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nylon_preco_metro` int NOT NULL DEFAULT 900,
	`nylon_largura` int NOT NULL DEFAULT 140,
	`sarja_preco_metro` int NOT NULL DEFAULT 2900,
	`sarja_largura` int NOT NULL DEFAULT 140,
	`entretela_preco_total` int NOT NULL DEFAULT 8000,
	`entretela_metragem` int NOT NULL DEFAULT 5000,
	`entretela_largura` int NOT NULL DEFAULT 50,
	`termocolante_preco_metro` int NOT NULL DEFAULT 900,
	`termocolante_largura` int NOT NULL DEFAULT 50,
	`desperdicio` int NOT NULL DEFAULT 15,
	`orelha_cm` int NOT NULL DEFAULT 200,
	`gutter_cm` int NOT NULL DEFAULT 50,
	`margem_entre_bordados` int NOT NULL DEFAULT 50,
	`linha_preco_rolo` int NOT NULL DEFAULT 1050,
	`linha_metros_rolo` int NOT NULL DEFAULT 4000,
	`consumo_por_1000_pontos` int NOT NULL DEFAULT 300,
	`perda_por_troca` int NOT NULL DEFAULT 15,
	`tarifa_energia` int NOT NULL DEFAULT 90,
	`custo_velcro` int NOT NULL DEFAULT 250,
	`custo_imantada` int NOT NULL DEFAULT 300,
	`custo_broche` int NOT NULL DEFAULT 200,
	`margem_padrao` int NOT NULL DEFAULT 40,
	`margem_minima` int NOT NULL DEFAULT 25,
	`arredondamento` int NOT NULL DEFAULT 50,
	`margem_venda_online` int NOT NULL DEFAULT 10,
	`custo_por_1000_pontos` int NOT NULL DEFAULT 10,
	`limite_custo_por_1000_pontos` int NOT NULL DEFAULT 500,
	`custo_criacao_matriz` int NOT NULL DEFAULT 5000,
	`valor_isencao_matriz` int NOT NULL DEFAULT 15000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `descontos_quantidade` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quantidade_minima` int NOT NULL,
	`desconto_percentual` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `descontos_quantidade_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_status_orcamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orcamento_id` int NOT NULL,
	`status_anterior` varchar(20),
	`status_novo` varchar(20) NOT NULL,
	`observacao` text,
	`user_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_status_orcamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maquinas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`velocidade` int NOT NULL,
	`potencia` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maquinas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materiais_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`preco_metro` int NOT NULL,
	`largura` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materiais_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_fixacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`custo_adicional` int NOT NULL DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tipos_fixacao_id` PRIMARY KEY(`id`),
	CONSTRAINT `tipos_fixacao_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `status` varchar(20) DEFAULT 'orcamento' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `modoTrabalho` varchar(20) DEFAULT 'vendedor' NOT NULL;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `pontos_finais` int;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cores_finais` int;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `arquivo_wilcom` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `arquivo_vetor` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `observacoes_matriz` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `data_matriz_concluida` timestamp;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `fotos_resultado` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `numeracao_linhas` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `observacoes_finalizacao` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `data_finalizacao` timestamp;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cliente_nome` varchar(255);--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cliente_email` varchar(255);--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cliente_telefone` varchar(50);--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cliente_observacoes` text;