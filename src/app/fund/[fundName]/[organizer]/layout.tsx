import type React from "react";

export default function FundManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <main>{children}</main>
    </div>
  );
}
