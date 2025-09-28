import "../styles/globals.css";

import { type Metadata } from "next";
import { AnonAadhaarProviderWrapper } from "~/components/anon-aadhaar-provider-wrapper";
import { WalletProvider } from "~/lib/wallet";
import { Toaster } from "~/components/ui/sonner";
import { SidebarDemo } from "~/components/ui/dashboard/sidebar";
import { ChatPopup } from "~/components/chat-popup";
import { Navbar } from "~/components/ui/navigation/navbar";

export const metadata: Metadata = {
  title: "cheat.fund",
  description: "cheat.fund",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark`}>
      <body>
        <AnonAadhaarProviderWrapper>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex flex-1">
                <SidebarDemo />
                <div className="w-full">{children}</div>
              </div>
            </div>
            <Toaster />
            <ChatPopup />
          </WalletProvider>
        </AnonAadhaarProviderWrapper>
      </body>
    </html>
  );
}
