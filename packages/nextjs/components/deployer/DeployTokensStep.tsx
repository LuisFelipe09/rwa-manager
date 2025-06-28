// src/components/cross-chain/DeployTokensStep.tsx
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDeployContract, useWaitForTransactionReceipt } from "wagmi";
import {
  abi,
  bytecode,
} from "~~/../hardhat/artifacts/@chainlink/contracts/src/v0.8/shared/token/ERC20/BurnMintERC20.sol/BurnMintERC20.json";
import { EtherInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import { NETWORKS } from "~~/utils/ccip/config";

interface DeployTokensStepProps {
  onDeploy: (address: string, network: string) => void;
  onNextStep: () => void;
  currentNetwork?: number;
  setLoadingManager: (loading: boolean) => void;
  setAction: (action: string) => void;
}

export default function DeployTokensStep({
  onDeploy,
  onNextStep,
  currentNetwork,
  setLoadingManager,
  setAction,
}: DeployTokensStepProps) {
  const { chain } = useAccount();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [maxSupply, setMaxSupply] = useState("1000000");
  const [preMint, setPreMint] = useState("1000");
  const [deployNetwork, setDeployNetwork] = useState<"fuji" | "arbitrum" | null>(null);
  const [tokenDeployed, setTokenDeployed] = useState({ fuji: false, arbitrum: false });

  console.log("currentNetwork", currentNetwork);

  const { data: hash, deployContract } = useDeployContract();

  const { data, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Lógica para saber en qué red estamos
  const [isFuji, setIsFuji] = useState(false);
  const [isArbitrum, setIsArbitrum] = useState(false);

  useEffect(() => {
    console.log(isFuji, chain?.id);
    setIsFuji(chain?.id === NETWORKS.avalancheFuji.id);
    setIsArbitrum(chain?.id === NETWORKS.arbitrumSepolia.id);
  }, [chain?.id]);

  const handleDeploy = async (network: "fuji" | "arbitrum") => {
    setDeployNetwork(network);
    try {
      setAction(`Deploying token on ${network === "fuji" ? "Avalanche Fuji" : "Arbitrum Sepolia"}`);
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
    if (isConfirmed && data?.contractAddress && deployNetwork) {
      setTokenDeployed(prev => ({ ...prev, [deployNetwork]: true }));
      onDeploy(data.contractAddress, deployNetwork);
      setLoadingManager(false);
      setAction("");
      setDeployNetwork(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, data, deployNetwork]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-base-100 p-6 rounded-xl border border-primary">
          <div className="flex items-center mb-4">
            <div className="bg-avalanche w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Avalanche Fuji</h3>
          </div>
          <button className="btn btn-primary w-full" onClick={() => handleDeploy("fuji")} disabled={!isFuji}>
            {tokenDeployed.fuji ? "Deployed" : isFuji ? "Deploy Token" : "Switch to Fuji"}
          </button>
        </div>

        <div className="bg-base-100 p-6 rounded-xl border border-secondary">
          <div className="flex items-center mb-4">
            <div className="bg-arbitrum w-8 h-8 rounded-full mr-3"></div>
            <h3 className="font-bold">Arbitrum Sepolia</h3>
          </div>
          <button className="btn btn-secondary w-full" onClick={() => handleDeploy("arbitrum")} disabled={!isArbitrum}>
            {tokenDeployed.arbitrum ? "Deployed" : isArbitrum ? "Deploy Token" : "Switch to Arbitrum"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p>
          Avalanche Fuji:{" "}
          {tokenDeployed.fuji ? (
            <span className="text-success">Deployed</span>
          ) : (
            <span className="text-warning">Pending</span>
          )}
        </p>
        <p>
          Arbitrum Sepolia:{" "}
          {tokenDeployed.arbitrum ? (
            <span className="text-success">Deployed</span>
          ) : (
            <span className="text-warning">Pending</span>
          )}
        </p>
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
