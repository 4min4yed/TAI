"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Building2,
  Mail,
  Shield,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSelector from "@/components/common/LanguageSelector";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Title or Search */}
        <div className="flex-1 max-w-xl">
          {title ? (
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Right: Notifications + Theme Toggle + User Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Help */}
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                AB
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ali ben Ali
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin - CompanyX
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                      AB
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Ali ben Ali
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        ali.benali@companyx.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Role
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Admin
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Company
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        CompanyX
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Department
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Procurement
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Manage Tenders",
                      "Approve Proposals",
                      "User Management",
                      "System Configuration",
                    ].map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-md"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md transition-colors mt-1">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
