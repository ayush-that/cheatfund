"use client";

// import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { WalletButton } from "../wallet/wallet-button";
import { Breadcrumb } from "./breadscrumb";
import { Button } from "../button";
export function Navbar() {
  return (
    <header className="border-border bg-card/50 h-16 w-full border-b backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="truncate text-3xl font-bold text-[#E4BAD1]">
          cheat.fund
        </h1>
        <div className="flex items-center space-x-4">
          {/* <h1 className="text-foreground text-lg font-semibold">Dashboard</h1> */}
          <div className="hidden md:block">{/* <Breadcrumb /> */}</div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
