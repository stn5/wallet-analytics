import { useState } from "react";

export default function App() {
  const [address, setAddress] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchBalances() {
    const addresses = address.split("\n").map((a) => a.trim()).filter(Boolean);
    if (!addresses) return;

    setLoading(true);
    setResults([]);

    const data = await Promise.all(
      addresses.map((addr) =>
        fetch(`http://localhost:3000/api/balances/${addr}`)
          .then((r) => r.json())
          .catch(() => ({address: addr, error: "Failed to fetch"}))
      )
    );

    setResults(data);
    setLoading(false);
  }

  return (
    <div>
      <h1>Wallet Analytics</h1>
      <div>
        <textarea
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
        <button onClick={fetchBalances} disabled={loading}>
          Check balances
        </button>
      </div>

      {results.map((res: any) => (
        <div key={res.address}>
          <h2>{res.address}</h2>
          {res.error ? (
            <p>Error: {res.error}</p>
          ) : (
            <div>
              {res.balances.map((chain: any) => (
                <div key={chain.name}>
                  <h3>{chain.name}</h3>
                  {chain.error ? (
                    <p>Failed to fetch</p>
                  ) : (
                    <ul>
                      <li>{chain.native.symbol}: {chain.native.balance ?? "-"}</li>
                      <li>USDC: {chain.usdc ?? "-"}</li>
                      <li>ZRO: {chain.zro ?? "-"}</li>
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
