import type React from "react";
import { SidebarDemo } from "~/components/ui/dashboard/sidebar";
import { Navbar } from "~/components/ui/navigation/navbar";

export default function MyFundsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
