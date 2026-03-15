import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, TrendingUp, DollarSign, Target } from 'lucide-react';
import { reportService } from '../services/report.service';

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil(currentMonth / 3));

  const { data: monthlyReport, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthly-report', selectedYear, selectedMonth],
    queryFn: () => reportService.getMonthlyReport(selectedYear, selectedMonth),
  });

  const { data: yearlyReport } = useQuery({
    queryKey: ['yearly-report', selectedYear],
    queryFn: () => reportService.getYearlyReport(selectedYear),
  });

  const { data: taxReport } = useQuery({
    queryKey: ['tax-report', selectedYear - 1],
    queryFn: () => reportService.getTaxReport(selectedYear - 1),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const monthNames = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reporty a Analýzy</h1>
        <p className="text-gray-600 mt-1">Prehľad vašich financií</p>
      </div>

      {/* Filters */}
      <div className="card flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rok</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mesiac</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Report */}
      {monthlyReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Mesačný report - {monthNames[selectedMonth - 1]} {selectedYear}
            </h2>
            <button className="btn btn-secondary flex items-center gap-2">
              <Download size={18} />
              Export PDF
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Príjmy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyReport.transactions.income)}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <DollarSign className="text-red-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Výdavky</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyReport.transactions.expenses)}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Target className="text-blue-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Čisté úspory</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyReport.transactions.netCashflow)}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Savings Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyReport.transactions.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Transactions by Category */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Výdavky podľa kategórií
            </h3>
            <div className="space-y-3">
              {Object.entries(monthlyReport.transactions.byCategory || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([category, amount]) => {
                  const percentage = ((amount as number) / monthlyReport.transactions.expenses) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{category}</span>
                        <span className="text-gray-600">
                          {formatCurrency(amount as number)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Portfolio Snapshot */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Portfólio (k {new Date().toLocaleDateString('sk-SK')})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Celková hodnota</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(monthlyReport.portfolio.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Zisk/Strata</p>
                <p
                  className={`text-xl font-bold ${
                    monthlyReport.portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(monthlyReport.portfolio.totalProfit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Výkonnosť</p>
                <p
                  className={`text-xl font-bold ${
                    monthlyReport.portfolio.totalProfitPercentage >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {monthlyReport.portfolio.totalProfitPercentage.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ciele</p>
                <p className="text-xl font-bold text-gray-900">
                  {monthlyReport.goals.completed}/{monthlyReport.goals.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Report */}
      {taxReport && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Daňový report {taxReport.year}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Celkový príjem</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(taxReport.income.totalIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Kapitálové zisky</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(taxReport.investments.capitalGains)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Odhadovaná daň</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(taxReport.estimatedTax)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Zjednodušený výpočet. Pre presné daňové priznanie konzultujte s daňovým poradcom.
          </p>
        </div>
      )}
    </div>
  );
}
