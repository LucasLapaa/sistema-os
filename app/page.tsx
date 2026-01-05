// app/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Printer, Save, FilePlus, List } from "lucide-react";
import { salvarOS, buscarOS, pegarUltimoNumero } from "./actions"; // Importa as funções do banco

function ConteudoOS() {
  const { register, handleSubmit, watch, reset, setValue } = useForm();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [numeroOS, setNumeroOS] = useState<number>(10311); 
  const [modoEdicao, setModoEdicao] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  const vMDO = Number(watch("valorMDO") || 0);
  const vVista = Number(watch("valorVista") || 0);
  const vPecas = Number(watch("valorPecas") || 0);
  const total = vMDO + vVista + vPecas;

  // --- CARREGAR AO INICIAR ---
  useEffect(() => {
    const iniciar = async () => {
      const editId = searchParams.get("edit");
      
      if (editId) {
        // MODO EDIÇÃO
        setCarregando(true);
        const osEncontrada = await buscarOS(editId);
        if (osEncontrada) {
          preencherFormulario(osEncontrada);
        }
        setCarregando(false);
      } else {
        // MODO NOVA OS: Busca qual o último número no banco
        const ultimo = await pegarUltimoNumero();
        setNumeroOS(ultimo + 1);
        
        const hoje = new Date().toISOString().split('T')[0];
        setValue("dataServico", hoje);
      }
    };
    iniciar();
  }, [searchParams, setValue]);

  const preencherFormulario = (os: any) => {
    // Converte a data do banco para o input type="date"
    const dataFormatada = os.dataServico ? new Date(os.dataServico).toISOString().split('T')[0] : "";
    reset({ ...os, dataServico: dataFormatada });
    setNumeroOS(os.id);
    setModoEdicao(true);
  };

  // --- SALVAR NO BANCO ---
  const onSubmit = async (data: any) => {
    setCarregando(true);
    const dadosParaSalvar = { 
        ...data, 
        id: numeroOS, 
        valorTotal: total,
        // Garante que números sejam números
        ano: data.ano ? Number(data.ano) : null,
    };

    const resultado = await salvarOS(dadosParaSalvar);

    setCarregando(false);

    if (resultado.success) {
        if (resultado.action === "atualizado") {
            alert(`✅ OS Nº ${numeroOS} atualizada no banco!`);
        } else {
            alert(`✅ OS Nº ${numeroOS} criada com sucesso!`);
            // Prepara a próxima
            const proximo = numeroOS + 1;
            setNumeroOS(proximo);
            reset();
            setValue("dataServico", new Date().toISOString().split('T')[0]);
            setModoEdicao(false);
        }
    } else {
        alert("❌ Erro ao salvar. Tente novamente.");
    }
  };

  // --- BUSCAR DO BANCO ---
  const handleBuscar = async (e?: any) => {
    if(e) e.preventDefault();
    if(!termoBusca) return;

    setCarregando(true);
    const resultado = await buscarOS(termoBusca);
    setCarregando(false);

    if (resultado) {
      preencherFormulario(resultado);
      alert(`🔍 OS Nº ${resultado.id} carregada.`);
    } else {
      alert("❌ OS não encontrada no banco de dados.");
    }
  };

  const abrirNovaAba = () => {
     window.open(window.location.href.split('?')[0], '_blank');
  };

  const imprimir = () => window.print();

  const inputBase = "w-full bg-transparent outline-none px-1 text-sm font-medium text-gray-900";
  const borderB = "border-b border-gray-400 focus:border-blue-600"; 

  return (
    <div className="min-h-screen bg-gray-200 font-sans text-gray-900">
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* MENU */}
      <div className="bg-gray-900 p-4 no-print shadow-md sticky top-0 z-50 border-b-4 border-blue-600">
        <div className="max-w-[210mm] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex gap-4 items-center w-full md:w-auto">
            <Link href="/lista-os" target="_blank" className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 font-bold shadow-lg">
               <List size={20} /> Histórico
            </Link>

            <form onSubmit={handleBuscar} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg ml-4 border border-gray-700">
              <span className="text-white font-bold text-sm hidden lg:inline">Buscar:</span>
              <input 
                type="text" 
                placeholder="Nº ou CNPJ" 
                className="px-3 py-1 rounded bg-white text-black font-bold w-32 outline-none"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              <button type="submit" disabled={carregando} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">
                <Search size={20} />
              </button>
            </form>
          </div>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button onClick={abrirNovaAba} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 font-bold shadow-lg">
              <FilePlus size={20} /> Nova Guia
            </button>
            <button onClick={imprimir} className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded flex items-center gap-2 font-bold shadow-lg">
              <Printer size={20} /> Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="flex justify-center p-8 print:p-0 print:block">
        <form onSubmit={handleSubmit(onSubmit)} className="w-[210mm] min-h-[297mm] bg-white p-[10mm] shadow-2xl print:shadow-none print:w-full print:h-full relative mx-auto">
          {carregando && <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center font-bold text-xl">Carregando...</div>}
          
          {/* ... CABEÇALHO (Igual) ... */}
           <div className="flex flex-row justify-between items-start border-b-2 border-black pb-2 mb-2 gap-4">
            <div className="w-1/3">
               <div className="border-4 border-black p-2 inline-block">
                  <span className="text-4xl font-black italic tracking-tighter">Guaru</span>
                  <span className="text-4xl font-normal tracking-tighter">Balanças</span>
               </div>
               <p className="text-[11px] font-bold mt-1">CNPJ 55.503.593/0001-09</p>
            </div>
            <div className="w-2/3 text-right text-[11px] leading-tight space-y-0.5">
               <p className="font-bold text-sm">José Agnaldo Lapa - ME Lacre n.º 10000134</p>
               <p>Tel.: (13) 3387-5991</p>
               <p>INSCR. EST. 335.019.874.119</p>
               <p>E-Mail: guarubalancas@hotmail.com</p>
               <p className="font-bold pt-1">Rua João Anselmo da Rocha, 170 - Jd. Boa Esperança - CEP 11470-190 - Guarujá/SP</p>
            </div>
          </div>

          <div className="flex items-end justify-between mb-4">
              <div className="flex items-end gap-2">
                  <label className="font-bold text-sm">Data</label>
                  <input type="date" {...register("dataServico")} className={`w-32 text-center text-sm ${borderB}`} />
              </div>
              <h1 className="text-4xl font-black uppercase text-center flex-1 mx-4">Ordem de Serviço</h1>
              <div className="flex items-center gap-1">
                  <span className="font-bold text-xl">N.º</span>
                  <span className="text-3xl font-bold text-red-600 bg-yellow-50 px-2 print:bg-transparent">{numeroOS}</span>
              </div>
          </div>

          {/* ... RESTO DOS CAMPOS (Exatamente o mesmo código visual de antes) ... */}
           <p className="text-[10px] text-center mb-3 border-b border-black pb-1">Esta Ordem de Serviço deve permanecer no local em que o instrumento está instalado por pelo menos 2(dois) anos.</p>

          <div className="bg-blue-50 p-2 border border-black mb-3 grid grid-cols-12 gap-x-2 gap-y-1 print:bg-transparent">
              <div className="col-span-8">
                  <label className="text-[10px] font-bold block">Razão Social:</label>
                  <input {...register("razSocial")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-4">
                  <label className="text-[10px] font-bold block">CNPJ:</label>
                  <input {...register("cnpj")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-9">
                  <label className="text-[10px] font-bold block">Endereço:</label>
                  <input {...register("endereco")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-3">
                  <label className="text-[10px] font-bold block">CEP:</label>
                  <input {...register("cep")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-5">
                  <label className="text-[10px] font-bold block">Bairro:</label>
                  <input {...register("bairro")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-4">
                  <label className="text-[10px] font-bold block">Município:</label>
                  <input {...register("municipio")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-3">
                  <label className="text-[10px] font-bold block">Tel.:</label>
                  <input {...register("tel")} className={`${inputBase} ${borderB}`} />
              </div>
              <div className="col-span-12">
                  <label className="text-[10px] font-bold block">Local Execução do Serviço:</label>
                  <input {...register("localExecucaoServico")} className={`${inputBase} ${borderB}`} />
              </div>
          </div>

          <div className="border border-black mb-3">
              <div className="bg-gray-300 text-center font-bold text-xs py-0.5 border-b border-black print:bg-gray-200">DADOS DA BALANÇA</div>
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black bg-gray-100 print:bg-transparent">
                  <div className="text-[9px] font-bold text-center p-0.5">MARCA</div>
                  <div className="text-[9px] font-bold text-center p-0.5">MODELO</div>
                  <div className="text-[9px] font-bold text-center p-0.5">Nº SÉRIE</div>
                  <div className="text-[9px] font-bold text-center p-0.5">INMETRO</div>
              </div>
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                  <input {...register("marca")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  <input {...register("modelo")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  <input {...register("numSerie")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  <input {...register("inmetro")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
              </div>
              <div className="grid grid-cols-4 divide-x divide-black border-b border-black">
                  <div className="col-span-2 grid grid-cols-2 divide-x divide-black">
                      <input placeholder="Portaria" {...register("portaria")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                      <input placeholder="Ano" type="number" {...register("ano")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  </div>
                  <div className="col-span-2 grid grid-cols-2 divide-x divide-black">
                       <div className="flex items-center px-1"><input {...register("capacidadeKg")} className="text-right text-sm w-full bg-transparent outline-none"/><span className="text-[10px]">Kg</span></div>
                       <div className="flex items-center px-1"><input {...register("divisao")} className="text-right text-sm w-full bg-transparent outline-none"/><span className="text-[10px]">div</span></div>
                  </div>
              </div>
               <div className="grid grid-cols-3 divide-x divide-black">
                  <input placeholder="Selo Reparado" {...register("numSeloReparado")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  <input placeholder="Lacre Retirado" {...register("numLacreRetirado")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
                  <input placeholder="Lacre Colocado" {...register("numLacreColocado")} className="text-center text-sm p-1 w-full bg-transparent outline-none" />
              </div>
          </div>

          <div className="border border-black mb-3 flex-1 flex flex-col">
              <div className="bg-gray-300 text-center font-bold text-xs py-0.5 border-b border-black print:bg-gray-200">DESCRIÇÃO DE MÃO-DE-OBRA</div>
              <textarea {...register("descricaoMaoDeObra")} className="w-full h-40 bg-transparent outline-none p-2 resize-none text-sm leading-6"></textarea>
          </div>

          <div className="grid grid-cols-4 border border-black mb-6 text-sm font-bold">
              <div className="border-r border-black p-1 flex justify-between items-center">
                  <span className="text-xs">M.D.O R$</span>
                  <input type="number" step="0.01" {...register("valorMDO")} className="w-16 text-right bg-transparent border-b border-gray-300 px-1" />
              </div>
               <div className="border-r border-black p-1 flex justify-between items-center">
                  <span className="text-xs">VISTA R$</span>
                  <input type="number" step="0.01" {...register("valorVista")} className="w-16 text-right bg-transparent border-b border-gray-300 px-1" />
              </div>
              <div className="border-r border-black p-1 flex justify-between items-center">
                  <span className="text-xs">PEÇAS R$</span>
                  <input type="number" step="0.01" {...register("valorPecas")} className="w-16 text-right bg-transparent border-b border-gray-300 px-1" />
              </div>
              <div className="p-1 bg-gray-300 flex justify-between items-center print:bg-gray-200">
                  <span className="text-xs">TOTAL R$</span>
                  <span className="text-lg">{total.toFixed(2)}</span>
              </div>
          </div>

          <div className="flex flex-row justify-between gap-8 items-end mt-auto">
             <div className="w-1/2 text-center">
                <div className="border-b border-black mb-1"></div>
                <input {...register("nomeCliente")} placeholder="Assinatura do Cliente" className="text-center text-sm w-full bg-transparent outline-none font-bold" />
             </div>
             <div className="w-1/2 space-y-2 text-sm">
                <div className="flex border-b border-black">
                    <span className="font-bold w-16">Técnico:</span>
                    <input {...register("tecnicoResponsavel")} className="flex-1 bg-transparent outline-none" />
                </div>
                 <div className="flex border-b border-black">
                    <span className="font-bold w-16">RG/CPF:</span>
                    <input {...register("rgCpfTecnico")} className="flex-1 bg-transparent outline-none" />
                </div>
             </div>
          </div>


          <div className="absolute bottom-4 left-0 w-full text-center no-print translate-y-[120%]">
            <button type="submit" disabled={carregando} className={`text-white font-bold py-3 px-8 rounded shadow-lg transition-all ${modoEdicao ? 'bg-orange-600' : 'bg-blue-700 hover:bg-blue-600'}`}>
                <span className="flex items-center justify-center gap-2">
                   <Save /> {carregando ? "Salvando..." : (modoEdicao ? "ATUALIZAR DADOS" : "SALVAR OS")}
                </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConteudoOS />
    </Suspense>
  );
}