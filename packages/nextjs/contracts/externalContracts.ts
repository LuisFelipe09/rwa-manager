import { parseAbi } from "viem";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const routerAbi = parseAbi([
  // Solo los fragmentos necesarios
  "function getFee(uint64 destinationChainSelector, (bytes receiver, bytes data, (address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) view returns (uint256)",
  "function ccipSend(uint64 destinationChainSelector, (bytes receiver, bytes data, (address token, uint256 amount)[] tokenAmounts, address feeToken, bytes extraArgs) message) payable returns (bytes32)",
]);
const erc20Abi = parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]);

const externalContracts = {
  421614: {
    ROUTER: {
      address: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
      abi: routerAbi,
    },
    ERC20: {
      address: "0xCb0477bCF778101b878352104356E0023F18DE6E",
      abi: erc20Abi,
    },
  },
  43113: {
    ROUTER: {
      address: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
      abi: routerAbi,
    },
    ERC20: {
      address: "0x0552Db3786e482e64F9bB5C0f3E0fE1D506C813A",
      abi: erc20Abi,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
