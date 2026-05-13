/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import DataTable, { QualityRow } from './components/DataTable';
import { UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<QualityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao buscar dados da planilha');
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload do arquivo');
      }

      // Refresh data after successful upload
      await fetchData();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
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
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
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
              {isUploading ? 'Enviando...' : 'Substituir Planilha'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 container mx-auto max-w-[1600px] h-full flex flex-col">
        {error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center justify-center h-64 shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Arquivo não encontrado</h3>
            <p className="text-amber-700 text-center max-w-md">
              {error}. Por favor, envie a planilha inicial utilizando o botão <strong>Substituir Planilha</strong> acima.
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
