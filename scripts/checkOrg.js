const hre = require("hardhat");

async function main() {
  const SecureReport = await hre.ethers.getContractFactory("SecureReport");
  const contractAddress = "0xE540D2a4BB96335D5F96e206183E9925Eee5ed08";
  const secureReport = SecureReport.attach(contractAddress);

  const orgAddress = "0x6956f5a0D5cd136BDBf2C7FF9bAf0bE3a220190B";
  
  try {
    const org = await secureReport.organizations(orgAddress);
    console.log("Organization Details:");
    console.log("Address:", org.orgAddress);
    console.log("Name:", org.name);
    console.log("Description:", org.description);
    console.log("Is Verified:", org.isVerified);
    console.log("Is Active:", org.isActive);
    console.log("Registered At:", org.registeredAt.toString());
    console.log("Reports Received:", org.reportsReceived.toString());
    console.log("Reports Resolved:", org.reportsResolved.toString());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
