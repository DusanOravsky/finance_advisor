export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  riskTolerance?: string;
  timeHorizon?: string;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  savingsGoal?: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
