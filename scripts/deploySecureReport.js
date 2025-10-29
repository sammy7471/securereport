const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SecureReport contract...");

  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const secureReport = await SecureReport.deploy();

  await secureReport.waitForDeployment();

  const address = await secureReport.getAddress();
  console.log("SecureReport deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    contract: "SecureReport",
    address: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  // Save to JSON file
  const deploymentPath = path.join(__dirname, "..", "deployment-securereport.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment-securereport.json");

  // Update frontend .env
  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env");
  let envContent = "";
  
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf8");
    
    // Update or add VITE_SECUREREPORT_CONTRACT_ADDRESS
    if (envContent.includes("VITE_SECUREREPORT_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_SECUREREPORT_CONTRACT_ADDRESS=.*/,
        `VITE_SECUREREPORT_CONTRACT_ADDRESS=${address}`
      );
    } else {
      envContent += `\nVITE_SECUREREPORT_CONTRACT_ADDRESS=${address}\n`;
    }
  } else {
    envContent = `VITE_SECUREREPORT_CONTRACT_ADDRESS=${address}\n`;
  }

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("Frontend .env updated with contract address");

  // Save ABI to frontend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "SecureReport.sol",
    "SecureReport.json"
  );
  
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abiPath = path.join(__dirname, "..", "frontend", "src", "abi", "SecureReport.json");
  
  // Ensure abi directory exists
  const abiDir = path.dirname(abiPath);
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }
  
  fs.writeFileSync(abiPath, JSON.stringify({ abi: artifact.abi }, null, 2));
  console.log("ABI saved to frontend/src/abi/SecureReport.json");

  console.log("\n✅ Deployment complete!");
  console.log("Contract address:", address);
  console.log("Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
