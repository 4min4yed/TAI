"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Portal {
  id: string;
  name: string;
  country: string;
  flag: string;
  url: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  supportedFormats: string[];
  authentication: "oauth" | "api_key" | "certificate";
  autoSubmit: boolean;
  requirements: string[];
}

interface Submission {
  id: string;
  portalId: string;
  tenderRef: string;
  title: string;
  submittedAt: string;
  status: "draft" | "validating" | "submitted" | "accepted" | "rejected";
  documents: number;
  validationErrors: number;
  validationWarnings: number;
}

const mockPortals: Portal[] = [
  {
    id: "TUNEPS",
    name: "TUNEPS (Tunisia National e-Procurement)",
    country: "Tunisia",
    flag: "🇹🇳",
    url: "https://www.tuneps.tn",
    status: "connected",
    lastSync: "2026-01-08 14:30",
    supportedFormats: ["PDF/A-1", "PDF/A-2", "DOCX", "XML"],
    authentication: "certificate",
    autoSubmit: true,
    requirements: [
      "Digital signature with certified authority",
      "Company RC number registration",
      "CNSS compliance certificate",
      "Tax clearance certificate",
      "Bank guarantee (1-3% bid value)",
    ],
  },
  {
    id: "MOROCCO_PPMP",
    name: "Morocco PPMP (Public Procurement Portal)",
    country: "Morocco",
    flag: "🇲🇦",
    url: "https://www.marchespublics.gov.ma",
    status: "connected",
    lastSync: "2026-01-08 13:15",
    supportedFormats: ["PDF", "DOCX", "XML"],
    authentication: "oauth",
    autoSubmit: false,
    requirements: [
      "CNSS affiliation certificate",
      "Tax compliance certificate",
      "Professional qualification certificate",
      "Bank guarantee (2% bid value)",
      "Articles of incorporation",
    ],
  },
  {
    id: "GCC_TENDER",
    name: "GCC Unified Tender Platform",
    country: "GCC",
    flag: "🇸🇦",
    url: "https://www.gcctenders.com",
    status: "connected",
    lastSync: "2026-01-08 12:00",
    supportedFormats: ["PDF", "DOCX"],
    authentication: "api_key",
    autoSubmit: true,
    requirements: [
      "Commercial registration certificate",
      "Zakat certificate (KSA) or equivalent",
      "Bank guarantee (1-2% bid value)",
      "Technical qualification certificate",
      "Local agent declaration (for foreign companies)",
    ],
  },
  {
    id: "FRANCE_PLACE",
    name: "France PLACE (Plateforme des Achats de l'État)",
    country: "France",
    flag: "🇫🇷",
    url: "https://www.marches-publics.gouv.fr",
    status: "disconnected",
    lastSync: "2026-01-05 09:20",
    supportedFormats: ["PDF", "DOCX", "XML", "ASICE"],
    authentication: "certificate",
    autoSubmit: false,
    requirements: [
      "SIRET number",
      "URSSAF compliance certificate",
      "Tax compliance certificate",
      "Professional liability insurance",
      "DC1 and DC2 forms",
    ],
  },
  {
    id: "ALGERIA_PORTAL",
    name: "Algeria Public Tenders Portal",
    country: "Algeria",
    flag: "🇩🇿",
    url: "https://www.marchespublics-dz.com",
    status: "error",
    lastSync: "2026-01-03 16:45",
    supportedFormats: ["PDF", "DOCX"],
    authentication: "api_key",
    autoSubmit: false,
    requirements: [
      "Contractor registration certificate",
      "CNAS affiliation certificate",
      "Tax compliance certificate",
      "Bank guarantee",
      "49/51 local partnership (for foreign companies)",
    ],
  },
];

const mockSubmissions: Submission[] = [
  {
    id: "SUB-001",
    portalId: "TUNEPS",
    tenderRef: "TUNEPS-2026-IT-045",
    title: "IT Infrastructure Modernization",
    submittedAt: "2026-01-08 10:30",
    status: "accepted",
    documents: 12,
    validationErrors: 0,
    validationWarnings: 0,
  },
  {
    id: "SUB-002",
    portalId: "MOROCCO_PPMP",
    tenderRef: "PPMP-2026-SEC-023",
    title: "Cybersecurity Implementation",
    submittedAt: "2026-01-07 15:20",
    status: "validating",
    documents: 8,
    validationErrors: 0,
    validationWarnings: 2,
  },
  {
    id: "SUB-003",
    portalId: "GCC_TENDER",
    tenderRef: "GCC-2026-TECH-089",
    title: "Smart City Platform Development",
    submittedAt: "2026-01-06 14:00",
    status: "submitted",
    documents: 15,
    validationErrors: 0,
    validationWarnings: 0,
  },
  {
    id: "SUB-004",
    portalId: "TUNEPS",
    tenderRef: "TUNEPS-2026-TRAIN-012",
    title: "Training & Capacity Building",
    submittedAt: "2026-01-05 11:45",
    status: "draft",
    documents: 5,
    validationErrors: 3,
    validationWarnings: 5,
  },
];

