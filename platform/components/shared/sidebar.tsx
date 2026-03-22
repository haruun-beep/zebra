"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/quotes", label: "Quotes", icon: FileText, adminOnly: true },
  { href: "/invoices", label: "Invoices", icon: Receipt, adminOnly: true },
  { href: "/payments", label: "Payments", icon: CreditCard, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

interface SidebarProps {
  profile: {
    role: string;
    companies?: { name: string; logo_url?: string | null } | null;
  } | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";
  const company = profile?.companies;

  return (
    <aside className="w-64 border-r bg-card flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        {company?.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-8 w-auto" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zebra-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-sm truncate">
              {company?.name ?? "Zebra Landscaping"}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
