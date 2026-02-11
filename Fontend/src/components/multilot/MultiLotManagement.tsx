"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Users,
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subsidiary {
  id: string;
  name: string;
  country: string;
  flag: string;
  type: "parent" | "subsidiary" | "partner";
  assignedLots: string[];
  team: { name: string; role: string }[];
  status: "active" | "pending" | "inactive";
  contribution: number;
}

interface Lot {
  id: string;
  number: string;
  title: string;
  description: string;
  estimatedValue: number;
  currency: string;
  assignedTo: string;
  status: "not_started" | "in_progress" | "review" | "submitted";
  progress: number;
  deadline: string;
  requirements: number;
  completedRequirements: number;
}

const mockSubsidiaries: Subsidiary[] = [
  {
    id: "SUB-001",
    name: "CompanyX Headquarters",
    country: "France",
    flag: "🇫🇷",
    type: "parent",
    assignedLots: ["LOT-001", "LOT-003"],
    team: [
      { name: "Ali ben Ali", role: "Project Lead" },
      { name: "Marie Laurent", role: "Technical Lead" },
    ],
    status: "active",
    contribution: 45,
  },
  {
    id: "SUB-002",
    name: "CompanyX Tunisia",
    country: "Tunisia",
    flag: "🇹🇳",
    type: "subsidiary",
    assignedLots: ["LOT-002"],
    team: [
      { name: "Ahmed Kacem", role: "Regional Manager" },
      { name: "Salma Ben Ahmed", role: "Compliance Officer" },
    ],
    status: "active",
    contribution: 30,
  },
  {
    id: "SUB-003",
    name: "CompanyX Morocco",
    country: "Morocco",
    flag: "🇲🇦",
    type: "subsidiary",
    assignedLots: ["LOT-004"],
    team: [{ name: "Youssef El Amrani", role: "Local Partner" }],
    status: "active",
    contribution: 15,
  },
  {
    id: "SUB-004",
    name: "TechPartner Solutions",
    country: "UAE",
    flag: "🇦🇪",
    type: "partner",
    assignedLots: ["LOT-005"],
    team: [{ name: "Hassan Al-Mansoori", role: "Strategic Partner" }],
    status: "pending",
    contribution: 10,
  },
];

const mockLots: Lot[] = [
  {
    id: "LOT-001",
    number: "1",
    title: "IT Infrastructure & Cloud Services",
    description: "Design, deployment, and maintenance of IT infrastructure",
    estimatedValue: 850000,
    currency: "EUR",
    assignedTo: "SUB-001",
    status: "in_progress",
    progress: 65,
    deadline: "2026-03-15",
    requirements: 12,
    completedRequirements: 8,
  },
  {
    id: "LOT-002",
    number: "2",
    title: "Cybersecurity Implementation",
    description: "Security audit, implementation, and monitoring",
    estimatedValue: 450000,
    currency: "EUR",
    assignedTo: "SUB-002",
    status: "in_progress",
    progress: 45,
    deadline: "2026-03-20",
    requirements: 10,
    completedRequirements: 4,
  },
  {
    id: "LOT-003",
    number: "3",
    title: "Application Development",
    description: "Custom software development and integration",
    estimatedValue: 620000,
    currency: "EUR",
    assignedTo: "SUB-001",
    status: "review",
    progress: 90,
    deadline: "2026-03-10",
    requirements: 15,
    completedRequirements: 14,
  },
  {
    id: "LOT-004",
    number: "4",
    title: "Training & Change Management",
    description: "User training, documentation, and change management",
    estimatedValue: 180000,
    currency: "EUR",
    assignedTo: "SUB-003",
    status: "not_started",
    progress: 0,
    deadline: "2026-04-01",
    requirements: 8,
    completedRequirements: 0,
  },
  {
    id: "LOT-005",
    number: "5",
    title: "Maintenance & Support (3 years)",
    description: "Post-implementation support and maintenance services",
    estimatedValue: 290000,
    currency: "EUR",
    assignedTo: "SUB-004",
    status: "not_started",
    progress: 0,
    deadline: "2026-03-25",
    requirements: 6,
    completedRequirements: 0,
  },
];

