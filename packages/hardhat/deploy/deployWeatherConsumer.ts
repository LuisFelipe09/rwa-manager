import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import path from "path";
import fs from "fs";

// Lee el config.json
const configPath = path.join(__dirname, "..", "config", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const deployWeatherConsumer: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const networkName = hre.network.name;

  // Usa variable de entorno si está definida, si no, busca en config.json
  const routerAddress = config.routers?.[networkName] || "0x";

  if (!/^0x[a-fA-F0-9]{40}$/.test(routerAddress)) {
    throw new Error(`Router address inválida para la red ${networkName}: ${routerAddress}`);
  }

  await deploy("WeatherConsumer", {
    from: deployer,
    args: [routerAddress],
    log: true,
    autoMine: true,
  });

  const weatherConsumer = await hre.ethers.getContract("WeatherConsumer", deployer);
  console.log(`WeatherConsumer deployed to: ${weatherConsumer.target} on network: ${networkName}`);
};

export default deployWeatherConsumer;

deployWeatherConsumer.tags = ["WeatherConsumer"];
