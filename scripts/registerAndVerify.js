const hre = require("hardhat");

async function main() {
  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const contractAddress = "0xE540D2a4BB96335D5F96e206183E9925Eee5ed08";
  const secureReport = SecureReport.attach(contractAddress);

  const [signer] = await hre.ethers.getSigners();
  const orgAddress = await signer.getAddress();
  
  console.log("Signer address:", orgAddress);
  console.log("Contract address:", contractAddress);
  
  // Register organization
  console.log("\n1. Registering organization...");
  const registerTx = await secureReport.registerOrganization("Test Organization", "A test organization for whistleblowing");
  console.log("Register TX:", registerTx.hash);
  await registerTx.wait();
  console.log("✅ Organization registered");
  
  // Verify organization
  console.log("\n2. Verifying organization...");
  const verifyTx = await secureReport.verifyOrganization(orgAddress);
  console.log("Verify TX:", verifyTx.hash);
  await verifyTx.wait();
  console.log("✅ Organization verified");
  
  console.log("\n3. Checking organization status...");
  const org = await secureReport.getOrganization(orgAddress);
  console.log("Name:", org.name);
  console.log("Is Verified:", org.isVerified);
  console.log("Is Active:", org.isActive);
  
  console.log("\n✅ Setup complete!");
  console.log("Your organization address:", orgAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
