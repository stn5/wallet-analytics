import { Contract, Interface, JsonRpcProvider, ethers } from "ethers";
import { ChainConfig } from "../config/chains.js";

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[])",
  "function getEthBalance(address addr) view returns (uint256 balance)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const multicall3Interface = new Interface(MULTICALL3_ABI);
const erc20Interface = new Interface(ERC20_ABI);

type Call = {target: string; allowFailure: boolean; callData: string};
type Aggregate3Response = {success: boolean; returnData: string};

function buildTokenCalls(tokenAddress: string, addresses: string[]): Call[] {
  const balanceCalls = addresses.map(addr => ({
    target: tokenAddress,
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData("balanceOf", [addr])
  }));
  const decimalsCall = {
    target: tokenAddress,
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData("decimals", [])
  };
  // return balanceCalls.concat(decimalsCall);
  return [...balanceCalls, decimalsCall];
}

function decodeTokenBlock(results: Aggregate3Response[], fallbackDecimals: number): number[] {
  const decimalsResult = results[results.length - 1];
  const decimals = decimalsResult.success ? Number(erc20Interface.decodeFunctionResult("decimals", decimalsResult.returnData)[0]) : fallbackDecimals;

  return results.slice(0, -1).map(({success, returnData}) => {
    if (!success || returnData === "0x") return 0;
    const rawBalance = erc20Interface.decodeFunctionResult("balanceOf", returnData)[0] as bigint;
    return +ethers.formatUnits(rawBalance, decimals);
  });
}

async function fetchTokenBalances(multicall: Contract, tokenAddress: string | null, addresses: string[], fallbackDecimals: number): Promise<(number | null)[]> {
  if (!tokenAddress) return Array(addresses.length).fill(null);
  const results: Aggregate3Response[] = await multicall.aggregate3.staticCall(buildTokenCalls(tokenAddress, addresses));
  return decodeTokenBlock(results, fallbackDecimals);
}

export async function getChainBalancesMulticall(provider: JsonRpcProvider, chain: ChainConfig, addresses: string[]): Promise<Array<{native: number; usdc: number | null; zro: number | null}>> {
  const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);

  const nativeCalls: Call[] = addresses.map(addr => ({
    target: MULTICALL3_ADDRESS,
    allowFailure: false,
    callData: multicall3Interface.encodeFunctionData("getEthBalance", [addr])
  }));

  const [nativeResults, usdcBalances, zroBalances] = await Promise.all([
    multicall.aggregate3.staticCall(nativeCalls),
    fetchTokenBalances(multicall, chain.usdc_contract, addresses, 6),
    fetchTokenBalances(multicall, chain.zro_contract,  addresses, 18)
  ]);

  const nativeBalances = (nativeResults as Aggregate3Response[]).map(({returnData}) =>
    +ethers.formatEther(multicall3Interface.decodeFunctionResult("getEthBalance", returnData)[0])
  );

  return addresses.map((_, i) => ({
    native: nativeBalances[i],
    usdc: usdcBalances[i],
    zro: zroBalances[i]
  }));
}
