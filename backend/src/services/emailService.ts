import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Len inicializuj ak sú credentials
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    } else {
      console.log('⚠️  Email service not configured (SMTP_USER, SMTP_PASS missing)');
    }
  }

  /**
   * Pošli email pripomienku o obnovení poistky
   */
  async sendInsuranceRenewalReminder(
    email: string,
    insurance: {
      type: string;
      provider: string;
      policyNumber: string;
      renewalDate: Date;
      premium: number;
      daysUntilRenewal: number;
    }
  ): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 Email simulation (no SMTP configured):', { email, insurance });
      return false;
    }

    const typeLabels: Record<string, string> = {
      car: 'Autopoisťovka',
      home: 'Poistenie domácnosti',
      health: 'Zdravotné poistenie',
      life: 'Životné poistenie',
    };

    const typeLabel = typeLabels[insurance.type] || insurance.type;
    const urgencyClass = insurance.daysUntilRenewal <= 7 ? 'urgent' : 'warning';

    const subject = `⏰ Pripomienka: Obnovenie poistky ${typeLabel} o ${insurance.daysUntilRenewal} dní`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .alert-box { background: ${urgencyClass === 'urgent' ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${urgencyClass === 'urgent' ? '#ef4444' : '#f59e0b'}; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ FinanceAI</h1>
      <p>Váš osobný finančný poradca</p>
    </div>

    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top: 0; color: ${urgencyClass === 'urgent' ? '#dc2626' : '#d97706'};">
          ${insurance.daysUntilRenewal <= 7 ? '🚨 URGENTNÉ' : '⚠️ PRIPOMIENKA'}
        </h2>
        <p style="font-size: 18px; margin: 10px 0;">
          Vaša poistka <strong>${typeLabel}</strong> sa končí o <strong>${insurance.daysUntilRenewal} dní</strong>!
        </p>
      </div>

      <h3>Detail poistky:</h3>
      <div class="detail-row">
        <span><strong>Poisťovňa:</strong></span>
        <span>${insurance.provider}</span>
      </div>
      <div class="detail-row">
        <span><strong>Číslo zmluvy:</strong></span>
        <span>${insurance.policyNumber}</span>
      </div>
      <div class="detail-row">
        <span><strong>Dátum obnovenia:</strong></span>
        <span>${new Date(insurance.renewalDate).toLocaleDateString('sk-SK')}</span>
      </div>
      <div class="detail-row">
        <span><strong>Ročná platba:</strong></span>
        <span><strong>€${insurance.premium.toFixed(2)}</strong></span>
      </div>

      <h3 style="margin-top: 30px;">💡 Odporúčame:</h3>
      <ul>
        <li>Porovnajte aktuálne ponuky iných poisťovní</li>
        <li>Skontrolujte možnosti zliav a bonusov</li>
        <li>Overte, či potrebujete upraviť rozsah poistenia</li>
        <li>Kontaktujte svoju poisťovňu vopred</li>
      </ul>

      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/insurance" class="btn">
        Spravovať poistky
      </a>

      <p style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 6px; font-size: 14px;">
        <strong>💰 Chcete ušetriť?</strong><br>
        Náš AI asistent vám môže automaticky nájsť lepšie ponuky a odporučiť optimálne riešenie.
      </p>
    </div>

    <div class="footer">
      <p>FinanceAI - AI Finančný Poradca pre slovenský trh</p>
      <p>Ak nechcete dostávať pripomienky, môžete ich vypnúť v nastaveniach.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
PRIPOMIENKA: Obnovenie poistky

${typeLabel} - ${insurance.provider}
Číslo zmluvy: ${insurance.policyNumber}
Dátum obnovenia: ${new Date(insurance.renewalDate).toLocaleDateString('sk-SK')}
Zostáva dní: ${insurance.daysUntilRenewal}
Ročná platba: €${insurance.premium.toFixed(2)}

Nezabudnite:
- Porovnať ponuky iných poisťovní
- Skontrolovať možnosti zliav
- Overiť rozsah poistenia

Spravovať poistky: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/insurance

FinanceAI - Váš osobný finančný poradca
    `.trim();

    try {
      await this.transporter.sendMail({
        from: `"FinanceAI" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      });

      console.log(`✅ Email reminder sent to ${email} for ${typeLabel}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Pošli email s najlepšími ponukami
   */
  async sendBestOffersEmail(
    email: string,
    insuranceType: string,
    currentPremium: number,
    bestOffers: Array<{
      provider: string;
      premium: number;
      savings: number;
      rating: number;
    }>
  ): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 Email simulation (no SMTP configured):', { email, bestOffers });
      return false;
    }

    const typeLabels: Record<string, string> = {
      car: 'Autopoisťovka',
      home: 'Poistenie domácnosti',
      health: 'Zdravotné poistenie',
      life: 'Životné poistenie',
    };

    const typeLabel = typeLabels[insuranceType] || insuranceType;
    const totalSavings = bestOffers[0]?.savings || 0;

    const subject = `💰 Našli sme lepšie ponuky pre ${typeLabel} - ušetríte až €${totalSavings.toFixed(0)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .offer-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .savings { background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
    .rating { color: #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Skvělé správy!</h1>
      <p>Našli sme pre vás lepšie ponuky</p>
    </div>

    <div class="content">
      <p style="font-size: 18px; text-align: center; margin: 20px 0;">
        Pre <strong>${typeLabel}</strong> môžete ušetriť až <strong class="savings">€${totalSavings.toFixed(2)}/rok</strong>
      </p>

      <h3>Top ponuky:</h3>
      ${bestOffers
        .slice(0, 3)
        .map(
          (offer, idx) => `
        <div class="offer-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 10px 0;">${idx + 1}. ${offer.provider}</h4>
              <p style="margin: 5px 0;">
                <span class="rating">★</span> ${offer.rating}/5
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">€${offer.premium.toFixed(0)}</div>
              <div style="font-size: 14px; color: #16a34a;">Ušetríte €${offer.savings.toFixed(0)}</div>
            </div>
          </div>
        </div>
      `
        )
        .join('')}

      <div style="background: #fef3c7; padding: 20px; margin: 30px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin: 0 0 10px 0;">⏰ Akcia končí čoskoro!</h4>
        <p style="margin: 0;">Niektoré poisťovne ponúkajú sezónne zľavy len obmedzený čas. Odporúčame konať rýchlo.</p>
      </div>

      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/insurance"
         style="display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Pozrieť všetky ponuky
      </a>
    </div>

    <div class="footer">
      <p>FinanceAI - AI Finančný Poradca pre slovenský trh</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
Skvělé správy!

Pre ${typeLabel} môžete ušetriť až €${totalSavings.toFixed(2)}/rok

Top ponuky:
${bestOffers
  .slice(0, 3)
  .map(
    (offer, idx) =>
      `${idx + 1}. ${offer.provider} - €${offer.premium.toFixed(0)}/rok (ušetríte €${offer.savings.toFixed(0)})`
  )
  .join('\n')}

Pozrieť všetky ponuky: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/insurance

FinanceAI - Váš osobný finančný poradca
    `.trim();

    try {
      await this.transporter.sendMail({
        from: `"FinanceAI" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
      });

      console.log(`✅ Best offers email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}
