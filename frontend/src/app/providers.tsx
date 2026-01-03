"use client";

import type { State } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import { Toaster } from "@/components/ui/sonner";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0E76FD",
            borderRadius: "medium",
          })}
        >
          {children}
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
