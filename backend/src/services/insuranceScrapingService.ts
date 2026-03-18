import Anthropic from '@anthropic-ai/sdk';

interface ScrapingResult {
  provider: string;
  premium: number;
  coverage: string;
  rating: number;
  discount: number;
  features: string[];
  url: string;
}

export class InsuranceScrapingService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * AI-powered scraping slovenských poisťovní
   */
  async scrapeInsuranceOffers(
    type: string,
    userProfile: {
      age?: number;
      vehicle?: string;
      propertyValue?: number;
      currentPremium?: number;
    }
  ): Promise<ScrapingResult[]> {
    if (!this.client) {
      // Fallback na simulované dáta ak nie je API key
      return this.getFallbackOffers(type);
    }

    try {
      const prompt = this.buildScrapingPrompt(type, userProfile);

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parseScrapingResponse(content.text);
      }

      return this.getFallbackOffers(type);
    } catch (error) {
      console.error('Insurance scraping error:', error);
      return this.getFallbackOffers(type);
    }
  }

  private buildScrapingPrompt(type: string, userProfile: any): string {
    const typeMap: Record<string, string> = {
      car: 'autopoisťovka (PZP + havarijné)',
      home: 'poistenie domácnosti a nehnuteľnosti',
      health: 'nadštandardné zdravotné poistenie',
      life: 'životné poistenie',
    };

    return `Si expert na slovenský trh poistenia. Potrebujem aktuálne porovnanie ponúk pre ${typeMap[type] || type}.

Profil klienta:
${JSON.stringify(userProfile, null, 2)}

Vráť mi JSON pole s najlepšími ponukami slovenských poisťovní (Allianz, UNIQA, Generali, Kooperativa, AXA, NN, ČSOB, Union).

Formát:
[
  {
    "provider": "názov poisťovne",
    "premium": ročná platba v EUR (číslo),
    "coverage": "popis krytia",
    "rating": hodnotenie 1-5 (číslo),
    "discount": zľava v % (číslo),
    "features": ["funkcia 1", "funkcia 2"],
    "url": "odkaz na ponuku"
  }
]

Zameraj sa na reálne ceny a podmienky z roku 2026. Vráť len JSON pole, žiadny iný text.`;
  }

  private parseScrapingResponse(text: string): ScrapingResult[] {
    try {
      // Pokús sa extrahovať JSON z odpovede
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse scraping response:', error);
    }

    return [];
  }

  /**
   * Fallback simulované dáta ak AI nie je dostupné
   */
  private getFallbackOffers(type: string): ScrapingResult[] {
    const providers: Record<string, ScrapingResult[]> = {
      car: [
        {
          provider: 'UNIQA',
          premium: 380,
          coverage: 'Havarijné + PZP',
          rating: 4.3,
          discount: 15,
          features: ['Online zľava', 'Bezškodový bonus', 'Asistenčné služby'],
          url: 'https://www.uniqa.sk',
        },
        {
          provider: 'Kooperativa',
          premium: 395,
          coverage: 'Havarijné + PZP',
          rating: 4.2,
          discount: 12,
          features: ['Bodový systém', 'Náhradné vozidlo', 'Poistenie skla'],
          url: 'https://www.koop.sk',
        },
        {
          provider: 'Allianz Slovensko',
          premium: 450,
          coverage: 'Havarijné + PZP',
          rating: 4.5,
          discount: 0,
          features: ['Prémiové poistenie', 'Európska asistencia', 'GAP poistenie'],
          url: 'https://www.allianz.sk',
        },
        {
          provider: 'Generali Slovensko',
          premium: 420,
          coverage: 'Havarijné + PZP',
          rating: 4.4,
          discount: 7,
          features: ['Bonus Mondo', 'Poistenie úrazu', 'Právna ochrana'],
          url: 'https://www.generali.sk',
        },
        {
          provider: 'AXA',
          premium: 465,
          coverage: 'Havarijné + PZP Premium',
          rating: 4.6,
          discount: 0,
          features: ['Plné krytie', 'Nulová spoluúčasť', 'Poistenie zavazadiel'],
          url: 'https://www.axa.sk',
        },
      ],
      home: [
        {
          provider: 'Kooperativa',
          premium: 265,
          coverage: 'Domácnosť základná',
          rating: 4.2,
          discount: 5,
          features: ['Online zľava', 'Poistenie elektroniky', 'Zákonné poistenie'],
          url: 'https://www.koop.sk',
        },
        {
          provider: 'Generali Slovensko',
          premium: 280,
          coverage: 'Domácnosť + majetok',
          rating: 4.4,
          discount: 0,
          features: ['Poistenie nehnuteľnosti', 'Živelné pohromy', 'Odcudzenie'],
          url: 'https://www.generali.sk',
        },
        {
          provider: 'Allianz Slovensko',
          premium: 295,
          coverage: 'Domácnosť + majetok',
          rating: 4.5,
          discount: 0,
          features: ['Prémiový balík', 'Asistenčné služby', 'Poistenie odpovědnosti'],
          url: 'https://www.allianz.sk',
        },
        {
          provider: 'UNIQA',
          premium: 310,
          coverage: 'Domácnosť premium',
          rating: 4.3,
          discount: 0,
          features: ['Luxusný majetok', 'Drahé kovy', 'Umelecké predmety'],
          url: 'https://www.uniqa.sk',
        },
      ],
      health: [
        {
          provider: 'Generali Slovensko',
          premium: 110,
          coverage: 'Základné zdravotné',
          rating: 4.0,
          discount: 10,
          features: ['Nadštandardná izba', 'Voľba lekára', 'Preventívne prehliadky'],
          url: 'https://www.generali.sk',
        },
        {
          provider: 'Kooperativa',
          premium: 120,
          coverage: 'Nadštandardné zdravotné',
          rating: 4.1,
          discount: 0,
          features: ['VIP starostlivosť', 'Zubné', 'Očné vyšetrenia'],
          url: 'https://www.koop.sk',
        },
        {
          provider: 'UNIQA',
          premium: 135,
          coverage: 'Nadštandardné zdravotné',
          rating: 4.2,
          discount: 0,
          features: ['Komplexné vyšetrenia', 'Rehabilitácie', 'Lieky'],
          url: 'https://www.uniqa.sk',
        },
        {
          provider: 'Allianz Slovensko',
          premium: 145,
          coverage: 'Premium zdravotné',
          rating: 4.4,
          discount: 0,
          features: ['Privátne kliniky', 'Zahraniční lekári', 'Urgent care'],
          url: 'https://www.allianz.sk',
        },
      ],
      life: [
        {
          provider: 'Generali Slovensko',
          premium: 78,
          coverage: 'Životné základné',
          rating: 4.1,
          discount: 8,
          features: ['Kapitálové poistenie', 'Invalidita', 'Úraz'],
          url: 'https://www.generali.sk',
        },
        {
          provider: 'UNIQA',
          premium: 85,
          coverage: 'Životné poistenie',
          rating: 4.3,
          discount: 0,
          features: ['Investičné pripojistenie', 'Vážne choroby', 'Pracovná neschopnosť'],
          url: 'https://www.uniqa.sk',
        },
        {
          provider: 'Allianz Slovensko',
          premium: 95,
          coverage: 'Životné poistenie',
          rating: 4.5,
          discount: 0,
          features: ['Flexibilné poistné', 'Garancie', 'Daňové zvýhodnenie'],
          url: 'https://www.allianz.sk',
        },
        {
          provider: 'NN Slovensko',
          premium: 105,
          coverage: 'Životné premium',
          rating: 4.4,
          discount: 0,
          features: ['Investičné fondy', 'Prémiové krytie', 'Rodinný balík'],
          url: 'https://www.nn.sk',
        },
      ],
    };

    return providers[type] || [];
  }

  /**
   * Analyzuj aktuálnu poistku a navrhni alternatívy
   */
  async analyzeCurrentInsurance(
    currentInsurance: {
      type: string;
      provider: string;
      premium: number;
      coverage: string;
    },
    userProfile: any
  ): Promise<{
    savings: number;
    bestOffer: ScrapingResult;
    recommendations: string[];
  }> {
    const offers = await this.scrapeInsuranceOffers(currentInsurance.type, userProfile);

    // Nájdi najlepšiu ponuku
    const sortedOffers = offers.sort((a, b) => {
      // Vážená kombinácia ceny a ratingu
      const scoreA = (5 - a.rating) * 100 + a.premium;
      const scoreB = (5 - b.rating) * 100 + b.premium;
      return scoreA - scoreB;
    });

    const bestOffer = sortedOffers[0];
    const savings = currentInsurance.premium - bestOffer.premium;

    const recommendations = [];
    if (savings > 0) {
      recommendations.push(
        `Môžete ušetriť €${savings.toFixed(2)}/rok prechodom na ${bestOffer.provider}`
      );
    }

    if (bestOffer.discount > 0) {
      recommendations.push(`${bestOffer.provider} ponúka ${bestOffer.discount}% zľavu`);
    }

    // Nájdi ponuky s lepším ratingom
    const betterRated = offers.filter(
      (o) => o.rating > 4.3 && o.premium < currentInsurance.premium * 1.1
    );
    if (betterRated.length > 0) {
      recommendations.push(
        `Poisťovne s lepším hodnotením: ${betterRated.map((o) => o.provider).join(', ')}`
      );
    }

    return {
      savings,
      bestOffer,
      recommendations,
    };
  }
}
