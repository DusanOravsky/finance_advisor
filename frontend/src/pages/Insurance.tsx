import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, AlertTriangle, TrendingDown, Edit, Mail, Sparkles, ExternalLink } from 'lucide-react';
import { insuranceService } from '../services/insurance.service';
import InsuranceModal, { InsuranceFormData } from '../components/insurance/InsuranceModal';
import { toast } from 'react-hot-toast';

export default function Insurance() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<any>(null);
  const [showBestOffers, setShowBestOffers] = useState<string | null>(null);
  const [aiOffers, setAiOffers] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const { data: insurances, isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.getInsurances,
  });

  const { data: renewals } = useQuery({
    queryKey: ['insurance-renewals'],
    queryFn: () => insuranceService.getUpcomingRenewals(90),
  });

  const createMutation = useMutation({
    mutationFn: insuranceService.createInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insurance-renewals'] });
      setShowModal(false);
      setEditingInsurance(null);
      toast.success('Poistka bola vytvorená');
    },
    onError: () => {
      toast.error('Chyba pri vytváraní poistky');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      insuranceService.updateInsurance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insurance-renewals'] });
      setShowModal(false);
      setEditingInsurance(null);
      toast.success('Poistka bola aktualizovaná');
    },
    onError: () => {
      toast.error('Chyba pri aktualizácii poistky');
    },
  });

  const deleteInsuranceMutation = useMutation({
    mutationFn: insuranceService.deleteInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      toast.success('Poistka bola odstránená');
    },
    onError: () => {
      toast.error('Chyba pri odstraňovaní poistky');
    },
  });

  const handleSave = (data: InsuranceFormData) => {
    if (editingInsurance) {
      updateMutation.mutate({ id: editingInsurance.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (insurance: any) => {
    setEditingInsurance(insurance);
    setShowModal(true);
  };

  const handleSendReminder = async (insuranceId: string) => {
    try {
      await insuranceService.sendReminderEmail(insuranceId);
      toast.success('Email pripomienka bola odoslaná');
    } catch (error) {
      toast.error('Chyba pri odosielaní emailu');
    }
  };

  const handleFindBestOffers = async (type: string, currentPremium: number) => {
    setLoadingAi(true);
    setShowBestOffers(type);
    try {
      const offers = await insuranceService.scrapeBestOffers(type, { currentPremium });
      setAiOffers(offers);
      toast.success(`Našli sme ${offers.length} ponúk`);
    } catch (error) {
      toast.error('Chyba pri hľadaní ponúk');
      setAiOffers([]);
    } finally {
      setLoadingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Načítavam poistky...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      car: 'Autopoisťovka',
      home: 'Poistenie domácnosti',
      health: 'Zdravotné poistenie',
      life: 'Životné poistenie',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Správa poistenia</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Prehľad vašich poistiek</p>
        </div>
        <button
          onClick={() => {
            setEditingInsurance(null);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Pridať poistku
        </button>
      </div>

      {/* Upozornenia na obnovenie */}
      {renewals && renewals.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Nadchádzajúce obnovenia ({renewals.length})
              </h3>
              <div className="space-y-2">
                {renewals.slice(0, 3).map((renewal: any) => (
                  <div key={renewal.id} className="flex justify-between text-sm">
                    <span className="dark:text-gray-300">
                      {getTypeLabel(renewal.type)} - {renewal.provider}
                    </span>
                    <span
                      className={`font-medium ${
                        renewal.urgent ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {renewal.daysUntilRenewal} dní
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoznam poistiek */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insurances?.map((insurance: any) => {
          const daysUntilRenewal = Math.ceil(
            (new Date(insurance.renewalDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const isUrgent = daysUntilRenewal <= 30;

          return (
            <div key={insurance.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Shield className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div className="flex gap-2">
                  {isUrgent && (
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                      Urgentné
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(insurance)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Upraviť"
                  >
                    <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {getTypeLabel(insurance.type)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insurance.provider}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ročná platba:</span>
                  <span className="font-semibold dark:text-white">{formatCurrency(insurance.premium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Obnovenie:</span>
                  <span className={isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'dark:text-white'}>
                    {new Date(insurance.renewalDate).toLocaleDateString('sk-SK')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pripomienka:</span>
                  <span className="dark:text-white">{insurance.reminderDays} dní vopred</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Číslo zmluvy:</span>
                  <span className="text-xs dark:text-gray-300">{insurance.policyNumber}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">{insurance.coverage}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleFindBestOffers(insurance.type, insurance.premium)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  AI Ponuky
                </button>
                {insurance.emailReminder && (
                  <button
                    onClick={() => handleSendReminder(insurance.id)}
                    className="btn btn-secondary text-sm flex items-center justify-center gap-2"
                    title="Poslať email pripomienku"
                  >
                    <Mail size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Najlepšie ponuky */}
      {showBestOffers && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-primary-600 dark:text-primary-400" />
              AI Najlepšie ponuky - {getTypeLabel(showBestOffers)}
            </h2>
            <button
              onClick={() => setShowBestOffers(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {loadingAi ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Analyzujem slovenský trh...</p>
            </div>
          ) : aiOffers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 dark:text-white">Poisťovňa</th>
                    <th className="text-left py-3 px-4 dark:text-white">Krytie</th>
                    <th className="text-right py-3 px-4 dark:text-white">Ročná platba</th>
                    <th className="text-right py-3 px-4 dark:text-white">Zľava</th>
                    <th className="text-center py-3 px-4 dark:text-white">Rating</th>
                    <th className="text-center py-3 px-4 dark:text-white">Odkaz</th>
                  </tr>
                </thead>
                <tbody>
                  {aiOffers.map((offer: any, idx: number) => (
                    <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium dark:text-white">{offer.provider}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{offer.coverage}</td>
                      <td className="py-3 px-4 text-right font-semibold dark:text-white">
                        {formatCurrency(offer.premium)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {offer.discount > 0 ? (
                          <span className="text-green-600 dark:text-green-400">-{offer.discount}%</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center dark:text-white">
                        <span className="text-yellow-500">★</span> {offer.rating}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Žiadne ponuky sa nenašli</p>
          )}
        </div>
      )}

      <InsuranceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInsurance(null);
        }}
        onSave={handleSave}
        initialData={editingInsurance}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
