// src/utils/ccip/config.ts
export const NETWORKS = {
  avalancheFuji: {
    id: 43113,
    name: "Avalanche Fuji",
    selector: "14767482510784806043",
    tokenAdminRegistry: "0x3F3a9E5e0D7dd1e7bC9c011a1DaaB3C1c122dAf8",
    registryModule: "0x3e1a1cF16A5cA0Ae422c965c5d5F40e9F0F1a0c6",
    color: "#E84142",
    icon: "bg-avalanche",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    selector: "3478487238524512106",
    tokenAdminRegistry: "0x3F3a9E5e0D7dd1e7bC9c011a1DaaB3C1c122dAf8",
    registryModule: "0x3e1a1cF16A5cA0Ae422c965c5d5F40e9F0F1a0c6",
    color: "#28A0F0",
    icon: "bg-arbitrum",
  },
};

export const NETWORKS_LIST = [NETWORKS.avalancheFuji, NETWORKS.arbitrumSepolia];

export const TOKEN_ADMIN_REGISTRY_ADDRESSES = {
  fuji: "0x3F3a9E5e0D7dd1e7bC9c011a1DaaB3C1c122dAf8",
  arbitrum: "0x3F3a9E5e0D7dd1e7bC9c011a1DaaB3C1c122dAf8",
};

export const TOKEN_ADMIN_REGISTRY_ABI = [];

export const POOL_ABI = [];

export const TOKEN_ABI = [];
