import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, AlertTriangle, TrendingDown } from 'lucide-react';
import { insuranceService } from '../services/insurance.service';

export default function Insurance() {
  const queryClient = useQueryClient();
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState('car');

  const { data: insurances, isLoading } = useQuery({
    queryKey: ['insurances'],
    queryFn: insuranceService.getInsurances,
  });

  const { data: renewals } = useQuery({
    queryKey: ['insurance-renewals'],
    queryFn: () => insuranceService.getUpcomingRenewals(90),
  });

  const { data: comparison } = useQuery({
    queryKey: ['insurance-comparison', comparisonType],
    queryFn: () => insuranceService.compareInsurance(comparisonType),
    enabled: showComparison,
  });

  const deleteInsuranceMutation = useMutation({
    mutationFn: insuranceService.deleteInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
    },
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Správa poistenia</h1>
          <p className="text-gray-600 mt-1">Prehľad vašich poistiek</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Pridať poistku
        </button>
      </div>

      {/* Upozornenia na obnovenie */}
      {renewals && renewals.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Nadchádzajúce obnovenia ({renewals.length})
              </h3>
              <div className="space-y-2">
                {renewals.slice(0, 3).map((renewal: any) => (
                  <div key={renewal.id} className="flex justify-between text-sm">
                    <span>
                      {getTypeLabel(renewal.type)} - {renewal.provider}
                    </span>
                    <span
                      className={`font-medium ${
                        renewal.urgent ? 'text-red-600' : 'text-yellow-600'
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
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Shield className="text-primary-600" size={24} />
                </div>
                {isUrgent && <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">Urgentné</span>}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">
                {getTypeLabel(insurance.type)}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{insurance.provider}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ročná platba:</span>
                  <span className="font-semibold">{formatCurrency(insurance.premium)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Obnovenie:</span>
                  <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                    {new Date(insurance.renewalDate).toLocaleDateString('sk-SK')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Číslo zmluvy:</span>
                  <span className="text-xs">{insurance.policyNumber}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">{insurance.coverage}</p>
              </div>

              <button
                onClick={() => setComparisonType(insurance.type)}
                className="mt-4 w-full btn btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <TrendingDown size={16} />
                Porovnať ponuky
              </button>
            </div>
          );
        })}
      </div>

      {/* Porovnanie ponúk */}
      {showComparison && comparison && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Porovnanie ponúk - {getTypeLabel(comparisonType)}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Poisťovňa</th>
                  <th className="text-left py-3 px-4">Krytie</th>
                  <th className="text-right py-3 px-4">Ročná platba</th>
                  <th className="text-right py-3 px-4">Zľava</th>
                  <th className="text-center py-3 px-4">Rating</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((offer: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{offer.provider}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{offer.coverage}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(offer.premium)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {offer.discount > 0 ? (
                        <span className="text-green-600">-{offer.discount}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-yellow-500">★</span> {offer.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
