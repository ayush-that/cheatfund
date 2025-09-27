"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname);

  return (
    <nav
      className={cn(
        "text-muted-foreground flex items-center space-x-1 text-sm",
        className,
      )}
    >
      <Link
        href="/home"
        className="hover:text-foreground flex items-center transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = isLast
      ? undefined
      : "/" + segments.slice(0, index + 1).join("/");

    // Decode URI components and format labels
    const label = formatSegmentLabel(decodeURIComponent(segment));

    items.push({ label, href });
  });

  return items;
}

function formatSegmentLabel(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    "my-funds": "My Funds",
    create: "Create Fund",
    profile: "Profile",
    contact: "Contact",
    bid: "Bidding",
    join: "Join Fund",
    fund: "Fund Details",
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Handle Ethereum addresses
  if (segment.startsWith("0x") && segment.length === 42) {
    return `${segment.slice(0, 6)}...${segment.slice(-4)}`;
  }

  // Capitalize and format regular segments
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
