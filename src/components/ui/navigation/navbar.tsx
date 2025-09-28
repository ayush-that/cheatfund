"use client";

import { Bell, User } from "lucide-react";
import { WalletButton } from "../wallet/wallet-button";
import { Breadcrumb } from "./breadscrumb";
import { Button } from "../button";
export function Navbar() {
  return (
    <header className="border-border bg-card/50 sticky top-0 h-16 w-full border-b backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="truncate text-3xl font-semibold text-[#E4BAD1]">
          cheat.fund
        </h1>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
