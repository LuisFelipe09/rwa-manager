"use client";

import React, { useState } from "react";
import { keccak256, toHex } from "viem";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { stringToHex } from 'viem'

type Config = {
    consumerAddress: string;
    subscriptionId: string;
    args: [string, string, string];
    gasLimit: string;
    expirationTimeMinutes: string;
};

type Result =
    | {
        type: "simulation";
        success: boolean;
        message: string;
        decodedResponse: string;
        apiUrl?: string;
    }
    | {
        type: "update";
        success: boolean;
        message: string;
        transactionHash: string;
        blockNumber?: string;
    }
    | null;

const ChainlinkFunctionsComponent = () => {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { writeContractAsync } = useWriteContract();

    const [sourceCode, setSourceCode] = useState<string>(`
const prediction_url = "https://bb78-186-29-180-0.ngrok-free.app/prediction-llm";

const predictionRequest = Functions.makeHttpRequest({
 url: prediction_url,
 params: {
   lat: args[0],
   lon: args[1], 
   llm_hash: args[2]
 }
});

const predictionResponse = await predictionRequest;
if (predictionResponse.error) {
 console.error(predictionResponse.error);
 throw Error("Prediction request failed");
}

const data = predictionResponse.data;
// Assuming the API returns a prediction value
const prediction = data.prediction || data.result || data.value;
return Functions.encodeUint256(Math.round(prediction * 100));`);

    const [config, setConfig] = useState<Config>({
        consumerAddress: "0x59a694498d7cc2b89ac004de0f86305c741fedeb",
        subscriptionId: "15689",
        args: ["4.60971", "-74.08175", "f0911915-c5b9-0157-a519-1c2a38732412"],
        gasLimit: "300000",
        expirationTimeMinutes: "150",
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<Result>(null);
    const [error, setError] = useState<string | null>(null);

    // Chainlink Functions configuration for Sepolia
    const CONFIG = {
        routerAddress: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
        donId: "fun-avalanche-fuji-1",
        explorerUrl: "https://testnet.snowscan.xyz/",
    };

    const automatedFunctionsAbi = [
        {
            inputs: [
                { internalType: "bytes", name: "request", type: "bytes" },
                { internalType: "uint64", name: "subscriptionId", type: "uint64" },
                { internalType: "uint32", name: "gasLimit", type: "uint32" },
                { internalType: "bytes32", name: "donID", type: "bytes32" },
            ],
            name: "updateRequest",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ] as const;

    const handleParamChange = (param: "lat" | "lon" | "llm_hash", value: string) => {
        const newArgs = [...config.args] as [string, string, string];
        const paramIndex = param === "lat" ? 0 : param === "lon" ? 1 : 2;
        newArgs[paramIndex] = value;
        setConfig(prev => ({
            ...prev,
            args: newArgs,
        }));
    };

    const getCBORFromApi = async (source: string, args: string[]) => {
        const res = await fetch("/api/buildRequestCBOR", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, args }),
        });
        const data = await res.json();
        return data.cbor; // Esto es el buildRequestCBOR generado en backend
    };

    const writeContractAsyncWithParams = async () => {
        const requestBytes = await getCBORFromApi(sourceCode, config.args);
        const donIdBytes32 = stringToHex(CONFIG.donId, { size: 32 });

        return writeContractAsync({
            address: config.consumerAddress as `0x${string}`,
            abi: automatedFunctionsAbi,
            functionName: "updateRequest",
            args: [requestBytes, BigInt(config.subscriptionId), Number(config.gasLimit), donIdBytes32],
        });
    };

    const writeTx = useTransactor();

    const handleConfigChange = (field: keyof Config, value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const updateRequest = async () => {
        if (!walletClient || !address) {
            setError("Por favor conecta tu wallet");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const hash = await writeTx(writeContractAsyncWithParams, { blockConfirmations: 2 });

            setResult({
                type: "update",
                success: true,
                message: "Request actualizado exitosamente",
                transactionHash: hash ?? "",
            });
        } catch (err: any) {
            setError(`Error actualizando request: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Chainlink Functions - LLM Prediction API</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Configuración</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consumer Address</label>
                                <input
                                    type="text"
                                    value={config.consumerAddress}
                                    onChange={e => handleConfigChange("consumerAddress", e.target.value)}
                                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0x..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription ID</label>
                                <input
                                    type="text"
                                    value={config.subscriptionId}
                                    onChange={e => handleConfigChange("subscriptionId", e.target.value)}
                                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gas Limit</label>
                                    <input
                                        type="text"
                                        value={config.gasLimit}
                                        onChange={e => handleConfigChange("gasLimit", e.target.value)}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiración (min)</label>
                                    <input
                                        type="text"
                                        value={config.expirationTimeMinutes}
                                        onChange={e => handleConfigChange("expirationTimeMinutes", e.target.value)}
                                        className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Parameters */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Parámetros de la API</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
                                <input
                                    type="text"
                                    value={config.args[0]}
                                    onChange={e => handleParamChange("lat", e.target.value)}
                                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="4.60971"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
                                <input
                                    type="text"
                                    value={config.args[1]}
                                    onChange={e => handleParamChange("lon", e.target.value)}
                                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="-74.08175"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LLM Hash</label>
                                <input
                                    type="text"
                                    value={config.args[2]}
                                    onChange={e => handleParamChange("llm_hash", e.target.value)}
                                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="f0911915-c5b9-0157-a519-1c2a38732412"
                                />
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                <p className="text-sm text-blue-700">
                                    <strong>URL de prueba:</strong>
                                </p>
                                <p className="text-xs text-blue-600 break-all font-mono">
                                    https://0271-186-29-180-0.ngrok-free.app/prediction-llm?lat={config.args[0]}&lon={config.args[1]}
                                    &llm_hash={config.args[2]}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Connection Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Estado del Wallet</h3>
                        {address ? (
                            <div className="text-green-600 text-sm">
                                ✅ Conectado: {address.slice(0, 6)}...{address.slice(-4)}
                            </div>
                        ) : (
                            <div className="text-red-600 text-sm">❌ Wallet no conectado</div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={updateRequest}
                            disabled={isLoading || !address}
                            className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isLoading ? "Actualizando..." : "🚀 Actualizar Request"}
                        </button>
                    </div>
                </div>

                {/* Code Editor Panel */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Código JavaScript (source.js)</h2>

                        <textarea
                            value={sourceCode}
                            onChange={e => setSourceCode(e.target.value)}
                            className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-black"
                            placeholder="Ingresa tu código JavaScript aquí..."
                        />

                        <div className="mt-2 text-xs text-gray-500">Este código se ejecutará en el DON de Chainlink Functions</div>
                    </div>

                    {/* Results */}
                    {(result || error) && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">Resultado</h3>

                            {error && <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700">❌ {error}</div>}

                            {result && (
                                <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                                    <div className="text-green-700 font-medium mb-2">✅ {result.message}</div>

                                    {result.type === "simulation" && (
                                        <div className="text-sm text-green-600 space-y-2">
                                            <div>
                                                <strong>Respuesta simulada:</strong> {result.decodedResponse}
                                            </div>
                                            {result.apiUrl && (
                                                <div>
                                                    <strong>URL API:</strong>
                                                    <br />
                                                    <code className="bg-green-50 p-1 rounded text-xs break-all">{result.apiUrl}</code>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {result.type === "update" && result.transactionHash && (
                                        <div className="text-sm text-green-600">
                                            <strong>Transaction Hash:</strong>
                                            <br />
                                            <a
                                                href={`${CONFIG.explorerUrl}/tx/${result.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline break-all"
                                            >
                                                {result.transactionHash}
                                            </a>
                                            {result.blockNumber && (
                                                <div className="mt-1">
                                                    <strong>Block Number:</strong> {result.blockNumber}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Network Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-blue-700">Configuración de Red</h3>
                        <div className="text-sm text-blue-600 space-y-1">
                            <div>
                                <strong>Red:</strong> Fuji
                            </div>
                            <div>
                                <strong>Router:</strong> {CONFIG.routerAddress}
                            </div>
                            <div>
                                <strong>DON ID:</strong> {CONFIG.donId}
                            </div>
                            <div>
                                <strong>Explorer:</strong> {CONFIG.explorerUrl}
                            </div>
                            <div>
                                <strong>API:</strong> LLM Prediction Service
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChainlinkFunctionsComponent;
