import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';

export type QualityRow = {
  id: number;
  codigo: string;
  descricao: string;
  fabricante: string;
  marca: string;
  data: string;
  local: string;
  aprovado: string | boolean;
  reprovado: string | boolean;
  parecer: string;
};

interface DataTableProps {
  data: QualityRow[];
}

type SortConfig = {
  key: keyof QualityRow;
  direction: 'asc' | 'desc';
} | null;

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (key: keyof QualityRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let processableData = [...data];

    // Filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      processableData = processableData.filter((row) => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    // Sort
    if (sortConfig !== null) {
      processableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processableData;
  }, [data, searchTerm, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: keyof QualityRow }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown className="w-4 h-4 text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600 ml-1" />
      : <ChevronDown className="w-4 h-4 text-blue-600 ml-1" />;
  };

  const TheadTh = ({ label, columnKey }: { label: string, columnKey: keyof QualityRow }) => (
    <th 
      onClick={() => handleSort(columnKey)}
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none group"
    >
      <div className="flex items-center">
        {label}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <SortIcon columnKey={columnKey} />
        </span>
      </div>
    </th>
  );

  const formatBoolean = (val: any) => {
    if (val === true || String(val).toUpperCase() === 'VERDADEIRO' || String(val).toUpperCase() === 'V') return 'Verdadeiro';
    if (val === false || String(val).toUpperCase() === 'FALSO' || String(val).toUpperCase() === 'F') return 'Falso';
    return val;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-700">
          <FileSpreadsheet className="w-5 h-5" />
          <h2 className="font-semibold text-gray-800">Visualização de Dados ({data.length} registros)</h2>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64 md:w-80 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
            <tr>
              <TheadTh label="Código" columnKey="codigo" />
              <TheadTh label="Descrição" columnKey="descricao" />
              <TheadTh label="Fabricante" columnKey="fabricante" />
              <TheadTh label="Marca" columnKey="marca" />
              <TheadTh label="Data" columnKey="data" />
              <TheadTh label="Local" columnKey="local" />
              <TheadTh label="Aprovado" columnKey="aprovado" />
              <TheadTh label="Reprovado" columnKey="reprovado" />
              <TheadTh label="Parecer" columnKey="parecer" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{row.codigo}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 break-words whitespace-normal max-w-[200px]">{row.descricao}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]" title={row.fabricante}>{row.fabricante}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.marca}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{typeof row.data === 'number' ? new Date(Math.round((row.data - 25569)*86400*1000)).toLocaleDateString() : row.data}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.local}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                      String(row.aprovado).toUpperCase() === 'VERDADEIRO' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                    {formatBoolean(row.aprovado)}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                      String(row.reprovado).toUpperCase() === 'VERDADEIRO' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                    {formatBoolean(row.reprovado)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-normal break-words max-w-[300px]">{row.parecer}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  Nenhum registro encontrado correspondente à busca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
