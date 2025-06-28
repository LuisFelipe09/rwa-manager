// src/utils/ccip/config.ts
export const NETWORKS = {
  avalancheFuji: {
    id: 43113,
    name: "Avalanche Fuji",
    selector: "14767482510784806043",
    tokenAdminRegistry: "0xA92053a4a3922084d992fD2835bdBa4caC6877e6",
    registryModule: "0x3e1a1cF16A5cA0Ae422c965c5d5F40e9F0F1a0c6",
    router: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    rmnProxy: "0xAc8CFc3762a979628334a0E4C1026244498E821b",
    registryModuleOwnerCustom: "0x97300785aF1edE1343DB6d90706A35CF14aA3d81",
    link: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    color: "#E84142",
    icon: "bg-avalanche",
  },
  arbitrumSepolia: {
    id: 421614,
    name: "Arbitrum Sepolia",
    selector: "3478487238524512106",
    tokenAdminRegistry: "0x8126bE56454B628a88C17849B9ED99dd5a11Bd2f",
    registryModule: "0x3e1a1cF16A5cA0Ae422c965c5d5F40e9F0F1a0c6",
    router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
    rmnProxy: "0x9527E2d01A3064ef6b50c1Da1C0cC523803BCFF2",
    registryModuleOwnerCustom: "0xE625f0b8b0Ac86946035a7729Aba124c8A64cf69",
    link: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
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
