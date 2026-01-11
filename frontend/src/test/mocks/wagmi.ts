import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { mock } from "wagmi/connectors";

export const mockAddress =
  "0x1234567890123456789012345678901234567890" as const;
export const mockAddress2 =
  "0x0987654321098765432109876543210987654321" as const;

export const mockAccount = {
  address: mockAddress,
  type: "json-rpc" as const,
};

export const testConfig = createConfig({
  chains: [sepolia],
  connectors: [
    mock({
      accounts: [mockAddress],
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

export const connectedTestConfig = createConfig({
  chains: [sepolia],
  connectors: [
    mock({
      accounts: [mockAddress],
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
