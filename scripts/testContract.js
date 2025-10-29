const hre = require("hardhat");

async function main() {
  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const contractAddress = "0x7fb561D9991f228F42abA91faa80BB9C77690bE9";
  const secureReport = SecureReport.attach(contractAddress);

  // Check admin
  const admin = await secureReport.admin();
  console.log("Contract admin:", admin);
  
  // Check report counter
  const counter = await secureReport.reportCounter();
  console.log("Report counter:", counter.toString());
  
  // Try to read organization mapping directly
  const [signer] = await hre.ethers.getSigners();
  const orgAddress = await signer.getAddress();
  console.log("Checking org:", orgAddress);
  
  const org = await secureReport.organizations(orgAddress);
  console.log("Org data:", org);
}

main().catch(console.error);
