import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "~~/../hardhat/artifacts/@chainlink/contracts-ccip/contracts/tokenAdminRegistry/RegistryModuleOwnerCustom.sol/RegistryModuleOwnerCustom.json";
import { useTransactor } from "~~/hooks/scaffold-eth";
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
  const { chain } = useAccount();
  const [isFuji, setIsFuji] = useState(false);
  const [isArbitrum, setIsArbitrum] = useState(false);
  const [roleClaimed, setRoleClaimed] = useState({ fuji: false, arbitrum: false });

  useEffect(() => {
    console.log(isFuji, chain?.id);
    setIsFuji(chain?.id === NETWORKS.avalancheFuji.id);
    setIsArbitrum(chain?.id === NETWORKS.arbitrumSepolia.id);
  }, [chain?.id]);

  const getTokenAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return tokenAddresses.fuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return tokenAddresses.arbitrum;
    return "";
  };

  const getregistryModuleOwnerCustom = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return NETWORKS.avalancheFuji.registryModuleOwnerCustom;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return NETWORKS.arbitrumSepolia.registryModuleOwnerCustom;
    return "";
  };

  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: getregistryModuleOwnerCustom(),
      abi: abi,
      functionName: "registerAdminViaGetCCIPAdmin",
      args: [getTokenAddress()],
    });

  const writeTx = useTransactor();

  const handleClaimRoles = async () => {
    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 2 });

      const deployNetwork = currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum";
      setRoleClaimed(prev => ({ ...prev, [deployNetwork]: true }));
      setAction(`Reclamando roles de ${deployNetwork === "fuji" ? "Avalanche Fuji" : "Arbitrum Sepolia"}...`);
      setLoadingManager(false);
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
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
          <button className="btn btn-primary w-full" disabled={!isFuji || isPending} onClick={() => handleClaimRoles()}>
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
            disabled={!isArbitrum || isPending}
            onClick={() => handleClaimRoles()}
          >
            Reclamar Roles
          </button>
        </div>
      </div>
      <button
        className="btn btn-success mt-8"
        onClick={onComplete}
        disabled={!(roleClaimed.fuji && roleClaimed.arbitrum)}
      >
        Next
      </button>
    </div>
  );
}
