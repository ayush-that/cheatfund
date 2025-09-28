"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "~/components/ui/sidebar";
import {
  Home,
  PiggyBank,
  Settings,
  Plus,
  Contact2,
  Search,
} from "lucide-react";

export function SidebarDemo() {
  const links = [
    {
      label: "Home",
      href: "/home",
      icon: (
        <Home className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "My Funds",
      href: "/my-funds",
      icon: (
        <PiggyBank className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Discover",
      href: "/discover",
      icon: (
        <Search className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Create Fund",
      href: "/create",
      icon: (
        <Plus className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Contact",
      href: "/contact",
      icon: (
        <Contact2 className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen} animate={false}>
      <SidebarBody>
        <div className="mt-[-26px] flex w-full flex-col gap-4">
          <div className="px-4 py-2"></div>
          <div className={open ? "pl-[12px]" : "pl-[5px]"}>
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
