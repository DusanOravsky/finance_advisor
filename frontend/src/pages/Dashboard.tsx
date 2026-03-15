import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, Target, DollarSign } from 'lucide-react';
import StatCard from '../components/shared/StatCard';
import { dashboardService } from '../services/dashboard.service';

export default function Dashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getOverview,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Načítavam dashboard...</div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: overview.user.currency,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vitajte späť, {overview.user.name}!</p>
      </div>

      {/* Štatistiky */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Celkové aktíva"
          value={formatCurrency(overview.financialOverview.totalAssets)}
          icon={Wallet}
          color="primary"
        />
        <StatCard
          title="Mesačný príjem"
          value={formatCurrency(overview.financialOverview.monthlyIncome)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Mesačné úspory"
          value={formatCurrency(overview.financialOverview.monthlySavings)}
          icon={DollarSign}
          color="yellow"
        />
        <StatCard
          title="Dokončené ciele"
          value={`${overview.goals.completed}/${overview.goals.total}`}
          icon={Target}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfólio */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Portfólio</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Celková hodnota:</span>
              <span className="font-semibold">
                {formatCurrency(overview.portfolio.totalValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zisk/Strata:</span>
              <span
                className={`font-semibold ${
                  overview.portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(overview.portfolio.totalProfit)} (
                {overview.portfolio.totalProfitPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Alokácia aktív</h3>
            <div className="space-y-2">
              {overview.portfolio.allocation.map((item: any) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item.type}</span>
                    <span>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finančné ciele */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Finančné ciele</h2>
          <div className="space-y-4">
            {overview.goals.items.slice(0, 3).map((goal: any) => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-gray-600">{goal.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                  <span>{goal.daysRemaining} dní</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posledné transakcie */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Posledné transakcie</h2>
        <div className="space-y-3">
          {overview.recentTransactions.map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{tx.description}</p>
                <p className="text-sm text-gray-500">{tx.category}</p>
              </div>
              <span
                className={`font-semibold ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(tx.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
