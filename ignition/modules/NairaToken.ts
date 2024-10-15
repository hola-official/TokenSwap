import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NairaTokenModule = buildModule("NairaTokenModule", (m) => {
  // const NairaToken = m.contract("");
  // const getName = m.getParameter("NairaToken", NairaToken);
  // const getSymbol = m.getParameter("nairaToken", nairaToken);

  const NairaToken = m.contract("NairaToken");

  return { NairaToken };
});

export default NairaTokenModule;
