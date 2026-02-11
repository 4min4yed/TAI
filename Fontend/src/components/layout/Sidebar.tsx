"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  CheckSquare,
  Settings,
  Package,
  BarChart3,
  FileSignature,
  ChevronRight,
  ChevronLeft,
  Menu,
  HelpCircle,
  Lock,
  Sparkles,
  ClipboardCheck,
  Calculator,
  FolderLock,
  Users,
  Download,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfile from "./UserProfile";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    title: "GENERAL",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        id: "tenders",
        label: "Tender & Procurement",
        href: "/tenders",
        icon: FileText,
      },
      {
        id: "compliance-matrix",
        label: "Compliance Matrix",
        href: "/compliance",
        icon: ClipboardCheck,
      },
      {
        id: "regulatory",
        label: "Regulatory Frameworks",
        href: "/regulatory",
        icon: Shield,
      },
      {
        id: "documents",
        label: "Document Vault",
        href: "/documents",
        icon: FolderLock,
      },
    ],
  },
  {
    title: "TOOLS",
    items: [
      {
        id: "proposal-editor",
        label: "AI Proposal Editor",
        href: "/proposal-editor",
        icon: Sparkles,
      },
      {
        id: "pricing",
        label: "Cost Simulator",
        href: "/pricing",
        icon: Calculator,
      },
      {
        id: "fulfillment",
        label: "Fulfillment Centre",
        href: "/fulfillment",
        icon: Package,
      },
      {
        id: "kpi",
        label: "KPI Portal",
        href: "/kpi",
        icon: BarChart3,
      },
      {
        id: "service",
        label: "Service & Contract",
        href: "/service",
        icon: FileSignature,
      },
      {
        id: "workflow",
        label: "Workflow & Collaboration",
        href: "/workflow",
        icon: Users,
      },
      {
        id: "export",
        label: "Export & Tracking",
        href: "/export",
        icon: Download,
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        id: "security",
        label: "Security",
        href: "/security",
        icon: Lock,
      },
      {
        id: "help",
        label: "Help",
        href: "/help",
        icon: HelpCircle,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    // Exact match for root path
    if (href === "/") {
      return pathname === "/";
    }
    // For all other paths, check if pathname starts with href
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FM</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Navigate
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-6 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            {isCollapsed && (
              <div className="h-px bg-slate-200 dark:bg-slate-700 mx-3 mb-3"></div>
            )}
            <ul className="space-y-1 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                        active
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                        isCollapsed && "justify-center",
                      )}
                      title={isCollapsed ? item.label : ""}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          active
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile at Bottom */}
      <div
        className={cn(
          "border-t border-slate-200 p-3",
          isCollapsed && "flex justify-center",
        )}
      >
        <UserProfile collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
