import type React from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <main className="h-full">{children}</main>
    </div>
  );
}
