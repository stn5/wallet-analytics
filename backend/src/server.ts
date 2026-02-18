import "dotenv/config";
import express from "express";
import { ethers } from "ethers";
import { CHAINS } from "./config/chains.js";
import { providers } from "./lib/providers.js";

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function getTokenBalance(provider: ethers.JsonRpcProvider, tokenAddress: string, walletAddress: string) {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [balance, decimals] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals()
  ]);
  return +ethers.formatUnits(balance, decimals);
}

async function getChainBalances(key: string, address: string) {
  const chain = CHAINS[key];
  const provider = providers[key];

  if (!chain || !provider) {
    throw new Error(`Invalid chain config for ${key}`);
  }

  const [native, usdc, zro] = await Promise.all([
    provider.getBalance(address).then(b => +ethers.formatEther(b)),
    chain.usdc_contract ? getTokenBalance(provider, chain.usdc_contract, address).catch(() => 0) : null,
    chain.zro_contract ? getTokenBalance(provider, chain.zro_contract, address).catch(() => 0) : null
  ]);

  return {
    name: chain.name,
    native: {symbol: chain.nativeCurrency, balance: native},
    usdc,
    zro
  };
}

app.get("/api/balances/:address", async (req, res) => {
  const {address} = req.params;

  if (!ethers.isAddress(address)) {
    res.status(400).json({error: "Invalid address"});
    return;
  }

  const balances = await Promise.all(
    Object.keys(CHAINS).map((key) =>
      getChainBalances(key, address).catch(() => ({chain: CHAINS[key].name, error: "Failed to fetch"}))
    )
  );

  res.json({address, balances});
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});