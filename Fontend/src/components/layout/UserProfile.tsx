"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Mail,
  Building2,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  collapsed?: boolean;
}

export default function UserProfile({ collapsed = false }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userData = {
    name: "Ali ben Ali",
    email: "ali.benali@companyx.com",
    role: "Admin",
    company: "CompanyX",
    department: "Procurement",
    permissions: [
      "Manage Tenders",
      "Approve Proposals",
      "User Management",
      "System Configuration",
    ],
  };

  if (collapsed) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow"
          title={userData.name}
        >
          MN
        </button>

        {/* Dropdown for collapsed state */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-primary-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  MN
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Role & Company Info */}
            <div className="p-4 space-y-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary-600" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {userData.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="text-sm font-medium text-slate-900">
                    {userData.company}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserCircle className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="text-sm font-medium text-slate-900">
                    {userData.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="p-4 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Permissions
              </p>
              <div className="space-y-1">
                {userData.permissions.map((permission, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full hover:bg-slate-50 rounded-lg p-2 transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          MN
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-slate-900">
            {userData.name}
          </p>
          <p className="text-xs text-slate-500">
            {userData.role} - {userData.company}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-primary-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                MN
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {userData.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <p className="text-xs text-slate-600 truncate">
                    {userData.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Company Info */}
          <div className="p-4 space-y-3 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {userData.role}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="text-sm font-medium text-slate-900">
                    {userData.company}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="text-sm font-medium text-slate-900">
                  {userData.department}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary-600" />
              <p className="text-xs font-semibold text-slate-700">
                Permissions
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {userData.permissions.map((permission, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1.5 bg-primary-50 rounded text-xs text-primary-700 font-medium"
                >
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                  {permission}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium">
              <User className="w-4 h-4" />
              My Profile
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors font-medium">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
