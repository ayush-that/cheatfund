import "../styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AnonAadhaarProviderWrapper } from "~/components/anon-aadhaar-provider-wrapper";
import { WalletProvider } from "~/lib/wallet";
import { Toaster } from "~/components/ui/sonner";
import { SidebarDemo } from "~/components/ui/dashboard/sidebar";

export const metadata: Metadata = {
  title: "CheatFund - Web3 Authentication",
  description: "Secure Web3 authentication with Ethereum wallets",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body>
        <AnonAadhaarProviderWrapper>
          <WalletProvider>
            <div className="flex min-h-screen flex-row">
              <SidebarDemo />
              <div className="w-full">{children}</div>
            </div>
            <Toaster />
          </WalletProvider>
        </AnonAadhaarProviderWrapper>
      </body>
    </html>
  );
}
