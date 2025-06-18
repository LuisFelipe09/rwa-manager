// src/components/cross-chain/DeployTokensStep.tsx
import { useEffect, useState } from "react";
import { useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import {
  abi,
  bytecode,
} from "~~/../hardhat/artifacts/@chainlink/contracts/src/v0.8/shared/token/ERC20/BurnMintERC20.sol/BurnMintERC20.json";
import { EtherInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface DeployTokensStepProps {
  onDeploy: (address: string, network: string) => void;
  currentNetwork?: number;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function DeployTokensStep({
  onDeploy,
  currentNetwork,
  setLoadingManager,
  setAction,
}: DeployTokensStepProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [maxSupply, setMaxSupply] = useState("1000000");
  const [preMint, setPreMint] = useState("1000");

  // Hook de wagmi para preparar y ejecutar el despliegue
  const {
    data: hash, // El hash de la transacción de despliegue
    isPending: isDeploying, // true mientras se envía la tx a la billetera
    deployContract, // La función que llamaremos para desplegar
  } = useDeployContract();

  // Hook de wagmi para esperar la confirmación de la tx y obtener el recibo
  const {
    data,
    isLoading: isConfirming, // true mientras la tx está en la mempool
    isSuccess: isConfirmed, // true una vez que la tx se confirma
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeploy = async () => {
    try {
      //setLoadingManager(true);
      //setAction(`Deploying token on ${currentNetwork === NETWORKS.avalancheFuji.id ? "Avalanche Fuji" : "Arbitrum Sepolia"}`);

      await deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [name, symbol, decimals, maxSupply, preMint],
      });
    } catch (error) {
      console.error("Deploy error:", error);
      setLoadingManager(false);
      setAction("");
    }
  };

  useEffect(() => {
    console.log("Transaction status:", { isConfirmed, data, hash });

    if (isConfirmed && data?.contractAddress) {
      console.log("Contract deployed at:", data.contractAddress);
      onDeploy(data.contractAddress, currentNetwork === NETWORKS.avalancheFuji.id ? "fuji" : "arbitrum");
      setLoadingManager(false);
      setAction("");
    }
  }, [isConfirmed, data, hash, currentNetwork, onDeploy, setLoadingManager, setAction]);

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4">Step 1: Deploy Tokens</h2>
      <p className="mb-6 text-gray-600">
        Deploy your BurnMintERC20 tokens on both test networks. You need to deploy a token on each network.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InputBase name="Token Name" value={name} onChange={setName} placeholder="Token Name" />
        <InputBase name="Symbol" value={symbol} onChange={setSymbol} placeholder="Symbol" />
        <IntegerInput name="Decimals" value={decimals} onChange={setDecimals} placeholder="Decimals" />
        <EtherInput value={maxSupply} onChange={setMaxSupply} placeholder="Max Supply" name="Max Supply" />
        <EtherInput value={preMint} onChange={setPreMint} placeholder="Pre-mint Amount" name="Pre-mint Amount" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base-100 p-6 rounded-xl border border-primary">
          <div className="flex items-center mb-4">
            <div className="bg-avalanche w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Avalanche Fuji</h3>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => handleDeploy()}
            disabled={isDeploying || isConfirming}
          >
            Deploy Token
          </button>
        </div>

        <div className="bg-base-100 p-6 rounded-xl border border-secondary">
          <div className="flex items-center mb-4">
            <div className="bg-arbitrum w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Arbitrum Sepolia</h3>
          </div>
          <button
            className="btn btn-secondary w-full"
            onClick={() => handleDeploy()}
            disabled={isDeploying || isConfirming}
          >
            Deploy Token
          </button>
        </div>
      </div>
    </div>
  );
}
