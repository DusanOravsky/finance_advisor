import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { PortfolioService } from './portfolioService';
import { TransactionService } from './transactionService';

const prisma = new PrismaClient();
const portfolioService = new PortfolioService();
const transactionService = new TransactionService();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class AIService {
  async chat(userId: string, userMessage: string) {
    // Získaj kontext o používateľovi a portfóliu
    const context = await this.buildContext(userId);

    // Ulož user správu
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: userMessage,
      },
    });

    // Získaj históriu konverzácie (posledných 10 správ)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Priprav messages pre Claude
    const messages: Anthropic.MessageParam[] = history
      .reverse()
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Zavolaj Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: this.buildSystemPrompt(context),
      messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Prepáčte, nepodarilo sa vygenerovať odpoveď.';

    // Ulož assistant odpoveď
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: assistantMessage,
      },
    });

    return {
      message: assistantMessage,
      context,
    };
  }

  private async buildContext(userId: string) {
    const [user, portfolio, cashflow] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      portfolioService.getPortfolioSummary(userId),
      transactionService.getCashflowSummary(userId),
    ]);

    return {
      user: {
        name: user?.name,
        currency: user?.currency,
        riskTolerance: user?.riskTolerance,
        timeHorizon: user?.timeHorizon,
        monthlyIncome: user?.monthlyIncome,
        monthlyExpenses: user?.monthlyExpenses,
      },
      portfolio: {
        totalValue: portfolio.totalValue,
        totalProfit: portfolio.totalProfit,
        allocation: portfolio.allocation,
        topHoldings: portfolio.holdings.slice(0, 5),
      },
      cashflow: {
        totalIncome: cashflow.totalIncome,
        totalExpenses: cashflow.totalExpenses,
        netCashflow: cashflow.netCashflow,
        savingsRate: cashflow.savingsRate,
      },
    };
  }

  private buildSystemPrompt(context: any): string {
    return `Si AI finančný poradca pre slovenský trh. Tvoje meno je FinanceAI.

KONTEXT O KLIENTOVI:
- Meno: ${context.user.name}
- Mena: ${context.user.currency}
- Rizikový profil: ${context.user.riskTolerance}
- Časový horizont: ${context.user.timeHorizon}
- Mesačný príjem: ${context.user.monthlyIncome} ${context.user.currency}
- Mesačné výdavky: ${context.user.monthlyExpenses} ${context.user.currency}

PORTFÓLIO:
- Celková hodnota: ${context.portfolio.totalValue.toFixed(2)} ${context.user.currency}
- Celkový zisk: ${context.portfolio.totalProfit.toFixed(2)} ${context.user.currency}
- Alokácia aktív:
${context.portfolio.allocation.map((a: any) => `  - ${a.type}: ${a.percentage.toFixed(1)}%`).join('\n')}

TOP HOLDINGS:
${context.portfolio.topHoldings.map((h: any) => `  - ${h.symbol} (${h.name}): ${h.value.toFixed(2)} ${context.user.currency}`).join('\n')}

CASHFLOW (posledných 6 mesiacov):
- Príjmy: ${context.cashflow.totalIncome.toFixed(2)} ${context.user.currency}
- Výdavky: ${context.cashflow.totalExpenses.toFixed(2)} ${context.user.currency}
- Čistý cashflow: ${context.cashflow.netCashflow.toFixed(2)} ${context.user.currency}
- Savings rate: ${context.cashflow.savingsRate.toFixed(1)}%

POKYNY:
1. Odpovedaj v slovenčine
2. Buď konkrétny a používaj dáta z kontextu
3. Dávaj praktické, realizovateľné rady
4. Pri investičných odporúčaniach zohľadni rizikový profil a časový horizont
5. Zdôrazni výhody diversifikácie
6. Pri návrhu zmien vždy vysvetli prečo
7. Buď priateľský ale profesionálny
8. Neodporúčaj konkrétne produkty, ale kategórie (ETF, dlhopisy, atď.)
9. Pripomeň rizikové faktory pri investíciách
10. Zohľadni slovenský a európsky trh`;
  }

  async analyzePortfolio(userId: string) {
    const portfolio = await portfolioService.getPortfolioSummary(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const prompt = `Analyzuj toto portfólio a poskytni detailné odporúčania:

Celková hodnota: ${portfolio.totalValue} ${user?.currency}
Alokácia:
${portfolio.allocation.map(a => `- ${a.type}: ${a.percentage.toFixed(1)}%`).join('\n')}

Rizikový profil: ${user?.riskTolerance}
Časový horizont: ${user?.timeHorizon}

Poskytni:
1. Hodnotenie súčasnej alokácie
2. Odporúčania na rebalancing
3. Riziká v portfóliu
4. Príležitosti na zlepšenie`;

    return await this.chat(userId, prompt);
  }

  async getChatHistory(userId: string, limit = 50) {
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async clearChatHistory(userId: string) {
    await prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }
}
