import { useState } from "react";

function formatBalance(value: number) {
  if (!value) return "—";
  return value.toFixed(2).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function summarize(balances: any[]) {
  return {
    eth: balances.filter(chain => chain.native?.symbol === "ETH").reduce((sum, chain) => sum + (chain.native?.balance ?? 0), 0),
    bnb: balances.find(chain => chain.native?.symbol === "BNB")?.native?.balance ?? 0,
    avax: balances.find(chain => chain.native?.symbol === "AVAX")?.native?.balance ?? 0,
    pol: balances.find(chain => chain.native?.symbol === "POL")?.native?.balance ?? 0,
    usdc: balances.reduce((sum, chain) => sum + (chain.usdc ?? 0), 0),
    zro: balances.reduce((sum, chain) => sum + (chain.zro ?? 0), 0)
  };
}

export default function App() {
  const [address, setAddress] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchBalances() {
    const addresses = address.split("\n").map(a => a.trim()).filter(Boolean);
    if (!addresses.length) return;

    setLoading(true);
    setResults([]);

    const data = await fetch("http://localhost:3000/api/balances", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({addresses})
    }).then(res => res.json()).catch(() => []);

    setResults(data);
    setLoading(false);
  }

  return (
    <div className="app">
      <h1>Wallet Analytics</h1>

      <div className="controls">
        <textarea
          placeholder="0x..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          rows={4}
        />
        <button onClick={fetchBalances} disabled={loading}>
          Check balances
        </button>
      </div>

      {results.length > 0 && (
        <div className="table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>ETH</th>
                <th>BNB</th>
                <th>AVAX</th>
                <th>POL</th>
                <th>USDC</th>
                <th>ZRO</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, i) => {
                if (res.error) return (
                  <tr key={res.address} className="row-error">
                    <td>{i + 1}</td>
                    <td className="addr">{res.address}</td>
                    <td colSpan={6}>Error</td>
                  </tr>
                );
                const tokens = summarize(res.balances);
                return (
                  <tr key={res.address}>
                    <td className="num">{i + 1}</td>
                    <td className="addr">{res.address}</td>
                    <td>{formatBalance(tokens.eth)}</td>
                    <td>{formatBalance(tokens.bnb)}</td>
                    <td>{formatBalance(tokens.avax)}</td>
                    <td>{formatBalance(tokens.pol)}</td>
                    <td>{formatBalance(tokens.usdc)}</td>
                    <td>{formatBalance(tokens.zro)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
