const hre = require("hardhat");

async function main() {
  const orgAddress = process.argv[2];
  
  if (!orgAddress) {
    console.error("Usage: npx hardhat run scripts/verifyOrganization.js --network sepolia <ORG_ADDRESS>");
    process.exit(1);
  }

  console.log("Verifying organization:", orgAddress);

  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const contractAddress = "0xE540D2a4BB96335D5F96e206183E9925Eee5ed08";
  const secureReport = SecureReport.attach(contractAddress);

  const tx = await secureReport.verifyOrganization(orgAddress);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Organization verified successfully!");

  // Check organization status
  const org = await secureReport.getOrganization(orgAddress);
  console.log("\nOrganization Details:");
  console.log("Name:", org.name);
  console.log("Verified:", org.isVerified);
  console.log("Active:", org.isActive);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
