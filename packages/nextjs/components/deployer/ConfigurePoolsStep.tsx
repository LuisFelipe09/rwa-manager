import { useState } from "react";
import { encodePacked } from "viem";
import { useWriteContract } from "wagmi";
import { abi } from "~~/../hardhat/artifacts/@chainlink/contracts-ccip/contracts/pools/BurnMintTokenPool.sol/BurnMintTokenPool.json";
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

export default function ConfigurePoolsStep({
  tokenAddresses,
  poolAddresses,
  currentNetwork,
  onComplete,
  setLoadingManager,
  setAction,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  // Rate limit states with defaults
  const [outboundRateLimitEnabled, setOutboundRateLimitEnabled] = useState(false);
  const [outboundRateLimitCapacity, setOutboundRateLimitCapacity] = useState(0);
  const [outboundRateLimitRate, setOutboundRateLimitRate] = useState(0);
  const [inboundRateLimitEnabled, setInboundRateLimitEnabled] = useState(false);
  const [inboundRateLimitCapacity, setInboundRateLimitCapacity] = useState(0);
  const [inboundRateLimitRate, setInboundRateLimitRate] = useState(0);

  const getRemoteChainSelector = (): string => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return NETWORKS.arbitrumSepolia.selector;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return NETWORKS.avalancheFuji.selector;
    return "0";
  };

  const getRemotePoolAddresses = (): string[] => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return [poolAddresses.arbitrum];
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return [poolAddresses.fuji];
    return [];
  };

  const getRemoteTokenAddress = () => {
    if (currentNetwork === NETWORKS.avalancheFuji.id) return tokenAddresses.arbitrum;
    if (currentNetwork === NETWORKS.arbitrumSepolia.id) return tokenAddresses.fuji;
    return "";
  };

  const chainUpdate = {
    remoteChainSelector: BigInt(getRemoteChainSelector()),
    remotePoolAddresses: getRemotePoolAddresses().map(addr => encodePacked(["address"], [addr])),
    remoteTokenAddress: encodePacked(["address"], [getRemoteTokenAddress()]),
    outboundRateLimiterConfig: {
      isEnabled: outboundRateLimitEnabled,
      capacity: BigInt(outboundRateLimitCapacity),
      rate: BigInt(outboundRateLimitRate),
    },
    inboundRateLimiterConfig: {
      isEnabled: inboundRateLimitEnabled,
      capacity: BigInt(inboundRateLimitCapacity),
      rate: BigInt(inboundRateLimitRate),
    },
  };

  const { writeContractAsync } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: currentNetwork === NETWORKS.avalancheFuji.id ? poolAddresses.fuji : poolAddresses.arbitrum,
      abi: abi,
      functionName: "applyChainUpdates",
      args: [[], [chainUpdate]],
    });

  const writeTx = useTransactor();

  const handleConfigure = async () => {
    setError(null);

    try {
      setAction("Configuring pool...");

      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 2 });

      setAction("");
      onComplete();
    } catch (e: any) {
      setError(e.message || "Error configuring pools");
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Configure Token Pools</h2>
      <p className="mb-4">Set cross-chain transfer parameters for this pool.</p>

      <div className="mb-6 p-4 border rounded">
        <div className="font-semibold mb-2">Outbound Rate Limit</div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={outboundRateLimitEnabled}
            onChange={e => setOutboundRateLimitEnabled(e.target.checked)}
          />
          <span>Enable Outbound Rate Limit</span>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm">Capacity</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={outboundRateLimitCapacity}
              onChange={e => setOutboundRateLimitCapacity(Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm">Rate (tokens/sec)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={outboundRateLimitRate}
              onChange={e => setOutboundRateLimitRate(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 border rounded">
        <div className="font-semibold mb-2">Inbound Rate Limit</div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={inboundRateLimitEnabled}
            onChange={e => setInboundRateLimitEnabled(e.target.checked)}
          />
          <span>Enable Inbound Rate Limit</span>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm">Capacity</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={inboundRateLimitCapacity}
              onChange={e => setInboundRateLimitCapacity(Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm">Rate (tokens/sec)</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={inboundRateLimitRate}
              onChange={e => setInboundRateLimitRate(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary mt-4" onClick={handleConfigure}>
        Configure Pools
      </button>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}
