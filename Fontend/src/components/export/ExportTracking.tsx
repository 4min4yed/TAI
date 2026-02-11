"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Eye,
  Clock,
  Users,
  CheckCircle2,
  Settings,
  Image,
  FileType,
  Hash,
  Palette,
  Layers,
  BarChart3,
  TrendingUp,
  Calendar,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportSettings {
  format: "pdf" | "word";
  includeToC: boolean;
  includePagination: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  brandingLogo: boolean;
  brandingColors: boolean;
  numberedSections: boolean;
  watermark: boolean;
}

interface ViewerLog {
  id: string;
  user: string;
  email: string;
  role: string;
  document: string;
  openedAt: string;
  lastAccessed: string;
  duration: string;
  completionPercent: number;
  actions: string[];
}

const mockViewerLogs: ViewerLog[] = [
  {
    id: "VL-001",
    user: "Marie Laurent",
    email: "marie.laurent@procurement-dept.gov",
    role: "Procurement Officer",
    document: "Technical Proposal - Healthcare IT System",
    openedAt: "Jan 30, 2026 09:15",
    lastAccessed: "Jan 30, 2026 14:32",
    duration: "45 min",
    completionPercent: 100,
    actions: ["Downloaded PDF", "Viewed Section 3", "Viewed Pricing"],
  },
  {
    id: "VL-002",
    user: "Jean-Pierre Moreau",
    email: "jp.moreau@finance.gov",
    role: "Financial Analyst",
    document: "Financial Proposal - Healthcare IT System",
    openedAt: "Jan 30, 2026 10:45",
    lastAccessed: "Jan 30, 2026 11:20",
    duration: "35 min",
    completionPercent: 78,
    actions: ["Viewed Budget", "Downloaded Excel"],
  },
  {
    id: "VL-003",
    user: "Sophie Dubois",
    email: "sophie.dubois@legal.gov",
    role: "Legal Counsel",
    document: "Compliance Matrix - Healthcare IT System",
    openedAt: "Jan 29, 2026 16:30",
    lastAccessed: "Jan 30, 2026 08:15",
    duration: "1h 15min",
    completionPercent: 100,
    actions: ["Downloaded PDF", "Exported to Word", "Viewed All Sections"],
  },
  {
    id: "VL-004",
    user: "Ahmed Ben Salah",
    email: "ahmed.bensalah@tech-review.gov",
    role: "Technical Reviewer",
    document: "Technical Proposal - Healthcare IT System",
    openedAt: "Jan 29, 2026 14:00",
    lastAccessed: "Jan 29, 2026 15:30",
    duration: "1h 30min",
    completionPercent: 92,
    actions: ["Viewed Architecture", "Downloaded Diagrams"],
  },
  {
    id: "VL-005",
    user: "Claire Fontaine",
    email: "claire.fontaine@evaluation.gov",
    role: "Evaluation Committee",
    document: "Executive Summary - Healthcare IT System",
    openedAt: "Jan 28, 2026 11:00",
    lastAccessed: "Jan 28, 2026 11:45",
    duration: "20 min",
    completionPercent: 55,
    actions: ["Viewed Summary", "Skimmed Content"],
  },
];

