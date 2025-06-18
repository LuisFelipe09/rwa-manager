// src/components/cross-chain/DeployPoolsStep.tsx
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface DeployPoolsStepProps {
  tokenAddresses: { fuji: string; arbitrum: string };
  onDeploy: (address: string, network: string) => void;
  currentNetwork?: number;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function DeployPoolsStep({
  tokenAddresses,
  onDeploy,
  currentNetwork,
  setLoadingManager,
  setAction,
}: DeployPoolsStepProps) {
  const getTokenAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return tokenAddresses.fuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return tokenAddresses.arbitrum;
    return "";
  };

  const { writeContractAsync: deployTokenPool } = useScaffoldWriteContract({
    contractName: "BurnMintTokenPool",
  });

  const handleDeploy = async (networkId: number) => {
    const tokenAddress = networkId === NETWORKS.avalancheFuji.id ? tokenAddresses.fuji : tokenAddresses.arbitrum;

    if (!tokenAddress) {
      alert("Primero debes implementar el token en esta red");
      return;
    }

    setLoadingManager(true);
    setAction(
      `Implementando pool en ${networkId === NETWORKS.avalancheFuji.id ? "Avalanche Fuji" : "Arbitrum Sepolia"}`,
    );
    try {
      const txnReceipt = await deployTokenPool({
        functionName: "deploy",
        args: [
          getTokenAddress(),
          "0xE0dF6b5a9eA0D5E8B0c6568A0e6f3537bB0D0d0d", // Dirección del proxy ARM
        ],
      });

      if (txnReceipt) {
        const poolAddress = txnReceipt;
        const network = currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum";
        onDeploy(poolAddress, network);
      }
      setLoadingManager(false);
    } catch (error) {
      console.error(error);
      setLoadingManager(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Paso 2: Implementar Pools de Tokens</h2>
      <p className="mb-6 text-gray-600">
        Implementa pools de tokens en cada red. Estos pools manejarán las operaciones de mint y burn para transferencias
        cross-chain.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 p-6 rounded-xl border border-primary">
          <div className="flex items-center mb-4">
            <div className="bg-avalanche w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Avalanche Fuji</h3>
          </div>
          <p className="text-sm mb-4 truncate">Token: {tokenAddresses.fuji || "No implementado"}</p>
          <button
            className="btn btn-primary w-full"
            disabled={!tokenAddresses.fuji}
            onClick={() => handleDeploy(NETWORKS.avalancheFuji.id)}
          >
            {tokenAddresses.fuji ? "Implementar Pool" : "Implementa Token Primero"}
          </button>
        </div>

        <div className="bg-base-100 p-6 rounded-xl border border-secondary">
          <div className="flex items-center mb-4">
            <div className="bg-arbitrum w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Arbitrum Sepolia</h3>
          </div>
          <p className="text-sm mb-4 truncate">Token: {tokenAddresses.arbitrum || "No implementado"}</p>
          <button
            className="btn btn-secondary w-full"
            disabled={!tokenAddresses.arbitrum}
            onClick={() => handleDeploy(NETWORKS.arbitrumSepolia.id)}
          >
            {tokenAddresses.arbitrum ? "Implementar Pool" : "Implementa Token Primero"}
          </button>
        </div>
      </div>
    </div>
  );
}
