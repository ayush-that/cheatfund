import type React from "react";
import { Navbar } from "~/components/ui/navigation/navbar";
import { SidebarDemo } from "~/components/ui/dashboard/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* <SidebarDemo /> */}
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
