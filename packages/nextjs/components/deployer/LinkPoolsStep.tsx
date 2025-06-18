import { useState } from "react";
import { useWriteContract } from "wagmi";
import { TOKEN_ADMIN_REGISTRY_ABI, TOKEN_ADMIN_REGISTRY_ADDRESSES } from "~~/utils/ccip/config";

interface Props {
  tokenAddresses: { fuji: string; arbitrum: string };
  poolAddresses: { fuji: string; arbitrum: string };
  currentNetwork: number | undefined;
  onComplete: () => void;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function LinkPoolsStep({
  tokenAddresses,
  poolAddresses,
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: Props) {
  console.log("currentNetwork:", currentNetwork);
  const [error, setError] = useState<string | null>(null);
  const { writeContract } = useWriteContract();

  const handleLink = async () => {
    setLoadingManager(true);
    setError(null);

    try {
      setAction("Asociando token y pool en Avalanche Fuji...");
      await writeContract(
        {
          address: TOKEN_ADMIN_REGISTRY_ADDRESSES.fuji,
          abi: TOKEN_ADMIN_REGISTRY_ABI,
          functionName: "setPool",
          args: [tokenAddresses.fuji, poolAddresses.fuji],
        },
        {},
      );

      setAction("Asociando token y pool en Arbitrum Sepolia...");
      await writeContract(
        {
          address: TOKEN_ADMIN_REGISTRY_ADDRESSES.arbitrum,
          abi: TOKEN_ADMIN_REGISTRY_ABI,
          functionName: "setPool",
          args: [tokenAddresses.arbitrum, poolAddresses.arbitrum],
        },
        {},
      );

      setAction("");
      onComplete();
    } catch (e: any) {
      setError(e.message || "Error al asociar tokens y pools");
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Link Tokens to Pools</h2>
      <p>This will link each token to its corresponding pool on both networks.</p>
      <button className="btn btn-primary mt-4" onClick={handleLink}>
        Link Tokens and Pools
      </button>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}
