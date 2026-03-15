import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';

export default function Portfolio() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioService.getPortfolioSummary,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Načítavam portfólio...</div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moje Portfólio</h1>
        <p className="text-gray-600 mt-1">Prehľad všetkých investícií</p>
      </div>

      {/* Súhrn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Celková hodnota</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalValue)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Celkový zisk/strata</p>
          <p
            className={`text-3xl font-bold ${
              summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(summary.totalProfit)}
          </p>
          <p
            className={`text-sm mt-1 ${
              summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {summary.totalProfitPercentage >= 0 ? '↑' : '↓'}{' '}
            {Math.abs(summary.totalProfitPercentage).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Počet investícií</p>
          <p className="text-3xl font-bold text-gray-900">{summary.holdings.length}</p>
        </div>
      </div>

      {/* Alokácia */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alokácia aktív</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summary.allocation.map(item => (
            <div key={item.type} className="text-center">
              <p className="text-sm text-gray-600 capitalize">{item.type}</p>
              <p className="text-2xl font-bold text-primary-600">{item.percentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Symbol</th>
                <th className="text-left py-3 px-4">Názov</th>
                <th className="text-left py-3 px-4">Typ</th>
                <th className="text-right py-3 px-4">Počet</th>
                <th className="text-right py-3 px-4">Cena</th>
                <th className="text-right py-3 px-4">Hodnota</th>
                <th className="text-right py-3 px-4">Zisk/Strata</th>
              </tr>
            </thead>
            <tbody>
              {summary.holdings.map(holding => (
                <tr key={holding.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{holding.symbol}</td>
                  <td className="py-3 px-4">{holding.name}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 capitalize">
                      {holding.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{holding.shares.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(holding.currentPrice)}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {formatCurrency(holding.value)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      holding.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {holding.profitPercentage >= 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {Math.abs(holding.profitPercentage).toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
