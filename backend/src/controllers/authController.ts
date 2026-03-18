import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { z } from 'zod';
import { AuthRequest } from '../types';

const authService = new AuthService();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(6, 'Heslo musí mať minimálne 6 znakov'),
  name: z.string().min(2, 'Meno musí mať minimálne 2 znaky'),
});

const loginSchema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(1, 'Heslo je povinné'),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validačná chyba',
          errors: error.errors,
        });
      }

      res.status(400).json({
        status: 'error',
        message: error.message || 'Chyba pri registrácii',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validačná chyba',
          errors: error.errors,
        });
      }

      res.status(401).json({
        status: 'error',
        message: error.message || 'Chyba pri prihlásení',
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await authService.getProfile(userId);

      res.json({
        status: 'success',
        data: profile,
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message || 'Profil nenájdený',
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await authService.updateProfile(userId, req.body);

      res.json({
        status: 'success',
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Chyba pri aktualizácii profilu',
      });
    }
  }

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const settings = await authService.updateSettings(userId, req.body);

      res.json({
        status: 'success',
        data: settings,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message || 'Chyba pri aktualizácii nastavení',
      });
    }
  }

  async logout(req: Request, res: Response) {
    // V production by sa tu invalidoval refresh token v Redis
    res.json({
      status: 'success',
      message: 'Odhlásenie úspešné',
    });
  }
}
