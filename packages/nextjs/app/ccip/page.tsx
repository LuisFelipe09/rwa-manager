"use client";

import React, { useState, useEffect } from "react";
import { parseEther, formatEther, isAddress, encodePacked, keccak256, encodeAbiParameters, parseAbiParameters, parseAbi } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useScaffoldReadContract, useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Tipos y interfaces
interface NetworkConfig {
    name: string;
    chainSelector: string;
    router: `0x${string}`;
    link?: `0x${string}`;
}

interface TokenAmount {
    token: `0x${string}`;
    amount: bigint;
}

enum FeeType {
    NATIVE = "native",
    LINK = "LINK",
}

// Configuración de redes (ajustar según tus necesidades)
const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
    421614: { // arbitrumSepolia
        name: "Arbitrum Sepolia",
        chainSelector: "3478487238524512106",
        router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
        link: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    },
    43113: { // avalancheFuji
        name: "Avalanche Fuji",
        chainSelector: "14767482510784806043",
        router: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
        link: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    },
};

// ABI del Router CCIP (simplificado)
const ROUTER_ABI = parseAbi([
    "function getFee(uint64 destinationChainSelector, (bytes receiver, bytes data, (address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) view returns (uint256)",
    "function ccipSend(uint64 destinationChainSelector, (bytes receiver, bytes data, (address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) payable returns (bytes32)",
]);

// ABI ERC20 básico
const ERC20_ABI = [
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bool" }]
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" }
        ],
        outputs: [{ name: "", type: "uint256" }]
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }]
    },
    {
        name: "decimals",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }]
    },
    {
        name: "symbol",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "string" }]
    }
] as const;

