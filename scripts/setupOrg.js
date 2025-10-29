const hre = require("hardhat");

async function main() {
  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const contractAddress = "0x7fb561D9991f228F42abA91faa80BB9C77690bE9";
  const secureReport = SecureReport.attach(contractAddress);

  const [signer] = await hre.ethers.getSigners();
  const orgAddress = await signer.getAddress();
  
  console.log("Setting up organization for:", orgAddress);
  
  // Register
  console.log("\n1. Registering...");
  const registerTx = await secureReport.registerOrganization(
    "SecureReport Organization", 
    "Official organization for receiving anonymous whistleblowing reports"
  );
  await registerTx.wait();
  console.log("✅ Registered");
  
  // Verify
  console.log("\n2. Verifying...");
  const verifyTx = await secureReport.verifyOrganization(orgAddress);
  await verifyTx.wait();
  console.log("✅ Verified");
  
  // Check status
  console.log("\n3. Checking status...");
  const org = await secureReport.getOrganization(orgAddress);
  console.log("Name:", org.name);
  console.log("Verified:", org.isVerified);
  console.log("Active:", org.isActive);
  
  console.log("\n✅ All done! Your address:", orgAddress);
}

main().catch(console.error);
