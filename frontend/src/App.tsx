import { useState } from "react";

export default function App() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBalances() {
    const trimmed = address.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`http://localhost:3000/api/balances/${trimmed}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Wallet Analytics</h1>
      <div>
        <input
          type="text"
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchBalances()}
        />
        <button onClick={fetchBalances} disabled={loading}>
          Check balances
        </button>
      </div>

      {error && <p>Error: {error}</p>}

      {data && (
        <div>
          {data.balances.map((chain: any) => (
            
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
  );
}
