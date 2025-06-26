"use client";
import {
  Bell,
  Copy,
  Plus,
  Send,
  LayoutGrid,
  ArrowDown,
  Home,
  ArrowUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WalletPage = () => {
  const router = useRouter();
  const [arPrice, setArPrice] = useState<number | null>(null);
  const [arPriceChange, setArPriceChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate user holdings for AR (replace with real data if available)
  const arAmount = 9999999; // TODO: Replace with real user AR amount

  useEffect(() => {
    async function fetchARPrice() {
      setLoading(true);
      setError(null);
      try {
        // Using CoinGecko API for AR price
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd&include_24hr_change=true",
        );
        const data = await res.json();
        setArPrice(data.arweave.usd);
        setArPriceChange(data.arweave.usd_24h_change);
      } catch (err) {
        console.error("Error fetching AR price:", err);
        setError("Failed to fetch AR price");
      } finally {
        setLoading(false);
      }
    }
    fetchARPrice();
    // Optionally, refresh price every 60 seconds
    const interval = setInterval(fetchARPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const assets = [
    {
      name: "AR",
      price: arPrice !== null ? arPrice.toFixed(2) : "...",
      amount: arAmount.toString(),
      value: arPrice !== null ? (arAmount * arPrice).toFixed(2) : "...",
      icon: "/ar-icon.png",
    },
    {
      name: "OPAQ",
      price: "14.18",
      amount: "0",
      value: "0.00",
      icon: "/ao-icon.png",
    },
  ];

  // Calculate total wallet value (only AR for now)
  const totalValue = arPrice !== null ? (arAmount * arPrice).toFixed(2) : "...";

  const priceChange = arPriceChange ?? 0;
  const isPositiveChange = priceChange >= 0;
  const changeColor = isPositiveChange ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-black text-white min-h-screen font-sans flex flex-col max-w-md mx-auto">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-700"></div>
          <div>
            <span className="text-sm">bluedfox</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">fOI1...YPPk</span>
              <Copy size={12} className="text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell size={24} />
        </div>
      </header>

      <main className="flex-grow px-4">
        <div className="text-center my-4">
          <h1 className="text-5xl font-bold">${totalValue}</h1>
          {arPriceChange !== null ? (
            <p className={`${changeColor} flex items-center justify-center`}>
              {priceChange.toFixed(2)}%
              {isPositiveChange ? (
                <ArrowUp size={16} className="ml-1" />
              ) : (
                <ArrowDown size={16} className="ml-1" />
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-400">...</p>
          )}
          {loading && (
            <p className="text-xs text-gray-400">Fetching AR price...</p>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex justify-around my-6">
          <div className="text-center">
            <button className="bg-blue-600 rounded-full p-4">
              <Send size={24} />
            </button>
            <p className="mt-2 text-sm">Send</p>
          </div>
          <div className="text-center">
            <button className="bg-blue-600 rounded-full p-4">
              <Send size={24} className="transform -rotate-90" />
            </button>
            <p className="mt-2 text-sm">Receive</p>
          </div>
          <div className="text-center">
            <button
              onClick={() => router.push("/wallet/market")}
              className="bg-blue-600 rounded-full p-4"
            >
              <Plus size={24} />
            </button>
            <p className="mt-2 text-sm">Buy</p>
          </div>
        </div>

        <div className="flex justify-start space-x-6 border-b border-gray-700 mb-4">
          <button className="py-2 border-b-2 border-blue-500 font-semibold">
            Assets
          </button>

          <button className="py-2 text-gray-400">Activity</button>
        </div>

        <div>
          {assets.map((asset) => (
            <div
              key={asset.name}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-lg">
                  {asset.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold">{asset.name}</p>
                  <p className="text-sm text-gray-400">${asset.price}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{asset.amount}</p>
                <p className="text-sm text-gray-400">${asset.value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-black border-t border-gray-800 p-4 flex justify-around">
        <button className="text-center text-blue-500">
          <Home size={24} className="mx-auto" />
          <span className="text-xs">Home</span>
        </button>

        <button className="text-center text-gray-400">
          <LayoutGrid size={24} className="mx-auto" />
          <span className="text-xs">Market</span>
        </button>
      </footer>
    </div>
  );
};

export default WalletPage;
