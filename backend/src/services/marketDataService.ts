import axios from 'axios';
import { createClient } from 'redis';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

// Redis client pre caching
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', err => console.log('Redis Client Error', err));

// Inicializuj Redis connection
let redisConnected = false;
(async () => {
  try {
    await redis.connect();
    redisConnected = true;
    console.log('✅ Redis connected');
  } catch (error) {
    console.log('⚠️  Redis not available, continuing without cache');
  }
})();

export class MarketDataService {
  // Crypto ceny z CoinGecko
  async getCryptoPrice(symbol: string): Promise<number> {
    const cacheKey = `crypto:${symbol.toLowerCase()}`;

    // Skús z cache (5 min TTL)
    if (redisConnected) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return parseFloat(cached);
        }
      } catch (error) {
        console.log('Redis get error:', error);
      }
    }

    // Mapping symbolov na CoinGecko IDs
    const coinMapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDC: 'usd-coin',
      USDT: 'tether',
      BNB: 'binancecoin',
      ADA: 'cardano',
      SOL: 'solana',
      DOT: 'polkadot',
    };

    const coinId = coinMapping[symbol.toUpperCase()] || symbol.toLowerCase();

    try {
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
        },
      });

      const price = response.data[coinId]?.usd || 0;

      // Ulož do cache
      if (redisConnected && price > 0) {
        try {
          await redis.setEx(cacheKey, 300, price.toString()); // 5 min TTL
        } catch (error) {
          console.log('Redis set error:', error);
        }
      }

      return price;
    } catch (error: any) {
      console.error(`Error fetching crypto price for ${symbol}:`, error.message);
      return 0;
    }
  }

  // Stock ceny z Alpha Vantage
  async getStockPrice(symbol: string): Promise<number> {
    const cacheKey = `stock:${symbol.toUpperCase()}`;

    // Skús z cache (15 min TTL pre akcie)
    if (redisConnected) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return parseFloat(cached);
        }
      } catch (error) {
        console.log('Redis get error:', error);
      }
    }

    if (!ALPHA_VANTAGE_KEY) {
      console.warn('Alpha Vantage API key not configured');
      return 0;
    }

    try {
      const response = await axios.get(ALPHA_VANTAGE_API, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: ALPHA_VANTAGE_KEY,
        },
      });

      const quote = response.data['Global Quote'];
      const price = parseFloat(quote?.['05. price'] || '0');

      // Ulož do cache
      if (redisConnected && price > 0) {
        try {
          await redis.setEx(cacheKey, 900, price.toString()); // 15 min TTL
        } catch (error) {
          console.log('Redis set error:', error);
        }
      }

      return price;
    } catch (error: any) {
      console.error(`Error fetching stock price for ${symbol}:`, error.message);
      return 0;
    }
  }

  // Univerzálna funkcia pre získanie ceny podľa typu
  async getPrice(symbol: string, type: string): Promise<number> {
    if (type === 'crypto') {
      return await this.getCryptoPrice(symbol);
    } else if (type === 'stock' || type === 'etf') {
      return await this.getStockPrice(symbol);
    }
    return 0;
  }

  // Bulk update cien pre portfólio
  async updatePortfolioPrices(investments: any[]): Promise<any[]> {
    const updated = [];

    for (const inv of investments) {
      try {
        const price = await this.getPrice(inv.symbol, inv.type);
        if (price > 0) {
          updated.push({
            id: inv.id,
            currentPrice: price,
          });
        }
      } catch (error) {
        console.error(`Error updating price for ${inv.symbol}:`, error);
      }
    }

    return updated;
  }

  // DeFi APY rates (simulované z DefiLlama)
  async getDefiRates(): Promise<any> {
    // V produkcii by to bol DefiLlama API call
    // https://yields.llama.fi/pools
    return {
      compound: { protocol: 'Compound', apy: 8.2, asset: 'USDC' },
      aave: { protocol: 'Aave', apy: 9.1, asset: 'ETH' },
      curve: { protocol: 'Curve', apy: 12.3, asset: '3pool' },
      lido: { protocol: 'Lido', apy: 4.5, asset: 'ETH' },
      uniswap: { protocol: 'Uniswap V3', apy: 15.8, asset: 'ETH/USDC' },
    };
  }
}
