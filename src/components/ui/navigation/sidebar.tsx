"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Button } from "../button";
import { Home, Wallet, MessageCircle, Plus, User } from "lucide-react";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "My Funds", href: "/my-funds", icon: Wallet },
  { name: "Create Fund", href: "/create", icon: Plus },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Contact", href: "/contact", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar border-sidebar-border h-full w-64 border-r">
      <div className="p-6">
        <div className="mb-8 flex items-center space-x-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-sidebar-primary-foreground text-lg font-bold">
              C
            </span>
          </div>
          <span className="text-sidebar-foreground text-xl font-bold">
            Cheat Fund
          </span>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