export default function MultiLotManagement() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "lots" | "subsidiaries"
  >("overview");
  const [subsidiaries] = useState<Subsidiary[]>(mockSubsidiaries);
  const [lots] = useState<Lot[]>(mockLots);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Layers },
    { id: "lots" as const, label: "Lots Management", icon: FileText },
    { id: "subsidiaries" as const, label: "Subsidiaries", icon: Building2 },
  ];

  const getStatusColor = (status: Lot["status"]) => {
    switch (status) {
      case "not_started":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "review":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300";
      case "submitted":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300";
    }
  };

  const getTypeColor = (type: Subsidiary["type"]) => {
    switch (type) {
      case "parent":
        return "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300";
      case "subsidiary":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "partner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  const totalValue = lots.reduce((sum, lot) => sum + lot.estimatedValue, 0);
  const overallProgress = Math.round(
    lots.reduce((sum, lot) => sum + lot.progress, 0) / lots.length,
  );

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Multi-Subsidiary & Multi-Lot Management
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Coordinate multiple entities and lots for consolidated tender
                response
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Plus className="w-4 h-4" />
                Add Subsidiary
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Consolidate & Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {lots.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Lots
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {subsidiaries.length}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Entities
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {(totalValue / 1000000).toFixed(2)}M
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Value EUR
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {overallProgress}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Overall Progress
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contribution Breakdown */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Entity Contribution Breakdown
                  </h3>
                  <div className="space-y-4">
                    {subsidiaries.map((sub) => (
                      <div key={sub.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{sub.flag}</span>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {sub.name}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {sub.assignedLots.length} lot(s) assigned
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {sub.contribution}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${sub.contribution}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Lot Overview */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Lots Status Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {lots.map((lot) => {
                      const assignedSub = subsidiaries.find(
                        (s) => s.id === lot.assignedTo,
                      );
                      return (
                        <div
                          key={lot.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-primary-600 dark:text-primary-400">
                                  Lot {lot.number}
                                </span>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium",
                                    getStatusColor(lot.status),
                                  )}
                                >
                                  {lot.status.replace("_", " ").toUpperCase()}
                                </span>
                              </div>
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                                {lot.title}
                              </h4>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                            {lot.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                              <span>{assignedSub?.flag}</span>
                              <span>{assignedSub?.name}</span>
                            </div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {lot.estimatedValue.toLocaleString()}{" "}
                              {lot.currency}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "lots" && (
            <div className="space-y-4">
              {lots.map((lot) => {
                const assignedSub = subsidiaries.find(
                  (s) => s.id === lot.assignedTo,
                );
                return (
                  <Card
                    key={lot.id}
                    className="dark:bg-slate-900 dark:border-slate-700"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Lot {lot.number}: {lot.title}
                            </h3>
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                getStatusColor(lot.status),
                              )}
                            >
                              {lot.status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {lot.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6 mb-4">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Estimated Value
                          </div>
                          <div className="text-lg font-semibold text-slate-900 dark:text-white">
                            {lot.estimatedValue.toLocaleString()} {lot.currency}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Assigned To
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{assignedSub?.flag}</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {assignedSub?.name}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Deadline
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {lot.deadline}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Requirements
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {lot.completedRequirements}/{lot.requirements}{" "}
                            completed
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            Progress
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {lot.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              lot.progress === 100
                                ? "bg-success-500"
                                : "bg-primary-600",
                            )}
                            style={{ width: `${lot.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === "subsidiaries" && (
            <div className="space-y-4">
              {subsidiaries.map((sub) => (
                <Card
                  key={sub.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{sub.flag}</span>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {sub.name}
                            </h3>
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                getTypeColor(sub.type),
                              )}
                            >
                              {sub.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {sub.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Assigned Lots
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sub.assignedLots.map((lotId) => {
                            const lot = lots.find((l) => l.id === lotId);
                            return (
                              <span
                                key={lotId}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                              >
                                Lot {lot?.number}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Team Members
                        </div>
                        <div className="space-y-1">
                          {sub.team.map((member, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-slate-900 dark:text-white"
                            >
                              {member.name}{" "}
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                ({member.role})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Contribution
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {sub.contribution}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${sub.contribution}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
