const hre = require("hardhat");

async function main() {
  const ContentCert = await hre.ethers.getContractFactory("ContentCert");
  const contentCert = await ContentCert.deploy();

  await contentCert.waitForDeployment();

  const address = await contentCert.getAddress();
  console.log("ContentCert deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
