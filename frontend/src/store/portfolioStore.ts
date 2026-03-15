import { create } from 'zustand';
import { PortfolioSummary } from '../types/portfolio.types';

interface PortfolioState {
  summary: PortfolioSummary | null;
  setSummary: (summary: PortfolioSummary) => void;
}

export const usePortfolioStore = create<PortfolioState>(set => ({
  summary: null,
  setSummary: summary => set({ summary }),
}));