export default function PublicPortalSubmission() {
  const [activeTab, setActiveTab] = useState<
    "portals" | "submissions" | "validation"
  >("portals");
  const [portals] = useState<Portal[]>(mockPortals);
  const [submissions] = useState<Submission[]>(mockSubmissions);

  const tabs = [
    { id: "portals" as const, label: "Connected Portals", icon: Globe },
    { id: "submissions" as const, label: "Submissions", icon: Send },
    { id: "validation" as const, label: "Validation Status", icon: Shield },
  ];

  const getStatusColor = (status: Portal["status"]) => {
    switch (status) {
      case "connected":
        return "text-success-600 dark:text-success-400";
      case "disconnected":
        return "text-slate-600 dark:text-slate-400";
      case "error":
        return "text-danger-600 dark:text-danger-400";
    }
  };

  const getStatusBg = (status: Portal["status"]) => {
    switch (status) {
      case "connected":
        return "bg-success-100 dark:bg-success-900/30";
      case "disconnected":
        return "bg-slate-100 dark:bg-slate-800";
      case "error":
        return "bg-danger-100 dark:bg-danger-900/30";
    }
  };

  const getSubmissionStatusColor = (status: Submission["status"]) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "validating":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "submitted":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "accepted":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300";
      case "rejected":
        return "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300";
    }
  };

  const connectedPortals = portals.filter(
    (p) => p.status === "connected",
  ).length;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Public Portal Auto-Submission
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Automated submission to national procurement portals (TUNEPS,
                Morocco, GCC)
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <RefreshCw className="w-4 h-4" />
                Sync All Portals
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Upload className="w-4 h-4" />
                New Submission
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {connectedPortals}/{portals.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Portals Connected
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {submissions.length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Total Submissions
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                {submissions.filter((s) => s.status === "accepted").length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Accepted
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {submissions.reduce((sum, s) => sum + s.validationWarnings, 0)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Warnings
              </div>
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
          {activeTab === "portals" && (
            <div className="space-y-4">
              {portals.map((portal) => (
                <Card
                  key={portal.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{portal.flag}</span>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {portal.name}
                            </h3>
                            <div
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                                getStatusBg(portal.status),
                              )}
                            >
                              {portal.status === "connected" && (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              {portal.status === "error" && (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              {portal.status === "disconnected" && (
                                <Server className="w-3.5 h-3.5" />
                              )}
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  getStatusColor(portal.status),
                                )}
                              >
                                {portal.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                          >
                            {portal.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          Configure
                        </button>
                        <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                          Test Connection
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Authentication
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {portal.authentication
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Last Sync
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {portal.lastSync}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          Auto-Submit
                        </div>
                        <div className="flex items-center gap-2">
                          {portal.autoSubmit ? (
                            <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                          )}
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {portal.autoSubmit ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Supported Formats
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {portal.supportedFormats.map((format) => (
                          <span
                            key={format}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-mono"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Required Documents
                      </div>
                      <ul className="space-y-1">
                        {portal.requirements.map((req, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const portal = portals.find(
                  (p) => p.id === submission.portalId,
                );
                return (
                  <Card
                    key={submission.id}
                    className="dark:bg-slate-900 dark:border-slate-700"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {submission.title}
                            </h3>
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                getSubmissionStatusColor(submission.status),
                              )}
                            >
                              {submission.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span>{portal?.flag}</span>
                              <span>{portal?.name}</span>
                            </span>
                            <span>•</span>
                            <span>Ref: {submission.tenderRef}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Submitted At
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {submission.submittedAt}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Documents
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {submission.documents} files
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Validation Errors
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.validationErrors > 0 ? (
                              <>
                                <AlertCircle className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                                <span className="text-sm font-medium text-danger-600 dark:text-danger-400">
                                  {submission.validationErrors} errors
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                                <span className="text-sm font-medium text-success-600 dark:text-success-400">
                                  No errors
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Warnings
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.validationWarnings > 0 ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                                <span className="text-sm font-medium text-warning-600 dark:text-warning-400">
                                  {submission.validationWarnings} warnings
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                                <span className="text-sm font-medium text-success-600 dark:text-success-400">
                                  No warnings
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === "validation" && (
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Format Validation & Compliance Checks
                </h3>
                <div className="space-y-6">
                  {submissions
                    .filter(
                      (s) => s.validationErrors > 0 || s.validationWarnings > 0,
                    )
                    .map((submission) => {
                      const portal = portals.find(
                        (p) => p.id === submission.portalId,
                      );
                      return (
                        <div
                          key={submission.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span>{portal?.flag}</span>
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {submission.title}
                            </h4>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              ({submission.tenderRef})
                            </span>
                          </div>

                          {submission.validationErrors > 0 && (
                            <div className="mb-3 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                                <span className="font-semibold text-danger-900 dark:text-danger-300">
                                  {submission.validationErrors} Critical Errors
                                </span>
                              </div>
                              <ul className="space-y-1 text-sm text-danger-700 dark:text-danger-300">
                                <li>
                                  • PDF/A-1 compliance failed: embedded fonts
                                  not subset
                                </li>
                                <li>
                                  • Missing digital signature on technical offer
                                </li>
                                <li>
                                  • Bank guarantee amount below minimum
                                  threshold (1%)
                                </li>
                              </ul>
                            </div>
                          )}

                          {submission.validationWarnings > 0 && (
                            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                                <span className="font-semibold text-warning-900 dark:text-warning-300">
                                  {submission.validationWarnings} Warnings
                                </span>
                              </div>
                              <ul className="space-y-1 text-sm text-warning-700 dark:text-warning-300">
                                <li>
                                  • Document exceeds recommended size (8MB)
                                </li>
                                <li>
                                  • CNSS certificate expires within 30 days
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {submissions.filter(
                    (s) =>
                      s.validationErrors === 0 && s.validationWarnings === 0,
                  ).length > 0 && (
                    <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400" />
                        <span className="font-semibold text-success-900 dark:text-success-300">
                          {
                            submissions.filter(
                              (s) =>
                                s.validationErrors === 0 &&
                                s.validationWarnings === 0,
                            ).length
                          }{" "}
                          submission(s) passed all validation checks
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
