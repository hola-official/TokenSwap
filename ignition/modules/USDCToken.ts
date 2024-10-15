import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDCTokenModule = buildModule("USDCTokenModule", (m) => {
  // const USDCToken = m.contract("");
  // const getName = m.getParameter("usdcToken", usdcToken);
  // const getSymbol = m.getParameter("nairaToken", nairaToken);

  const USDCToken = m.contract("USDCToken");

  return { USDCToken };
});

export default USDCTokenModule;
