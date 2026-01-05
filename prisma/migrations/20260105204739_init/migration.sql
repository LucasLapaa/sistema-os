-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataServico" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razSocial" TEXT,
    "cnpj" TEXT,
    "endereco" TEXT,
    "cep" TEXT,
    "bairro" TEXT,
    "municipio" TEXT,
    "tel" TEXT,
    "localExecucaoServico" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "numSerie" TEXT,
    "inmetro" TEXT,
    "capacidadeKg" TEXT,
    "divisao" TEXT,
    "portaria" TEXT,
    "ano" INTEGER,
    "numSeloReparado" TEXT,
    "numLacreRetirado" TEXT,
    "numLacreColocado" TEXT,
    "descricaoMaoDeObra" TEXT,
    "valorMDO" REAL DEFAULT 0,
    "valorVista" REAL DEFAULT 0,
    "valorPecas" REAL DEFAULT 0,
    "valorTotal" REAL DEFAULT 0,
    "nomeCliente" TEXT,
    "tecnicoResponsavel" TEXT,
    "rgCpfTecnico" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
