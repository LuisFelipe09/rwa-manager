// src/components/cross-chain/DeployPoolsStep.tsx
import { useEffect, useState } from "react";
import { useAccount, useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import {
  abi,
  bytecode,
} from "~~/../hardhat/artifacts/@chainlink/contracts-ccip/contracts/pools/BurnMintTokenPool.sol/BurnMintTokenPool.json";
import { NETWORKS } from "~~/utils/ccip/config";

interface DeployPoolsStepProps {
  tokenAddresses: { fuji: string; arbitrum: string };
  onDeploy: (address: string, network: string) => void;
  currentNetwork?: number;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
  onNextStep: () => void;
}

export default function DeployPoolsStep({
  tokenAddresses,
  onDeploy,
  currentNetwork,
  setLoadingManager,
  setAction,
  onNextStep,
}: DeployPoolsStepProps) {
  const [tokenDeployed, setTokenDeployed] = useState({ fuji: false, arbitrum: false });
  const localTokenDecimals = 18; // Decimales del token, puedes ajustarlo según tu implementación
  // Lógica para saber en qué red estamos
  const [isFuji, setIsFuji] = useState(false);
  const [isArbitrum, setIsArbitrum] = useState(false);
  const { chain } = useAccount();
  // Hook de wagmi para preparar y ejecutar el despliegue

  const {
    data: hash, // El hash de la transacción de despliegue
    deployContract, // La función que llamaremos para desplegar
  } = useDeployContract();

  // Hook de wagmi para esperar la confirmación de la tx y obtener el recibo
  const {
    data,
    isSuccess: isConfirmed, // true una vez que la tx se confirma
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    console.log(isFuji, chain?.id);
    setIsFuji(chain?.id === NETWORKS.avalancheFuji.id);
    setIsArbitrum(chain?.id === NETWORKS.arbitrumSepolia.id);
  }, [chain?.id]);

  useEffect(() => {
    if (isConfirmed && data?.contractAddress) {
      const deployNetwork = currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum";
      setTokenDeployed(prev => ({ ...prev, [deployNetwork]: true }));
      console.log("Contract deployed at:", data.contractAddress);
      onDeploy(data.contractAddress, deployNetwork);
      setLoadingManager(false);
      setAction("");
    }
  }, [isConfirmed, data]);

  const handleDeploy = async (networkId: number) => {
    const tokenAddress = networkId === NETWORKS.avalancheFuji.id ? tokenAddresses.fuji : tokenAddresses.arbitrum;

    if (!tokenAddress) {
      alert("Primero debes implementar el token en esta red");
      return;
    }

    // Helper to get network config by id
    const getNetworkConfig = (id: number) => {
      if (id === NETWORKS.avalancheFuji.id) return NETWORKS.avalancheFuji;
      if (id === NETWORKS.arbitrumSepolia.id) return NETWORKS.arbitrumSepolia;
      throw new Error("Red no soportada");
    };

    setAction(
      `Implementando pool en ${networkId === NETWORKS.avalancheFuji.id ? "Avalanche Fuji" : "Arbitrum Sepolia"}`,
    );
    try {
      const { rmnProxy, router } = getNetworkConfig(networkId);
      deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [
          tokenAddress,
          localTokenDecimals,
          [], // Allowlist (empty array)
          rmnProxy,
          router,
        ],
      });
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
            disabled={!isFuji}
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
            disabled={!isArbitrum}
            onClick={() => handleDeploy(NETWORKS.arbitrumSepolia.id)}
          >
            {tokenAddresses.arbitrum ? "Implementar Pool" : "Implementa Token Primero"}
          </button>
        </div>
      </div>
      <button
        className="btn btn-success mt-8"
        onClick={onNextStep}
        disabled={!(tokenDeployed.fuji && tokenDeployed.arbitrum)}
      >
        Next
      </button>
    </div>
  );
}
