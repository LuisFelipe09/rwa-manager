// src/components/cross-chain/ClaimRolesStep.tsx
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface ClaimRolesStepProps {
  tokenAddresses: { fuji: string; arbitrum: string };
  poolAddresses: { fuji: string; arbitrum: string };
  currentNetwork?: number;
  onComplete: () => void;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function ClaimRolesStep({
  tokenAddresses,
  poolAddresses,
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: ClaimRolesStepProps) {
  console.log("tokenAddresses:", tokenAddresses);
  const getPoolAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return poolAddresses.fuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return poolAddresses.arbitrum;
    return "";
  };

  const { writeContractAsync: grantRoles } = useScaffoldWriteContract({
    contractName: "BurnMintERC20",
  });

  const handleClaimRoles = async (networkId: number) => {
    const poolAddress = networkId === NETWORKS.avalancheFuji.id ? poolAddresses.fuji : poolAddresses.arbitrum;

    if (!poolAddress) {
      alert("Primero debes implementar el pool en esta red");
      return;
    }

    setLoadingManager(true);
    setAction(`Reclamando roles en ${networkId === NETWORKS.avalancheFuji.id ? "Avalanche Fuji" : "Arbitrum Sepolia"}`);
    try {
      await grantRoles({
        functionName: "grantMintAndBurnRoles",
        args: [getPoolAddress()],
      });
      setLoadingManager(false);
      onComplete();
    } catch (error) {
      console.error(error);
      setLoadingManager(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Paso 3: Reclamar Roles de Mint y Burn</h2>
      <p className="mb-6 text-gray-600">
        Otorga permisos a los pools para que puedan mintear y quemar tokens durante las transferencias cross-chain.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 p-6 rounded-xl border border-primary">
          <div className="flex items-center mb-4">
            <div className="bg-avalanche w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Avalanche Fuji</h3>
          </div>
          <p className="text-sm mb-4 truncate">Pool: {poolAddresses.fuji || "No implementado"}</p>
          <button
            className="btn btn-primary w-full"
            disabled={!poolAddresses.fuji}
            onClick={() => handleClaimRoles(NETWORKS.avalancheFuji.id)}
          >
            Reclamar Roles
          </button>
        </div>

        <div className="bg-base-100 p-6 rounded-xl border border-secondary">
          <div className="flex items-center mb-4">
            <div className="bg-arbitrum w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Arbitrum Sepolia</h3>
          </div>
          <p className="text-sm mb-4 truncate">Pool: {poolAddresses.arbitrum || "No implementado"}</p>
          <button
            className="btn btn-secondary w-full"
            disabled={!poolAddresses.arbitrum}
            onClick={() => handleClaimRoles(NETWORKS.arbitrumSepolia.id)}
          >
            Reclamar Roles
          </button>
        </div>
      </div>
    </div>
  );
}
