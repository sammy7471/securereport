const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const contractAddress = "0xE540D2a4BB96335D5F96e206183E9925Eee5ed08";
  const orgAddress = "0x6956f5a0D5cd136BDBf2C7FF9bAf0bE3a220190B";
  
  // Call getOrganization function
  const iface = new hre.ethers.Interface([
    "function getOrganization(address) view returns (address orgAddress, string name, string description, bool isVerified, bool isActive, uint256 registeredAt, uint256 reportsReceived, uint256 reportsResolved)"
  ]);
  
  const data = iface.encodeFunctionData("getOrganization", [orgAddress]);
  
  const result = await provider.call({
    to: contractAddress,
    data: data
  });
  
  const decoded = iface.decodeFunctionResult("getOrganization", result);
  
  console.log("Organization Details:");
  console.log("Address:", decoded.orgAddress);
  console.log("Name:", decoded.name);
  console.log("Description:", decoded.description);
  console.log("Is Verified:", decoded.isVerified);
  console.log("Is Active:", decoded.isActive);
  console.log("Registered At:", decoded.registeredAt.toString());
  console.log("Reports Received:", decoded.reportsReceived.toString());
  console.log("Reports Resolved:", decoded.reportsResolved.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
