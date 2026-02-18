import { JsonRpcProvider } from "ethers";
import { CHAINS } from "../config/chains.js";

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;

function buildAlchemyUrl(chain: string) {
  return `https://${chain}-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
}

const providers = Object.fromEntries(
  Object.entries(CHAINS).map(([key, chain]) => [
    key,
    new JsonRpcProvider(buildAlchemyUrl(chain.name))
  ])
);

export { providers };
