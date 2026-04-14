"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { readAccessToken } from "@/lib/auth-storage";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      setIsAuthenticated(false);
      setCheckedAuth(true);
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
    setCheckedAuth(true);
  }, [router]);

  if (!checkedAuth || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