export default function ExportTracking() {
  const [activeTab, setActiveTab] = useState<"export" | "tracking">("export");
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "pdf",
    includeToC: true,
    includePagination: true,
    includeHeader: true,
    includeFooter: true,
    brandingLogo: true,
    brandingColors: true,
    numberedSections: true,
    watermark: false,
  });

  const tabs = [
    { id: "export" as const, label: "Export Documents", icon: Download },
    { id: "tracking" as const, label: "Viewer Analytics", icon: BarChart3 },
  ];

  const getCompletionColor = (percent: number) => {
    if (percent === 100) return "text-success-600 dark:text-success-400";
    if (percent >= 75) return "text-primary-600 dark:text-primary-400";
    if (percent >= 50) return "text-warning-600 dark:text-warning-400";
    return "text-slate-600 dark:text-slate-400";
  };

  const stats = {
    totalViews: mockViewerLogs.length,
    uniqueViewers: new Set(mockViewerLogs.map((l) => l.email)).size,
    avgCompletion: Math.round(
      mockViewerLogs.reduce((acc, log) => acc + log.completionPercent, 0) /
        mockViewerLogs.length,
    ),
    totalDownloads: mockViewerLogs.filter((l) =>
      l.actions.some((a) => a.includes("Download")),
    ).length,
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Export & Tracking
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Export professional documents and track viewer engagement
              </p>
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
          {activeTab === "export" && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="col-span-2 space-y-6">
                  {/* Format Selection */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileType className="w-5 h-5" />
                        Export Format
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            setExportSettings({
                              ...exportSettings,
                              format: "pdf",
                            })
                          }
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                            exportSettings.format === "pdf"
                              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                          )}
                        >
                          <FileText className="w-8 h-8 text-danger-600" />
                          <div className="text-left">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              PDF
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Best for sharing & viewing
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setExportSettings({
                              ...exportSettings,
                              format: "word",
                            })
                          }
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                            exportSettings.format === "word"
                              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                          )}
                        >
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div className="text-left">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              Word (.docx)
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Editable format
                            </div>
                          </div>
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Structure */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        Document Structure
                      </h2>
                      <div className="space-y-3">
                        {[
                          {
                            key: "includeToC",
                            label: "Table of Contents",
                            description: "Auto-generated with clickable links",
                          },
                          {
                            key: "includePagination",
                            label: "Automatic Pagination",
                            description: "Page numbers and page breaks",
                          },
                          {
                            key: "numberedSections",
                            label: "Numbered Sections",
                            description:
                              "Hierarchical section numbering (1.1, 1.2, etc.)",
                          },
                          {
                            key: "includeHeader",
                            label: "Header with Document Title",
                            description: "Company name and document title",
                          },
                          {
                            key: "includeFooter",
                            label: "Footer with Page Info",
                            description: "Page numbers and copyright notice",
                          },
                        ].map((option) => (
                          <label
                            key={option.key}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                exportSettings[
                                  option.key as keyof ExportSettings
                                ] as boolean
                              }
                              onChange={(e) =>
                                setExportSettings({
                                  ...exportSettings,
                                  [option.key]: e.target.checked,
                                })
                              }
                              className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Branding */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Corporate Branding
                      </h2>
                      <div className="space-y-3">
                        {[
                          {
                            key: "brandingLogo",
                            label: "Company Logo",
                            description: "Place logo in header",
                          },
                          {
                            key: "brandingColors",
                            label: "Brand Colors",
                            description: "Use corporate color scheme",
                          },
                          {
                            key: "watermark",
                            label: "Confidential Watermark",
                            description:
                              "Add 'Confidential' watermark to all pages",
                          },
                        ].map((option) => (
                          <label
                            key={option.key}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                exportSettings[
                                  option.key as keyof ExportSettings
                                ] as boolean
                              }
                              onChange={(e) =>
                                setExportSettings({
                                  ...exportSettings,
                                  [option.key]: e.target.checked,
                                })
                              }
                              className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {option.label}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {option.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Preview & Actions */}
                <div className="space-y-6">
                  {/* Preview */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                        Preview Settings
                      </h2>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-success-600" />
                            Format: {exportSettings.format.toUpperCase()}
                          </div>
                          {exportSettings.includeToC && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success-600" />
                              Table of Contents
                            </div>
                          )}
                          {exportSettings.numberedSections && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success-600" />
                              Numbered Sections
                            </div>
                          )}
                          {exportSettings.brandingLogo && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success-600" />
                              Corporate Logo
                            </div>
                          )}
                          {exportSettings.watermark && (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-success-600" />
                              Watermark Enabled
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export Actions */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                        Export Actions
                      </h2>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                          <Download className="w-4 h-4" />
                          Export Now
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                          Preview Document
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <Mail className="w-4 h-4" />
                          Email to Recipients
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="dark:bg-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                        Export History
                      </h2>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Last Export:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            Today, 10:30 AM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Total Exports:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            47 documents
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Most Used:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            PDF (89%)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.totalViews}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Total Views
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.uniqueViewers}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Unique Viewers
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.avgCompletion}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Avg Completion
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stats.totalDownloads}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Downloads
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Viewer Logs Table */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Detailed Viewer Logs
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Viewer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Document
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            First Opened
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Last Accessed
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Completion
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {mockViewerLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {log.user}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                  {log.role}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-900 dark:text-white max-w-xs truncate">
                              {log.document}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {log.openedAt}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {log.lastAccessed}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {log.duration}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full",
                                      log.completionPercent === 100
                                        ? "bg-success-500"
                                        : log.completionPercent >= 75
                                          ? "bg-primary-600"
                                          : "bg-warning-500",
                                    )}
                                    style={{
                                      width: `${log.completionPercent}%`,
                                    }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    getCompletionColor(log.completionPercent),
                                  )}
                                >
                                  {log.completionPercent}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {log.actions.slice(0, 2).map((action, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                                  >
                                    {action}
                                  </span>
                                ))}
                                {log.actions.length > 2 && (
                                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">
                                    +{log.actions.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
