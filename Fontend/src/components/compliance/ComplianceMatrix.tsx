"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  Filter,
  Search,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  Upload,
  FileSpreadsheet,
  FilePlus,
  ChevronDown,
  History,
  TrendingUp,
  Link,
  Target,
  Award,
  PieChart,
  Calendar,
  User,
  Edit,
  BarChart3,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceStatus = "Yes" | "Partial" | "No" | "Pending";
type RequirementCategory = "Mandatory" | "Weighted" | "Optional";

interface Requirement {
  id: string;
  text: string;
  category: RequirementCategory;
  status: ComplianceStatus;
  evidence: string;
  justification: string;
  weight?: number;
  score?: number;
  linkedAnnexes?: string[];
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action:
    | "created"
    | "updated"
    | "status_changed"
    | "evidence_added"
    | "annex_linked";
  field?: string;
  oldValue?: string;
  newValue?: string;
  requirementId: string;
}

const mockRequirements: Requirement[] = [
  {
    id: "REQ-001",
    text: "Company must have ISO 9001 certification",
    category: "Mandatory",
    status: "Yes",
    evidence: "ISO-9001-Certificate.pdf",
    justification: "Valid ISO 9001:2015 certificate attached, expires 2026",
    linkedAnnexes: ["DOC-001", "DOC-005"],
  },
  {
    id: "REQ-004",
    text: "Environmental management system in place",
    category: "Weighted",
    status: "Yes",
    evidence: "ISO-14001-Certificate.pdf",
    justification: "ISO 14001 certified since 2020",
    weight: 20,
    score: 20,
    linkedAnnexes: ["DOC-004"],
  },
  {
    id: "REQ-005",
    text: "Local workforce participation plan",
    category: "Weighted",
    status: "Yes",
    evidence: "Workforce-Plan.docx",
    justification: "Committed to 60% local hiring",
    weight: 15,
    score: 15,
    linkedAnnexes: ["DOC-006"],
  },
  {
    id: "REQ-009",
    text: "Quality management procedures documented",
    category: "Weighted",
    status: "Yes",
    evidence: "QM-Procedures.pdf",
    justification: "Comprehensive QM manual with 50+ procedures",
    weight: 10,
    score: 10,
    linkedAnnexes: ["DOC-007"],
  },
  {
    id: "REQ-010",
    text: "Past performance references",
    category: "Weighted",
    status: "Partial",
    evidence: "References.pdf",
    justification: "3 out of 5 required references provided",
    weight: 25,
    score: 15,
    linkedAnnexes: ["DOC-008", "DOC-009"],
  },
  {
    id: "REQ-011",
    text: "Health & Safety certification",
    category: "Weighted",
    status: "Yes",
    evidence: "OHSAS-18001.pdf",
    justification: "OHSAS 18001 certified, transitioning to ISO 45001",
    weight: 15,
    score: 15,
    linkedAnnexes: ["DOC-010"],
  },
  {
    id: "REQ-012",
    text: "Risk management framework",
    category: "Weighted",
    status: "Partial",
    evidence: "Risk-Framework.docx",
    justification: "Framework in place, needs formal certification",
    weight: 15,
    score: 10,
    linkedAnnexes: [],
  },
];

const mockAuditTrail: AuditEntry[] = [
  {
    id: "AUDIT-001",
    timestamp: "2026-01-30 14:23",
    user: "Ali ben Ali",
    action: "status_changed",
    field: "status",
    oldValue: "Pending",
    newValue: "Yes",
    requirementId: "REQ-004",
  },
  {
    id: "AUDIT-002",
    timestamp: "2026-01-30 14:15",
    user: "Ali ben Ali",
    action: "evidence_added",
    field: "evidence",
    newValue: "ISO-14001-Certificate.pdf",
    requirementId: "REQ-004",
  },
  {
    id: "AUDIT-003",
    timestamp: "2026-01-30 13:45",
    user: "Sarah Chen",
    action: "updated",
    field: "justification",
    oldValue: "",
    newValue: "ISO 14001 certified since 2020",
    requirementId: "REQ-004",
  },
  {
    id: "AUDIT-004",
    timestamp: "2026-01-30 11:30",
    user: "Marc Dubois",
    action: "annex_linked",
    newValue: "DOC-004",
    requirementId: "REQ-004",
  },
  {
    id: "AUDIT-005",
    timestamp: "2026-01-29 16:20",
    user: "Ali ben Ali",
    action: "created",
    requirementId: "REQ-004",
  },
  {
    id: "AUDIT-006",
    timestamp: "2026-01-30 10:15",
    user: "Emma Rodriguez",
    action: "status_changed",
    field: "status",
    oldValue: "Yes",
    newValue: "Partial",
    requirementId: "REQ-010",
  },
  {
    id: "AUDIT-007",
    timestamp: "2026-01-30 09:30",
    user: "Ali ben Ali",
    action: "annex_linked",
    newValue: "DOC-008",
    requirementId: "REQ-010",
  },
];

