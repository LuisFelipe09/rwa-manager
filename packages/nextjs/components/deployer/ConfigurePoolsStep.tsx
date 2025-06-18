import { useState } from "react";
// Asegúrate de tener el ABI correcto
import { useWriteContract } from "wagmi";
import { POOL_ABI } from "~~/utils/ccip/config";

interface Props {
  poolAddresses: { fuji: string; arbitrum: string };
  currentNetwork: number | undefined;
  onComplete: () => void;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function ConfigurePoolsStep({
  poolAddresses,
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: Props) {
  console.log("currentNetwork:", currentNetwork);
  const [error, setError] = useState<string | null>(null);
  const { writeContract } = useWriteContract();

  // Define tus parámetros de configuración aquí
  const chainUpdates = {
    rateLimit: 1000, // ejemplo
    enabledChains: [
      /* IDs de chains permitidas */
    ],
  };

  const handleConfigure = async () => {
    setLoadingManager(true);
    setError(null);

    try {
      setAction("Configuring pool on Avalanche Fuji...");
      await writeContract({
        address: poolAddresses.fuji,
        abi: POOL_ABI,
        functionName: "applyChainUpdates",
        args: [chainUpdates.rateLimit, chainUpdates.enabledChains],
      });

      setAction("Configuring pool on Arbitrum Sepolia...");
      await writeContract({
        address: poolAddresses.arbitrum,
        abi: POOL_ABI,
        functionName: "applyChainUpdates",
        args: [chainUpdates.rateLimit, chainUpdates.enabledChains],
      });

      setAction("");
      onComplete();
    } catch (e: any) {
      setError(e.message || "Error configuring pools");
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Configure Token Pools</h2>
      <p>This will configure each pool with cross-chain transfer parameters.</p>
      <button className="btn btn-primary mt-4" onClick={handleConfigure}>
        Configure Pools
      </button>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}
