import { useState } from "react";
import { useWriteContract } from "wagmi";
import { abi } from "~~/../hardhat/artifacts/@chainlink/contracts-ccip/contracts/tokenAdminRegistry/tokenAdminRegistry.sol/tokenAdminRegistry.json";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

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
  const [error, setError] = useState<string | null>(null);
  const [linkPool, setLinkPool] = useState({ fuji: false, arbitrum: false });

  const getTokenAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return tokenAddresses.fuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return tokenAddresses.arbitrum;
    return "";
  };

  const getPoolAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return poolAddresses.fuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return poolAddresses.arbitrum;
    return "";
  };

  const getTokenAdminRegistryAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return NETWORKS.avalancheFuji.tokenAdminRegistry;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return NETWORKS.arbitrumSepolia.tokenAdminRegistry;
    return "";
  };

  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: getTokenAdminRegistryAddress(),
      abi: abi,
      functionName: "setPool",
      args: [getTokenAddress(), getPoolAddress()],
    });

  const writeTx = useTransactor();

  const handleLink = async () => {
    setError(null);

    try {
      setAction("Asociando token y pool...");

      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 2 });

      const deployNetwork = currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum";
      setLinkPool(prev => ({ ...prev, [deployNetwork]: true }));

      setAction("");
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
      <button className="btn btn-primary mt-4" onClick={handleLink} disabled={isPending}>
        Link Tokens and Pools
      </button>
      {error && <p className="text-error mt-2">{error}</p>}
      <button className="btn btn-success mt-8" onClick={onComplete} disabled={!(linkPool.fuji && linkPool.arbitrum)}>
        Next
      </button>
    </div>
  );
}
