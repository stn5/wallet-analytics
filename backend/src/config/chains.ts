export interface ChainConfig {
  name: string;
  chainId: number;
  nativeCurrency: string;
  usdc_contract: string | null;
  zro_contract: string | null;
}

const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: "eth",
    chainId: 1,
    nativeCurrency: "ETH",
    usdc_contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  base: {
    name: "base",
    chainId: 8453,
    nativeCurrency: "ETH",
    usdc_contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  arbitrum: {
    name: "arb",
    chainId: 42161,
    nativeCurrency: "ETH",
    usdc_contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  optimism: {
    name: "opt",
    chainId: 10,
    nativeCurrency: "ETH",
    usdc_contract: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  binance: {
    name: "bnb",
    chainId: 56,
    nativeCurrency: "BNB",
    usdc_contract: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  polygon: {
    name: "polygon",
    chainId: 137,
    nativeCurrency: "POL",
    usdc_contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  avalanche: {
    name: "avax",
    chainId: 43114,
    nativeCurrency: "AVAX",
    usdc_contract: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    zro_contract: "0x6985884C4392D348587B19cb9eAAf157F13271cd",
  },
  unichain: {
    name: "unichain",
    chainId: 130,
    nativeCurrency: "ETH",
    usdc_contract: "0x078d782b760474a361dda0af3839290b0ef57ad6",
    zro_contract: null,
  },
};

export { CHAINS };
