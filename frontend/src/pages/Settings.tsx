import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Bell, Upload, Download, FileText, Database, Save } from 'lucide-react';
import { authService } from '../services/auth.service';
import { importExportService } from '../services/importExport.service';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'import-export'>('profile');

  // Profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currency: 'EUR',
    riskTolerance: 'moderate',
    timeHorizon: '10-15 years',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsGoal: 0,
  });

  const [notificationForm, setNotificationForm] = useState({
    notifyInsuranceRenewal: true,
    notifyInvestmentAlerts: true,
    notifyBudgetAlerts: false,
    notifyMonthlyReports: true,
    notifyCryptoAlerts: true,
  });

  // Import/Export state
  const [csvContent, setCsvContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');

  // Load profile data into form
  useState(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        currency: profile.currency || 'EUR',
        riskTolerance: profile.riskTolerance || 'moderate',
        timeHorizon: profile.timeHorizon || '10-15 years',
        monthlyIncome: profile.monthlyIncome || 0,
        monthlyExpenses: profile.monthlyExpenses || 0,
        savingsGoal: profile.savingsGoal || 0,
      });

      if (profile.settings) {
        setNotificationForm({
          notifyInsuranceRenewal: profile.settings.notifyInsuranceRenewal ?? true,
          notifyInvestmentAlerts: profile.settings.notifyInvestmentAlerts ?? true,
          notifyBudgetAlerts: profile.settings.notifyBudgetAlerts ?? false,
          notifyMonthlyReports: profile.settings.notifyMonthlyReports ?? true,
          notifyCryptoAlerts: profile.settings.notifyCryptoAlerts ?? true,
        });
      }
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil bol aktualizovaný');
    },
    onError: () => {
      toast.error('Chyba pri aktualizácii profilu');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: authService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Nastavenia boli aktualizované');
    },
    onError: () => {
      toast.error('Chyba pri aktualizácii nastavení');
    },
  });

  const importCSVMutation = useMutation({
    mutationFn: importExportService.importCSV,
    onSuccess: (data) => {
      toast.success(`Úspešne importovaných ${data.imported}/${data.total} investícií`);
      setCsvContent('');
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
    onError: (error: any) => {
      toast.error(`Chyba pri importe: ${error.response?.data?.message || error.message}`);
    },
  });

  const importJSONMutation = useMutation({
    mutationFn: importExportService.importJSON,
    onSuccess: (data) => {
      toast.success(
        `Importované: ${data.investments} investícií, ${data.transactions} transakcií, ${data.goals} cieľov, ${data.insurances} poistiek`
      );
      setJsonContent('');
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast.error(`Chyba pri importe: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(notificationForm);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
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
      toast.error('Najprv nahrajte CSV súbor');
      return;
    }
    importCSVMutation.mutate(csvContent);
  };

  const handleJSONImport = () => {
    if (!jsonContent.trim()) {
      toast.error('Najprv nahrajte JSON súbor');
      return;
    }
    try {
      const data = JSON.parse(jsonContent);
      importJSONMutation.mutate(data);
    } catch (error) {
      toast.error('Neplatný JSON formát');
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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Načítavam nastavenia...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nastavenia</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Spravujte svoj profil a predvoľby</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <User size={20} />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bell size={20} />
            Notifikácie
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`pb-4 px-1 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'import-export'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Database size={20} />
            Import/Export
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Osobné údaje</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meno
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Na tento email budete dostávať pripomienky a notifikácie
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mena
                </label>
                <select
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Riziková tolerancia
                </label>
                <select
                  value={profileForm.riskTolerance}
                  onChange={(e) => setProfileForm({ ...profileForm, riskTolerance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Nízka</option>
                  <option value="moderate">Stredná</option>
                  <option value="high">Vysoká</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Časový horizont
                </label>
                <input
                  type="text"
                  value={profileForm.timeHorizon}
                  onChange={(e) => setProfileForm({ ...profileForm, timeHorizon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mesačný príjem (€)
                </label>
                <input
                  type="number"
                  value={profileForm.monthlyIncome}
                  onChange={(e) => setProfileForm({ ...profileForm, monthlyIncome: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mesačné výdavky (€)
                </label>
                <input
                  type="number"
                  value={profileForm.monthlyExpenses}
                  onChange={(e) => setProfileForm({ ...profileForm, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cieľ úspor (€)
                </label>
                <input
                  type="number"
                  value={profileForm.savingsGoal}
                  onChange={(e) => setProfileForm({ ...profileForm, savingsGoal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={20} />
                {updateProfileMutation.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Email notifikácie</h2>
          <form onSubmit={handleNotificationsSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Obnovenie poistiek</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pripomienky pred vypršaním poistky
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationForm.notifyInsuranceRenewal}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, notifyInsuranceRenewal: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Investičné upozornenia</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Výrazné zmeny v hodnote portfólia
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationForm.notifyInvestmentAlerts}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, notifyInvestmentAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Rozpočtové upozornenia</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Prekročenie mesačných limitov
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationForm.notifyBudgetAlerts}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, notifyBudgetAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Mesačné reporty</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Súhrn portfólia na konci mesiaca
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationForm.notifyMonthlyReports}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, notifyMonthlyReports: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Crypto upozornenia</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Výrazné pohyby kryptomien
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationForm.notifyCryptoAlerts}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, notifyCryptoAlerts: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save size={20} />
                {updateSettingsMutation.isPending ? 'Ukladám...' : 'Uložiť zmeny'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import/Export Tab */}
      {activeTab === 'import-export' && (
        <div className="space-y-6">
          {/* Import sekcia */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Upload size={24} className="text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import dát</h2>
            </div>

            <div className="space-y-6">
              {/* CSV Import */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CSV Import (Investície)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Importujte svoje investície z CSV súboru
                </p>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'csv')}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-300
                      hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30"
                  />

                  {csvContent && (
                    <div>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                        {csvContent.split('\n').slice(0, 10).join('\n')}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={handleCSVImport} className="btn btn-primary flex items-center gap-2">
                      <Upload size={20} />
                      Importovať CSV
                    </button>
                    <button onClick={downloadSampleCSV} className="btn btn-secondary flex items-center gap-2">
                      <FileText size={20} />
                      Stiahnuť vzor
                    </button>
                  </div>
                </div>
              </div>

              {/* JSON Import */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">JSON Import (Kompletný profil)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Importujte kompletnú zálohu profilu (investície, transakcie, ciele, poistky)
                </p>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => handleFileUpload(e, 'json')}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-300
                      hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30"
                  />

                  {jsonContent && (
                    <div>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-x-auto max-h-48">
                        {jsonContent.substring(0, 500)}...
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={handleJSONImport} className="btn btn-primary flex items-center gap-2">
                      <Upload size={20} />
                      Importovať JSON
                    </button>
                    <button onClick={downloadSampleJSON} className="btn btn-secondary flex items-center gap-2">
                      <FileText size={20} />
                      Stiahnuť vzor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export sekcia */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Download size={24} className="text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export dát</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={exportCSV}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 transition-colors text-left"
              >
                <FileText size={32} className="text-primary-600 dark:text-primary-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Export CSV</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exportujte investície do CSV súboru</p>
              </button>

              <button
                onClick={exportJSON}
                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 transition-colors text-left"
              >
                <Database size={32} className="text-primary-600 dark:text-primary-400 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Export JSON</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kompletná záloha profilu</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
