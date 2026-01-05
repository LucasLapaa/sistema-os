// app/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";

// Evita criar múltiplas conexões no ambiente de desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// --- 1. SALVAR OU ATUALIZAR OS ---
export async function salvarOS(data: any) {
  try {
    const idNumerico = Number(data.id);

    // Verifica se já existe
    const existe = await prisma.ordemServico.findUnique({
      where: { id: idNumerico },
    });

    if (existe) {
      // ATUALIZAR
      await prisma.ordemServico.update({
        where: { id: idNumerico },
        data: {
          ...data,
          id: idNumerico, // Garante que o ID é número
          ano: data.ano ? Number(data.ano) : null,
          dataServico: new Date(data.dataServico),
        },
      });
      return { success: true, action: "atualizado" };
    } else {
      // CRIAR NOVA
      await prisma.ordemServico.create({
        data: {
          ...data,
          id: idNumerico,
          ano: data.ano ? Number(data.ano) : null,
          dataServico: new Date(data.dataServico),
        },
      });
      return { success: true, action: "criado" };
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
    return { success: false, error: "Erro no banco de dados" };
  }
}

// --- 2. BUSCAR UMA OS (Pelo ID ou CNPJ) ---
export async function buscarOS(termo: string) {
  try {
    // Tenta achar pelo ID
    const porID = !isNaN(Number(termo)) 
      ? await prisma.ordemServico.findUnique({ where: { id: Number(termo) } })
      : null;

    if (porID) return porID;

    // Se não achou por ID, tenta pelo CNPJ (pega o primeiro que achar)
    const porCNPJ = await prisma.ordemServico.findFirst({
      where: { cnpj: termo },
      orderBy: { id: 'desc' } // Pega a mais recente desse CNPJ
    });

    return porCNPJ || null;
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return null;
  }
}

// --- 3. LISTAR TODAS (Para o Histórico) ---
export async function listarTodasOS() {
  try {
    const lista = await prisma.ordemServico.findMany({
      orderBy: { id: 'desc' }
    });
    return lista;
  } catch (error) {
    return [];
  }
}

// --- 4. DELETAR OS ---
export async function deletarOS(id: number) {
  try {
    await prisma.ordemServico.delete({
      where: { id: id }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- 5. PEGAR O ÚLTIMO NÚMERO USADO ---
export async function pegarUltimoNumero() {
    try {
        const ultima = await prisma.ordemServico.findFirst({
            orderBy: { id: 'desc' }
        });
        return ultima ? ultima.id : 10310; // Se não tiver nada, começa antes do 10311
    } catch (error) {
        return 10310;
    }
}