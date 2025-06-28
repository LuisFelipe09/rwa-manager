import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "~~/../hardhat/artifacts/@chainlink/contracts-ccip/contracts/tokenAdminRegistry/tokenAdminRegistry.sol/tokenAdminRegistry.json";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface AdminRoleStepProps {
  tokenAddresses: { fuji: string; arbitrum: string };
  currentNetwork?: number;
  onComplete: () => void;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function AdminRoleStep({
  tokenAddresses,
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: AdminRoleStepProps) {
  const { chain } = useAccount();
  const [isFuji, setIsFuji] = useState(false);
  const [isArbitrum, setIsArbitrum] = useState(false);
  const [adminRole, setAdminRole] = useState({ fuji: false, arbitrum: false });

  useEffect(() => {
    console.log(isFuji, chain?.id);
    setIsFuji(chain?.id === NETWORKS.avalancheFuji.id);
    setIsArbitrum(chain?.id === NETWORKS.arbitrumSepolia.id);
  }, [chain?.id]);

  const getTokenAddress = () => {
    if (chain?.id === NETWORKS.avalancheFuji.id) return tokenAddresses.fuji;
    if (chain?.id === NETWORKS.arbitrumSepolia.id) return tokenAddresses.arbitrum;
    return "";
  };

  const getTokenAdminRegistryAddress = () => {
    if (chain?.id === NETWORKS.avalancheFuji.id) return NETWORKS.avalancheFuji.tokenAdminRegistry;
    if (chain?.id === NETWORKS.arbitrumSepolia.id) return NETWORKS.arbitrumSepolia.tokenAdminRegistry;
    return "";
  };

  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: getTokenAdminRegistryAddress(),
      abi: abi,
      functionName: "acceptAdminRole",
      args: [getTokenAddress()],
    });

  const writeTx = useTransactor();

  const handleClaimAdminRole = async () => {
    try {
      setAction("Aceptando rol de administrador...");

      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 2 });
      const deployNetwork = currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum";
      setAdminRole(prev => ({ ...prev, [deployNetwork]: true }));

      setLoadingManager(false);
    } catch (error) {
      console.error(error);
      setLoadingManager(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Paso 4: Reclamar y Aceptar Rol de Administrador</h2>
      <div className="prose mb-6 text-left mx-auto">
        <p className="text-gray-600">Este es un proceso de dos pasos necesario para habilitar tu token en CCIP:</p>
        <ol className="list-decimal pl-6 text-left">
          <li className="mb-2">Registrar tu EOA como administrador del token</li>
          <li>Aceptar el rol de administrador</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 p-6 rounded-xl border border-primary">
          <div className="flex items-center mb-4">
            <div className="bg-avalanche w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Avalanche Fuji</h3>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => handleClaimAdminRole()}
            disabled={!isFuji || isPending}
          >
            Reclamar Rol Admin
          </button>
        </div>

        <div className="bg-base-100 p-6 rounded-xl border border-secondary">
          <div className="flex items-center mb-4">
            <div className="bg-arbitrum w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Arbitrum Sepolia</h3>
          </div>
          <button
            className="btn btn-secondary w-full"
            onClick={() => handleClaimAdminRole()}
            disabled={!isArbitrum || isPending}
          >
            Reclamar Rol Admin
          </button>
        </div>
      </div>
      <button className="btn btn-success mt-8" onClick={onComplete} disabled={!(adminRole.fuji && adminRole.arbitrum)}>
        Next
      </button>
    </div>
  );
}
