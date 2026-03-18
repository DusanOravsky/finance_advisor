import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData) {
    // Skontroluj či user už existuje
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Používateľ s týmto emailom už existuje');
    }

    // Hash hesla
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Vytvor usera
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        settings: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true,
      },
    });

    // Generuj tokeny
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData) {
    // Nájdi usera
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Nesprávny email alebo heslo');
    }

    // Overenie hesla
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Nesprávny email alebo heslo');
    }

    // Generuj tokeny
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        riskTolerance: true,
        timeHorizon: true,
        monthlyIncome: true,
        monthlyExpenses: true,
        savingsGoal: true,
        createdAt: true,
        settings: {
          select: {
            id: true,
            notifyInsuranceRenewal: true,
            notifyInvestmentAlerts: true,
            notifyBudgetAlerts: true,
            notifyMonthlyReports: true,
            notifyCryptoAlerts: true,
            twoFactorEnabled: true,
            theme: true,
            language: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Používateľ nenájdený');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<RegisterData>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        riskTolerance: true,
        timeHorizon: true,
        monthlyIncome: true,
        monthlyExpenses: true,
        savingsGoal: true,
      },
    });

    return user;
  }

  async updateSettings(userId: string, settingsData: any) {
    // Najprv zisti userId zo settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Vytvor settings ak neexistujú
      return await prisma.userSettings.create({
        data: {
          userId,
          ...settingsData,
        },
      });
    }

    // Aktualizuj existujúce settings
    return await prisma.userSettings.update({
      where: { userId },
      data: settingsData,
    });
  }
}
