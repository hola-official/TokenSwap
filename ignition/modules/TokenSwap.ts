import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const usdcToken = "DLT Africa";
const nairaToken = "DLT";
const TokenSwapModule = buildModule("TokenSwapModule", (m) => {
  // const TokenSwap = m.contract("");
  const getName = m.getParameter("usdcToken", usdcToken);
  const getSymbol = m.getParameter("nairaToken", nairaToken);

  const TokenSwap = m.contract("TokenSwap", [getName, getSymbol]);

  return { TokenSwap };
});

export default TokenSwapModule;
