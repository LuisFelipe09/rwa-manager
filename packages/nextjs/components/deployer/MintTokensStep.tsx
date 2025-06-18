import { useState } from "react";
import { useWriteContract } from "wagmi";
import { TOKEN_ABI } from "~~/utils/ccip/config";

// Asegúrate de tener el ABI correcto

interface Props {
  tokenAddresses: { fuji: string; arbitrum: string };
  userAddress: string;
  currentNetwork: number | undefined;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function MintTokensStep({
  tokenAddresses,
  userAddress,
  currentNetwork,
  setLoadingManager,
  setAction,
}: Props) {
  console.log("currentNetwork:", currentNetwork);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("1000");
  const { writeContract } = useWriteContract();

  const handleMint = async () => {
    setLoadingManager(true);
    setError(null);

    try {
      setAction("Minting tokens on Avalanche Fuji...");
      await writeContract({
        address: tokenAddresses.fuji,
        abi: TOKEN_ABI,
        functionName: "mint",
        args: [userAddress, amount],
      });

      setAction("Tokens minted successfully!");
    } catch (e: any) {
      setError(e.message || "Error minting tokens");
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mint Tokens</h2>
      <p>This will mint tokens on Avalanche Fuji to your address for cross-chain testing.</p>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="number"
          className="input input-bordered"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min={1}
        />
        <button className="btn btn-primary" onClick={handleMint}>
          Mint
        </button>
      </div>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}
