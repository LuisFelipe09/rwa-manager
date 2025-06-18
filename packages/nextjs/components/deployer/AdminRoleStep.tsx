// src/components/cross-chain/AdminRoleStep.tsx
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface AdminRoleStepProps {
  currentNetwork?: number;
  onComplete: () => void;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function AdminRoleStep({
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: AdminRoleStepProps) {
  const getNetworkConfig = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return NETWORKS.avalancheFuji;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return NETWORKS.arbitrumSepolia;
    return null;
  };

  const { writeContractAsync: registerAdmin } = useScaffoldWriteContract({
    contractName: "RegistryModuleOwnerCustom",
  });
  const { writeContractAsync: acceptAdmin } = useScaffoldWriteContract({
    contractName: "TokenAdminRegistry",
  });

  const handleClaimAdminRole = async (networkId: number) => {
    setLoadingManager(true);
    setAction(
      `Registrando rol de administrador en ${networkId === NETWORKS.avalancheFuji.id ? "Avalanche Fuji" : "Arbitrum Sepolia"}`,
    );
    try {
      await registerAdmin({
        functionName: "registerAdminViaOwner",
        address: getNetworkConfig()?.registryModule,
        args: [getNetworkConfig()?.tokenAdminRegistry],
      });

      setAction("Aceptando rol de administrador...");
      await acceptAdmin({
        functionName: "acceptAdminRole",
        address: getNetworkConfig()?.tokenAdminRegistry,
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
          <button className="btn btn-primary w-full" onClick={() => handleClaimAdminRole(NETWORKS.avalancheFuji.id)}>
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
            onClick={() => handleClaimAdminRole(NETWORKS.arbitrumSepolia.id)}
          >
            Reclamar Rol Admin
          </button>
        </div>
      </div>
    </div>
  );
}
