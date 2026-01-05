// app/lista-os/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { listarTodasOS, deletarOS } from "../actions"; // Importa do banco

export default function ListaOS() {
  const [lista, setLista] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    const dados = await listarTodasOS();
    setLista(dados);
    setCarregando(false);
  };

  const handleDeletar = async (id: number) => {
    if (confirm(`Tem certeza que deseja excluir a OS Nº ${id}?`)) {
      await deletarOS(id);
      carregarDados(); // Recarrega a lista
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             <Link href="/" className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition" title="Voltar">
               <ArrowLeft size={24} />
             </Link>
             <h1 className="text-3xl font-black text-gray-800">Histórico de OS</h1>
          </div>
          <div className="bg-white px-4 py-2 rounded shadow text-sm font-bold">
            {carregando ? "Carregando..." : `Total: ${lista.length}`}
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-300">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 font-bold border-r border-gray-700">Nº OS</th>
                <th className="p-4 font-bold border-r border-gray-700">Data</th>
                <th className="p-4 font-bold border-r border-gray-700">Cliente</th>
                <th className="p-4 font-bold border-r border-gray-700">CNPJ</th>
                <th className="p-4 font-bold border-r border-gray-700 text-right">Total</th>
                <th className="p-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && !carregando && (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-bold">Nenhuma OS encontrada.</td></tr>
              )}
              {lista.map((os) => (
                <tr key={os.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-black text-red-600 border-r text-lg">#{os.id}</td>
                  <td className="p-4 border-r text-sm text-gray-600">
                    {os.dataServico ? new Date(os.dataServico).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="p-4 border-r font-bold text-gray-800">{os.razSocial || os.nomeCliente}</td>
                  <td className="p-4 border-r text-sm text-gray-600 font-mono">{os.cnpj}</td>
                  <td className="p-4 border-r text-right font-bold text-green-700">R$ {os.valorTotal?.toFixed(2)}</td>
                  <td className="p-4 flex justify-center gap-3">
                    <Link href={`/?edit=${os.id}`} target="_blank" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm shadow">
                      <ExternalLink size={16} /> Abrir
                    </Link>
                    <button onClick={() => handleDeletar(os.id)} className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-600 hover:text-white transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}