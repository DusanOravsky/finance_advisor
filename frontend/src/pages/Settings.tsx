import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, Download, FileText, Database } from 'lucide-react';
import { importExportService } from '../services/importExport.service';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvContent, setCsvContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');

  const importCSVMutation = useMutation({
    mutationFn: importExportService.importCSV,
    onSuccess: data => {
      alert(`Úspešne importovaných ${data.imported}/${data.total} investícií`);
      setCsvContent('');
    },
    onError: (error: any) => {
      alert(`Chyba pri importe: ${error.response?.data?.message || error.message}`);
    },
  });

  const importJSONMutation = useMutation({
    mutationFn: importExportService.importJSON,
    onSuccess: data => {
      alert(
        `Úspešne importované: ${data.investments} investícií, ${data.transactions} transakcií, ${data.goals} cieľov, ${data.insurances} poistiek`
      );
      setJsonContent('');
    },
    onError: (error: any) => {
      alert(`Chyba pri importe: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      if (type === 'csv') {
        setCsvContent(content);
      } else {
        setJsonContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCSVImport = () => {
    if (!csvContent.trim()) {
      alert('Najprv nahrajte CSV súbor');
      return;
    }
    importCSVMutation.mutate(csvContent);
  };

  const handleJSONImport = () => {
    if (!jsonContent.trim()) {
      alert('Najprv nahrajte JSON súbor');
      return;
    }
    try {
      const data = JSON.parse(jsonContent);
      importJSONMutation.mutate(data);
    } catch (error) {
      alert('Neplatný JSON formát');
    }
  };

  const downloadSampleCSV = async () => {
    const blob = await importExportService.getSampleCSV();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-portfolio.csv';
    a.click();
  };

  const downloadSampleJSON = async () => {
    const data = await importExportService.getSampleJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-profile.json';
    a.click();
  };

  const exportCSV = async () => {
    const blob = await importExportService.exportCSV();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportJSON = async () => {
    const data = await importExportService.exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nastavenia</h1>
        <p className="text-gray-600 mt-1">Import a export dát</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'import'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import dát
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'export'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Export dát
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* CSV Import */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import portfólia z CSV
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nahrajte CSV súbor s vašimi investíciami (Symbol, Name, Type, Shares,
                  PurchasePrice, CurrentPrice)
                </p>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={e => handleFileUpload(e, 'csv')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-600
                      hover:file:bg-primary-100"
                  />

                  {csvContent && (
                    <div className="p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-32">
                      {csvContent.slice(0, 200)}...
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleCSVImport}
                      disabled={!csvContent || importCSVMutation.isPending}
                      className="btn btn-primary"
                    >
                      {importCSVMutation.isPending ? 'Importujem...' : 'Importovať CSV'}
                    </button>
                    <button onClick={downloadSampleCSV} className="btn btn-secondary">
                      Stiahnuť vzor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* JSON Import */}
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Database className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import kompletného profilu z JSON
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nahrajte JSON súbor s kompletným profilom (investície, transakcie, ciele,
                  poistky)
                </p>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => handleFileUpload(e, 'json')}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary-50 file:text-primary-600
                      hover:file:bg-primary-100"
                  />

                  {jsonContent && (
                    <div className="p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-32">
                      {jsonContent.slice(0, 200)}...
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleJSONImport}
                      disabled={!jsonContent || importJSONMutation.isPending}
                      className="btn btn-primary"
                    >
                      {importJSONMutation.isPending ? 'Importujem...' : 'Importovať JSON'}
                    </button>
                    <button onClick={downloadSampleJSON} className="btn btn-secondary">
                      Stiahnuť vzor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Download className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Export portfólia do CSV
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportujte vaše investície do CSV súboru pre import do iných nástrojov
                </p>
                <button onClick={exportCSV} className="btn btn-primary">
                  Stiahnuť CSV
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Download className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Export kompletného profilu do JSON
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportujte kompletný profil vrátane všetkých dát (investície, transakcie,
                  ciele, poistky)
                </p>
                <button onClick={exportJSON} className="btn btn-primary">
                  Stiahnuť JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
