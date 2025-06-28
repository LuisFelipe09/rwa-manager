// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { BurnMintERC20 } from "@chainlink/contracts/src/v0.8/shared/token/ERC20/BurnMintERC20.sol";
import { IExternalStorage } from "./WeatherConsumer.sol";

contract RWAToken is BurnMintERC20, IExternalStorage {
    bytes public lastValue;
    address public lastCaller;

    event ValueStored(bytes value, address indexed caller);

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply_,
        uint256 preMint_
    ) BurnMintERC20(name_, symbol_, decimals_, initialSupply_, preMint_) {}

    function storeValue(bytes calldata value) external override {
        lastValue = value;
        lastCaller = msg.sender;
        emit ValueStored(value, msg.sender);
    }
}