export default function CCIPTransferComponent() {
    // Estados del componente
    const [tokenAddress, setTokenAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [destinationChain, setDestinationChain] = useState<number>(421614); // Arbitrum Sepolia por defecto
    const [receiverAddress, setReceiverAddress] = useState<string>("");
    const [feeType, setFeeType] = useState<FeeType>(FeeType.LINK);
    const [estimatedFee, setEstimatedFee] = useState<bigint | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Hooks de wagmi
    const { address, chain } = useAccount();
    const publicClient = usePublicClient();
    const { writeContractAsync, isPending } = useWriteContract();
    const writeTx = useTransactor();

    // Obtener configuración de la red actual
    const currentNetworkConfig = chain ? NETWORK_CONFIGS[chain.id || 0] : null;

    // Leer información del token
    const { data: tokenSymbol } = useScaffoldReadContract({
        contractName: "ERC20",
        functionName: "symbol",
        abi: ERC20_ABI,
        address: tokenAddress as `0x${string}`,
        args: [],
    });

    const { data: tokenDecimals } = useScaffoldReadContract({
        contractName: "ERC20",
        functionName: "decimals",
        abi: ERC20_ABI,
        address: tokenAddress as `0x${string}`,
        args: [],
    });

    const { data: tokenBalance } = useScaffoldReadContract({
        contractName: "ERC20",
        functionName: "balanceOf",
        abi: ERC20_ABI,
        address: tokenAddress as `0x${string}`,
        args: [address],
    });

    const { data: allowance } = useScaffoldReadContract({
        contractName: "ERC20",
        functionName: "allowance",
        abi: ERC20_ABI,
        address: tokenAddress as `0x${string}`,
        args: [address, currentNetworkConfig?.router],
    });

    // Hook para aprobar tokens
    const approveTokens = () =>
        writeContractAsync({
            address: tokenAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [currentNetworkConfig?.router!, parseEther(amount || "0")]
        });

    // Hook para enviar tokens CCIP
    const sendCCIPTokens = (destinationChainSelector: bigint, message: any, feeValue?: bigint) =>
        writeContractAsync({
            address: currentNetworkConfig?.router! as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: "ccipSend",
            args: [destinationChainSelector, message],
            value: feeValue || 0n
        });

    // Función para crear extraArgs de CCIP V2
    const createExtraArgs = () => {
        const functionSelector = keccak256(encodePacked(["string"], ["CCIP EVMExtraArgsV2"])).slice(0, 10);
        const gasLimit = 0n; // Sin límite de gas para transferencias simples
        const allowOutOfOrderExecution = true;

        const extraArgsEncoded = encodeAbiParameters(
            parseAbiParameters("uint256, bool"),
            [gasLimit, allowOutOfOrderExecution]
        );

        return (functionSelector + extraArgsEncoded.slice(2)) as `0x${string}`;
    };

    // Función para estimar fees
    const estimateFees = async () => {
        if (!publicClient || !currentNetworkConfig || !destinationChain || !tokenAddress || !receiverAddress || !amount) {
            return;
        }

        try {
            setIsLoading(true);

            const destinationConfig = NETWORK_CONFIGS[Number(destinationChain)];
            if (!destinationConfig) {
                throw new Error("Configuración de destino no encontrada");
            }

            const feeTokenAddress = feeType === FeeType.NATIVE ?
                "0x0000000000000000000000000000000000000000" as `0x${string}` :
                currentNetworkConfig.link as `0x${string}`;

            const tokenAmounts: TokenAmount[] = [{
                token: tokenAddress as `0x${string}`,
                amount: parseEther(amount)
            }];

            const message = {
                receiver: encodeAbiParameters(parseAbiParameters("address"), [receiverAddress as `0x${string}`]),
                data: "0x",
                tokenAmounts,
                feeToken: feeTokenAddress,
                extraArgs: createExtraArgs()
            };

            const fee = await publicClient.readContract({
                address: currentNetworkConfig.router,
                abi: ROUTER_ABI,
                functionName: "getFee",
                args: [BigInt(destinationConfig.chainSelector), message]
            });

            setEstimatedFee(fee);
        } catch (error) {
            console.error("Error estimando fees:", error);
            notification.error("Error estimando fees");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para aprobar tokens
    const handleApprove = async () => {
        if (!currentNetworkConfig || !tokenAddress || !amount) return;

        try {
            setIsLoading(true);

            await writeTx(approveTokens, {
                blockConfirmations: 1,
                onBlockConfirmation: (txnReceipt) => {
                    console.log("📦 Transaction blockHash", txnReceipt.blockHash);
                    notification.success("Tokens aprobados exitosamente");
                }
            });
        } catch (error) {
            console.error("Error aprobando tokens:", error);
            notification.error("Error aprobando tokens");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para transferir tokens
    const handleTransfer = async () => {
        if (!currentNetworkConfig || !destinationChain || !estimatedFee) return;

        try {
            setIsLoading(true);

            const destinationConfig = NETWORK_CONFIGS[destinationChain];
            const feeTokenAddress = feeType === FeeType.NATIVE ?
                "0x0000000000000000000000000000000000000000" as `0x${string}` :
                currentNetworkConfig.link as `0x${string}`;

            const tokenAmounts: TokenAmount[] = [{
                token: tokenAddress as `0x${string}`,
                amount: parseEther(amount)
            }];

            const message = {
                receiver: encodeAbiParameters(parseAbiParameters("address"), [receiverAddress as `0x${string}`]),
                data: "0x",
                tokenAmounts,
                feeToken: feeTokenAddress,
                extraArgs: createExtraArgs()
            };

            const feeValue = feeType === FeeType.NATIVE ? estimatedFee : 0n;

            await writeTx(
                () => sendCCIPTokens(BigInt(destinationConfig.chainSelector), message, feeValue),
                {
                    blockConfirmations: 1,
                    onBlockConfirmation: (txnReceipt) => {
                        console.log("📦 Transaction blockHash", txnReceipt.blockHash);
                        notification.success(`Transferencia exitosa! TX: ${txnReceipt.transactionHash}`);
                        notification.info(`Verifica el estado en: https://ccip.chain.link/tx/${txnReceipt.transactionHash}`);
                    }
                }
            );
        } catch (error) {
            console.error("Error en transferencia:", error);
            notification.error("Error en la transferencia");
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para estimar fees automáticamente
    useEffect(() => {
        if (tokenAddress && amount && destinationChain && receiverAddress) {
            const timer = setTimeout(() => {
                estimateFees();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [tokenAddress, amount, destinationChain, receiverAddress, feeType]);

    // Validaciones
    const isValidTokenAddress = tokenAddress && isAddress(tokenAddress);
    const isValidReceiverAddress = receiverAddress && isAddress(receiverAddress);
    const isValidAmount = amount && parseFloat(amount) > 0;
    const needsApproval = allowance !== undefined && parseEther(amount || "0") > allowance;
    const canTransfer = isValidTokenAddress && isValidReceiverAddress && isValidAmount && !needsApproval && estimatedFee;
    const isProcessing = isLoading || isPending;

    if (!address) {
        return (
            <div className="flex justify-center items-center p-8">
                <p className="text-lg">Conecta tu wallet para usar CCIP</p>
            </div>
        );
    }

    if (!currentNetworkConfig) {
        return (
            <div className="flex justify-center items-center p-8">
                <p className="text-lg text-red-500">Red no soportada para CCIP</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">CCIP Token Transfer</h2>

            <div className="space-y-4">
                {/* Dirección del token */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Dirección del Token</span>
                    </label>
                    <input
                        type="text"
                        placeholder="0x..."
                        className="input input-bordered"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                    />
                    {tokenSymbol && (
                        <label className="label">
                            <span className="label-text-alt">Token: {tokenSymbol}</span>
                        </label>
                    )}
                </div>

                {/* Cantidad */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Cantidad</span>
                    </label>
                    <input
                        type="number"
                        placeholder="0.0"
                        className="input input-bordered"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    {tokenBalance && tokenDecimals && (
                        <label className="label">
                            <span className="label-text-alt">
                                Balance: {formatEther(tokenBalance)} {tokenSymbol}
                            </span>
                        </label>
                    )}
                </div>

                {/* Cadena de destino */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Cadena de Destino</span>
                    </label>
                    <select
                        className="select select-bordered"
                        value={destinationChain}
                        onChange={(e) => setDestinationChain(Number(e.target.value))}
                    >
                        <option value="">Selecciona una cadena</option>
                        {Object.entries(NETWORK_CONFIGS)
                            .filter(([key]) => key !== String(chain?.id))
                            .map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.name}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Dirección del receptor */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Dirección del Receptor</span>
                    </label>
                    <input
                        type="text"
                        placeholder="0x..."
                        className="input input-bordered"
                        value={receiverAddress}
                        onChange={(e) => setReceiverAddress(e.target.value)}
                    />
                </div>

                {/* Tipo de fee */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Pagar Fees con</span>
                    </label>
                    <div className="flex space-x-4">
                        <label className="label cursor-pointer">
                            <input
                                type="radio"
                                name="feeType"
                                className="radio"
                                checked={feeType === FeeType.LINK}
                                onChange={() => setFeeType(FeeType.LINK)}
                            />
                            <span className="label-text ml-2">LINK</span>
                        </label>
                        <label className="label cursor-pointer">
                            <input
                                type="radio"
                                name="feeType"
                                className="radio"
                                checked={feeType === FeeType.NATIVE}
                                onChange={() => setFeeType(FeeType.NATIVE)}
                            />
                            <span className="label-text ml-2">Token Nativo</span>
                        </label>
                    </div>
                </div>

                {/* Fee estimado */}
                {estimatedFee && (
                    <div className="alert alert-info">
                        <span>
                            Fee estimado: {formatEther(estimatedFee)} {feeType === FeeType.NATIVE ? chain?.nativeCurrency?.symbol : "LINK"}
                        </span>
                    </div>
                )}

                {/* Botones */}
                <div className="flex space-x-4">
                    {needsApproval && (
                        <button
                            className={`btn btn-primary flex-1 ${isProcessing ? "loading" : ""}`}
                            onClick={handleApprove}
                            disabled={!isValidTokenAddress || !isValidAmount || isProcessing}
                        >
                            {isProcessing ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Aprobar Tokens"
                            )}
                        </button>
                    )}

                    <button
                        className={`btn btn-success flex-1 ${isProcessing ? "loading" : ""}`}
                        onClick={handleTransfer}
                        disabled={!canTransfer || isProcessing}
                    >
                        {isProcessing ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            "Transferir"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
