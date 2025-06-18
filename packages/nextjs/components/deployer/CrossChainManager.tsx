// src/components/cross-chain/CrossChainManager.tsx
import { useState } from "react";
import AdminRoleStep from "./AdminRoleStep";
import ClaimRolesStep from "./ClaimRolesStep";
import ConfigurePoolsStep from "./ConfigurePoolsStep";
import DeployPoolsStep from "./DeployPoolsStep";
import DeployTokensStep from "./DeployTokensStep";
import LinkPoolsStep from "./LinkPoolsStep";
import MintTokensStep from "./MintTokensStep";
import StepIndicator from "./StepIndicator";
import { useAccount } from "wagmi";

export default function CrossChainManager() {
  const { address, chain } = useAccount();

  const [activeStep, setActiveStep] = useState(1);
  const [tokenAddresses, setTokenAddresses] = useState({ fuji: "", arbitrum: "" });
  const [poolAddresses, setPoolAddresses] = useState({ fuji: "", arbitrum: "" });
  const [loadingManager, setLoadingManager] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  const handleDeployToken = (address: string, network: string) => {
    if (network === "fuji") {
      setTokenAddresses(prev => ({ ...prev, fuji: address }));
    } else {
      setTokenAddresses(prev => ({ ...prev, arbitrum: address }));
    }
    setActiveStep(2);
  };

  const handleDeployPool = (address: string, network: string) => {
    if (network === "fuji") {
      setPoolAddresses(prev => ({ ...prev, fuji: address }));
    } else {
      setPoolAddresses(prev => ({ ...prev, arbitrum: address }));
    }
    setActiveStep(3);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <DeployTokensStep
            onDeploy={handleDeployToken}
            currentNetwork={chain?.id}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 2:
        return (
          <DeployPoolsStep
            tokenAddresses={tokenAddresses}
            onDeploy={handleDeployPool}
            currentNetwork={chain?.id}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 3:
        return (
          <ClaimRolesStep
            poolAddresses={poolAddresses}
            tokenAddresses={tokenAddresses}
            currentNetwork={chain?.id}
            onComplete={() => setActiveStep(4)}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 4:
        return (
          <AdminRoleStep
            currentNetwork={chain?.id}
            onComplete={() => setActiveStep(5)}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 5:
        return (
          <LinkPoolsStep
            tokenAddresses={tokenAddresses}
            poolAddresses={poolAddresses}
            currentNetwork={chain?.id}
            onComplete={() => setActiveStep(6)}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 6:
        return (
          <ConfigurePoolsStep
            currentNetwork={chain?.id}
            poolAddresses={poolAddresses}
            onComplete={() => setActiveStep(7)}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      case 7:
        return (
          <MintTokensStep
            tokenAddresses={tokenAddresses}
            userAddress={address || ""}
            currentNetwork={chain?.id}
            setLoadingManager={setLoadingManager}
            setAction={setCurrentAction}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gestión de Tokens Cross-Chain</h1>
        <p className="text-gray-500 mt-2">
          Implementación y configuración de tokens para transferencias entre Avalanche Fuji y Arbitrum Sepolia
        </p>
      </div>

      <StepIndicator
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        tokenAddresses={tokenAddresses}
        poolAddresses={poolAddresses}
      />

      <div className="bg-base-200 p-6 rounded-xl mt-6">
        {loadingManager ? (
          <div className="flex flex-col items-center py-10">
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <p className="text-lg font-medium">{currentAction}</p>
            <p className="text-gray-500 mt-2">Por favor confirma la transacción en tu wallet...</p>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>

      <div className="mt-6 bg-base-200 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-2">Estado Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-base-100 p-3 rounded-lg">
            <h4 className="font-medium">Avalanche Fuji</h4>
            <p className="text-sm truncate">Token: {tokenAddresses.fuji || "No implementado"}</p>
            <p className="text-sm truncate">Pool: {poolAddresses.fuji || "No implementado"}</p>
          </div>
          <div className="bg-base-100 p-3 rounded-lg">
            <h4 className="font-medium">Arbitrum Sepolia</h4>
            <p className="text-sm truncate">Token: {tokenAddresses.arbitrum || "No implementado"}</p>
            <p className="text-sm truncate">Pool: {poolAddresses.arbitrum || "No implementado"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
