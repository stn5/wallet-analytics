import "dotenv/config";
import express from "express";
import { ethers } from "ethers";
import { CHAINS } from "./config/chains.js";
import { providers } from "./lib/providers.js";
import { getChainBalancesMulticall } from "./lib/multicall.js";

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/api/balances", express.json(), async (req, res) => {
  const addresses: string[] = (req.body.addresses ?? []).filter((addr: string) => ethers.isAddress(addr));

  if (addresses.length === 0) {
    res.status(400).json({error: "No valid addresses"});
    return;
  }

  const chainResults = await Promise.all(
    Object.entries(CHAINS).map(async ([chainKey, chainConfig]) => {
      try {
        const balances = await getChainBalancesMulticall(providers[chainKey], chainConfig, addresses);
        return {chainConfig, balances, error: null};
      } catch {
        return {chainConfig, balances: null, error: "Failed to fetch"};
      }
    })
  );

  const results = addresses.map((address, addrIndex) => {
    const balances = chainResults.map(({chainConfig, balances, error}) => {
      if (error) return {name: chainConfig.name, error};
      const bal = balances![addrIndex];
      return {name: chainConfig.name, native: {symbol: chainConfig.nativeCurrency, balance: bal.native}, usdc: bal.usdc, zro: bal.zro};
    });
    return {address, balances};
  });

  res.json(results);
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});