export default function ComplianceMatrix() {
  const [requirements, setRequirements] =
    useState<Requirement[]>(mockRequirements);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"matrix" | "scoring" | "audit">(
    "matrix",
  );
  const [auditTrail] = useState<AuditEntry[]>(mockAuditTrail);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(
    null,
  );

  const tabs = [
    { id: "matrix" as const, label: "Compliance Matrix", icon: FileText },
    { id: "scoring" as const, label: "Weighted Scoring", icon: Target },
    { id: "audit" as const, label: "Audit Trail", icon: History },
  ];

  const weightedRequirements = requirements.filter(
    (r) => r.category === "Weighted",
  );
  const totalWeight = weightedRequirements.reduce(
    (sum, r) => sum + (r.weight || 0),
    0,
  );
  const achievedScore = weightedRequirements.reduce(
    (sum, r) => sum + (r.score || 0),
    0,
  );
  const weightedScorePercentage =
    totalWeight > 0 ? Math.round((achievedScore / totalWeight) * 100) : 0;

  const mandatoryRequirements = requirements.filter(
    (r) => r.category === "Mandatory",
  );
  const mandatoryCompliant = mandatoryRequirements.filter(
    (r) => r.status === "Yes",
  ).length;
  const mandatoryPercentage =
    mandatoryRequirements.length > 0
      ? Math.round((mandatoryCompliant / mandatoryRequirements.length) * 100)
      : 0;

  const getAuditIcon = (action: AuditEntry["action"]) => {
    switch (action) {
      case "created":
        return <Plus className="w-4 h-4 text-blue-600" />;
      case "updated":
        return <Edit className="w-4 h-4 text-purple-600" />;
      case "status_changed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "evidence_added":
        return <Upload className="w-4 h-4 text-primary-600" />;
      case "annex_linked":
        return <Link className="w-4 h-4 text-orange-600" />;
    }
  };

  const updateWeight = (reqId: string, weight: number) => {
    setRequirements((reqs) =>
      reqs.map((r) => (r.id === reqId ? { ...r, weight } : r)),
    );
  };

  const updateScore = (reqId: string, score: number) => {
    setRequirements((reqs) =>
      reqs.map((r) => (r.id === reqId ? { ...r, score } : r)),
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Compliance Matrix
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Weighted scoring • Linked annexes • Full audit trail
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Export Audit Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {weightedScorePercentage}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Weighted Score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-success-600 dark:text-success-400" />
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {mandatoryPercentage}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Mandatory Compliance
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Link className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {requirements.reduce(
                        (sum, r) => sum + (r.linkedAnnexes?.length || 0),
                        0,
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Linked Annexes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {auditTrail.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Audit Entries
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          {activeTab === "matrix" && (
            <div className="space-y-4">
              {requirements.map((req) => (
                <Card
                  key={req.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {req.id}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              req.category === "Mandatory" &&
                                "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300",
                              req.category === "Weighted" &&
                                "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
                              req.category === "Optional" &&
                                "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
                            )}
                          >
                            {req.category}
                          </span>
                          {req.weight && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              Weight: {req.weight}%
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {req.text}
                        </h3>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                          req.status === "Yes" &&
                            "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
                          req.status === "Partial" &&
                            "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
                          req.status === "No" &&
                            "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
                          req.status === "Pending" &&
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {req.status === "Yes" && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {req.status === "Partial" && (
                          <MinusCircle className="w-4 h-4" />
                        )}
                        {req.status === "No" && (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {req.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Evidence
                        </div>
                        {req.evidence ? (
                          <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                            <Paperclip className="w-4 h-4" />
                            <span>{req.evidence}</span>
                          </div>
                        ) : (
                          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600">
                            <Upload className="w-4 h-4" />
                            Upload evidence
                          </button>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Justification
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {req.justification || "No justification provided"}
                        </p>
                      </div>
                    </div>

                    {req.linkedAnnexes && req.linkedAnnexes.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                          <Link className="w-3.5 h-3.5" />
                          Linked Annexes ({req.linkedAnnexes.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {req.linkedAnnexes.map((annex, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium flex items-center gap-1.5"
                            >
                              <FileText className="w-3 h-3" />
                              {annex}
                              <button className="hover:text-purple-900 dark:hover:text-purple-100">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          <button className="px-2.5 py-1 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded text-xs font-medium hover:border-primary-600 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400">
                            + Add Annex
                          </button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "scoring" && (
            <div className="space-y-6">
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Weighted Score Breakdown
                  </h3>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Overall Weighted Score
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {achievedScore}/{totalWeight} ({weightedScorePercentage}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-primary-600 to-success-600 h-4 rounded-full transition-all flex items-center justify-end px-2"
                        style={{ width: `${weightedScorePercentage}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {weightedScorePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {weightedRequirements.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                              {req.text}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {req.id}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {req.score}/{req.weight}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              points
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                              Weight (%)
                            </label>
                            <input
                              type="number"
                              value={req.weight || 0}
                              onChange={(e) =>
                                updateWeight(req.id, Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                              Score Achieved (%)
                            </label>
                            <input
                              type="number"
                              value={req.score || 0}
                              onChange={(e) =>
                                updateScore(req.id, Number(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              min="0"
                              max={req.weight || 100}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all",
                                (req.score! / req.weight!) * 100 >= 80 &&
                                  "bg-success-600",
                                (req.score! / req.weight!) * 100 >= 50 &&
                                  (req.score! / req.weight!) * 100 < 80 &&
                                  "bg-warning-600",
                                (req.score! / req.weight!) * 100 < 50 &&
                                  "bg-danger-600",
                              )}
                              style={{
                                width: `${(req.score! / req.weight!) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Score Distribution
                  </h3>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {weightedRequirements.map((req) => {
                      const percentage = (req.score! / req.weight!) * 100;
                      return (
                        <div
                          key={req.id}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {percentage.toFixed(0)}%
                          </div>
                          <div
                            className={cn(
                              "w-full rounded-t transition-all",
                              percentage >= 80 && "bg-success-600",
                              percentage >= 50 &&
                                percentage < 80 &&
                                "bg-warning-600",
                              percentage < 50 && "bg-danger-600",
                            )}
                            style={{ height: `${percentage}%` }}
                          />
                          <div className="text-xs text-center text-slate-600 dark:text-slate-400">
                            {req.id}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "audit" && (
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Complete Audit Trail
                </h3>
                <div className="space-y-3">
                  {auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div>{getAuditIcon(entry.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-white capitalize">
                            {entry.action.replace("_", " ")}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            •
                          </span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {entry.requirementId}
                          </span>
                        </div>
                        {entry.field && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            Field:{" "}
                            <span className="font-mono text-primary-600 dark:text-primary-400">
                              {entry.field}
                            </span>
                          </div>
                        )}
                        {entry.oldValue && entry.newValue && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Changed from{" "}
                            <span className="px-2 py-0.5 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded font-mono text-xs">
                              {entry.oldValue}
                            </span>
                            {" to "}
                            <span className="px-2 py-0.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded font-mono text-xs">
                              {entry.newValue}
                            </span>
                          </div>
                        )}
                        {!entry.oldValue && entry.newValue && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Added:{" "}
                            <span className="px-2 py-0.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded font-mono text-xs">
                              {entry.newValue}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
