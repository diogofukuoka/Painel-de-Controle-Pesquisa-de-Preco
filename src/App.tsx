/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import DataTable, { QualityRow } from './components/DataTable';
import { UploadCloud, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as xlsx from 'xlsx';

export default function App() {
  const [data, setData] = useState<QualityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>("Nenhuma planilha carregada");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processExcelFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

        if (rawData.length === 0) {
          setData([]);
          setIsLoading(false);
          return;
        }

        const formattedData = rawData.slice(1).map((row, idx) => {
          return {
            id: idx,
            codigo: row[0] || "",
            descricao: row[1] || "",
            fabricante: row[2] || "",
            marca: row[3] || "",
            data: row[4] || "",
            local: row[5] || "",
            aprovado: row[6] === undefined ? "" : row[6],
            reprovado: row[7] === undefined ? "" : row[7],
            parecer: row[18] || "", 
          };
        }).filter(r => r.codigo || r.descricao);

        setData(formattedData);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao processar o arquivo. Certifique-se de que é uma planilha válida.");
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError("Erro ao tentar ler o arquivo.");
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    processExcelFile(file);
    setIsUploading(false);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100/50 p-4 md:p-6 lg:p-8 flex flex-col font-sans">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leitor de Qualidade ISO</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualização multi-usuário independente (A-H, S)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".xlsx,.xls,.csv"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              {isUploading ? 'Processando...' : 'Carregar Planilha'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 container mx-auto max-w-[1600px] h-full flex flex-col">
        {error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center justify-center h-64 shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Aguardando Planilha</h3>
            <p className="text-amber-700 text-center max-w-md">
              {error}. Por favor, carregue a planilha utilizando o botão <strong>Carregar Planilha</strong> acima. Cada usuário pode carregar a sua sem interferir nos demais.
            </p>
          </div>
        ) : isLoading && data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-64 bg-white/50 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium">Carregando dados da planilha...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 h-[calc(100vh-140px)]">
            <DataTable data={data} />
          </div>
        )}
      </main>
    </div>
  );
}
