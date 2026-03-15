export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  platform?: string;
  createdAt: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalProfit: number;
  totalProfitPercentage: number;
  allocation: AllocationItem[];
  holdings: HoldingItem[];
}

export interface AllocationItem {
  type: string;
  value: number;
  percentage: number;
}

export interface HoldingItem {
  id: string;
  symbol: string;
  name: string;
  type: string;
  shares: number;
  currentPrice: number;
  value: number;
  profitPercentage: number;
}
