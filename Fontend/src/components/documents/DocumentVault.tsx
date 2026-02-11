"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  History,
  GitBranch,
  Eye,
  Package,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentStatus = "Valid" | "Expiring Soon" | "Expired" | "Pending";
type DocumentType =
  | "Certificate"
  | "Financial"
  | "Legal"
  | "Technical"
  | "Insurance";

interface DocumentVersion {
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  changes: string;
}

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadDate: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  validityPeriod?: number;
  currentVersion: string;
  versions: DocumentVersion[];
  tags: string[];
  department: string;
  requiredForTenderTypes?: string[];
}

const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    name: "ISO 9001 Certificate",
    type: "Certificate",
    status: "Valid",
    uploadDate: "2024-01-15",
    expiryDate: "2026-12-31",
    daysUntilExpiry: 335,
    validityPeriod: 1095,
    currentVersion: "v2.1",
    versions: [
      {
        version: "v2.1",
        uploadedBy: "Ali ben Ali",
        uploadedAt: "2025-11-10",
        fileSize: "2.3 MB",
        changes: "Updated certificate with new scope",
      },
      {
        version: "v2.0",
        uploadedBy: "Sarah Chen",
        uploadedAt: "2024-06-15",
        fileSize: "2.1 MB",
        changes: "Annual renewal",
      },
      {
        version: "v1.0",
        uploadedBy: "Marc Dubois",
        uploadedAt: "2024-01-15",
        fileSize: "2.0 MB",
        changes: "Initial certificate",
      },
    ],
    tags: ["Quality", "ISO", "Critical"],
    department: "Quality Assurance",
    requiredForTenderTypes: ["Construction", "Services", "Supply"],
  },
  {
    id: "DOC-002",
    name: "Financial Statements 2025",
    type: "Financial",
    status: "Valid",
    uploadDate: "2026-01-05",
    expiryDate: "2027-01-05",
    daysUntilExpiry: 340,
    validityPeriod: 365,
    currentVersion: "v1.2",
    versions: [
      {
        version: "v1.2",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2026-01-20",
        fileSize: "5.8 MB",
        changes: "Added Q4 amendments",
      },
      {
        version: "v1.1",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2026-01-10",
        fileSize: "5.5 MB",
        changes: "Minor corrections",
      },
      {
        version: "v1.0",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2026-01-05",
        fileSize: "5.5 MB",
        changes: "Initial 2025 statements",
      },
    ],
    tags: ["Finance", "Annual", "Audited"],
    department: "Finance",
    requiredForTenderTypes: ["Construction", "Large Projects"],
  },
  {
    id: "DOC-003",
    name: "Insurance Certificate",
    type: "Insurance",
    status: "Expiring Soon",
    uploadDate: "2025-02-01",
    expiryDate: "2026-03-15",
    daysUntilExpiry: 44,
    validityPeriod: 408,
    currentVersion: "v1.0",
    versions: [
      {
        version: "v1.0",
        uploadedBy: "Ali ben Ali",
        uploadedAt: "2025-02-01",
        fileSize: "1.2 MB",
        changes: "Professional liability insurance",
      },
    ],
    tags: ["Insurance", "Urgent", "Renewal Required"],
    department: "Legal",
    requiredForTenderTypes: ["Construction", "Services"],
  },
  {
    id: "DOC-004",
    name: "ISO 14001 Certificate",
    type: "Certificate",
    status: "Expired",
    uploadDate: "2023-03-10",
    expiryDate: "2026-01-20",
    daysUntilExpiry: -10,
    validityPeriod: 1046,
    currentVersion: "v1.0",
    versions: [
      {
        version: "v1.0",
        uploadedBy: "Marc Dubois",
        uploadedAt: "2023-03-10",
        fileSize: "1.8 MB",
        changes: "Environmental management certification",
      },
    ],
    tags: ["Environment", "ISO", "Expired"],
    department: "HSE",
    requiredForTenderTypes: ["Construction"],
  },
  {
    id: "DOC-005",
    name: "Tax Clearance 2025",
    type: "Legal",
    status: "Valid",
    uploadDate: "2026-01-10",
    expiryDate: "2026-12-31",
    daysUntilExpiry: 335,
    validityPeriod: 356,
    currentVersion: "v1.0",
    versions: [
      {
        version: "v1.0",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2026-01-10",
        fileSize: "0.8 MB",
        changes: "2025 tax clearance from revenue authority",
      },
    ],
    tags: ["Tax", "Legal", "Annual"],
    department: "Finance",
    requiredForTenderTypes: ["All"],
  },
  {
    id: "DOC-006",
    name: "Health & Safety Plan",
    type: "Technical",
    status: "Valid",
    uploadDate: "2025-06-15",
    expiryDate: "2027-06-15",
    daysUntilExpiry: 501,
    validityPeriod: 731,
    currentVersion: "v3.5",
    versions: [
      {
        version: "v3.5",
        uploadedBy: "Marc Dubois",
        uploadedAt: "2026-01-15",
        fileSize: "4.2 MB",
        changes: "Updated COVID-19 protocols",
      },
      {
        version: "v3.0",
        uploadedBy: "Marc Dubois",
        uploadedAt: "2025-09-01",
        fileSize: "3.9 MB",
        changes: "Major safety procedure updates",
      },
      {
        version: "v2.0",
        uploadedBy: "Ali ben Ali",
        uploadedAt: "2025-06-15",
        fileSize: "3.5 MB",
        changes: "Biennial update",
      },
    ],
    tags: ["HSE", "Safety", "Critical"],
    department: "HSE",
    requiredForTenderTypes: ["Construction"],
  },
];

export default function DocumentVault() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | "All">(
    "All",
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPackageWizard, setShowPackageWizard] = useState(false);
  const [selectedTenderType, setSelectedTenderType] =
    useState<string>("Construction");

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" || doc.type === selectedType;
    const matchesStatus =
      selectedStatus === "All" || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: DocumentStatus, daysUntilExpiry?: number) => {
    if (status === "Expired")
      return "text-danger-700 dark:text-danger-300 bg-danger-100 dark:bg-danger-900/30";
    if (
      status === "Expiring Soon" ||
      (daysUntilExpiry && daysUntilExpiry < 30)
    ) {
      return "text-warning-700 dark:text-warning-300 bg-warning-100 dark:bg-warning-900/30";
    }
    if (daysUntilExpiry && daysUntilExpiry < 90) {
      return "text-warning-700 dark:text-warning-300 bg-warning-100 dark:bg-warning-900/30";
    }
    return "text-success-700 dark:text-success-300 bg-success-100 dark:bg-success-900/30";
  };

  const getExpiryIcon = (status: DocumentStatus, daysUntilExpiry?: number) => {
    if (status === "Expired") return <AlertTriangle className="w-4 h-4" />;
    if (
      status === "Expiring Soon" ||
      (daysUntilExpiry && daysUntilExpiry < 30)
    ) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (daysUntilExpiry && daysUntilExpiry < 90) {
      return <Clock className="w-4 h-4" />;
    }
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const expiringDocs = documents.filter(
    (d) => d.daysUntilExpiry && d.daysUntilExpiry < 90 && d.daysUntilExpiry > 0,
  );
  const expiredDocs = documents.filter((d) => d.status === "Expired");

  const requiredDocsForTender = documents.filter((doc) =>
    doc.requiredForTenderTypes?.includes(selectedTenderType),
  );
  const availableRequiredDocs = requiredDocsForTender.filter(
    (doc) => doc.status === "Valid",
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Document Vault
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Version control • Expiration alerts • Auto-selection for tender
                packages
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPackageWizard(!showPackageWizard)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
              >
                <Package className="w-4 h-4" />
                Tender Package Wizard
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Alerts */}
          {(expiringDocs.length > 0 || expiredDocs.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {expiredDocs.length > 0 && (
                <Card className="bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-danger-600 dark:text-danger-400" />
                      <div>
                        <div className="text-2xl font-bold text-danger-900 dark:text-danger-100">
                          {expiredDocs.length}
                        </div>
                        <div className="text-sm text-danger-700 dark:text-danger-300">
                          Expired Documents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {expiringDocs.length > 0 && (
                <Card className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-warning-600 dark:text-warning-400" />
                      <div>
                        <div className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                          {expiringDocs.length}
                        </div>
                        <div className="text-sm text-warning-700 dark:text-warning-300">
                          Expiring Soon (&lt; 90 days)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as DocumentType | "All")
              }
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="Certificate">Certificate</option>
              <option value="Financial">Financial</option>
              <option value="Legal">Legal</option>
              <option value="Technical">Technical</option>
              <option value="Insurance">Insurance</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as DocumentStatus | "All")
              }
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {showPackageWizard && (
            <Card className="mb-6 dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Tender Package Auto-Selection
                  </h3>
                  <button
                    onClick={() => setShowPackageWizard(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Select Tender Type:
                    </label>
                    <select
                      value={selectedTenderType}
                      onChange={(e) => setSelectedTenderType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option>Construction</option>
                      <option>Services</option>
                      <option>Supply</option>
                      <option>Large Projects</option>
                    </select>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        Required Documents
                      </h4>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {availableRequiredDocs.length}/
                        {requiredDocsForTender.length} Available
                      </span>
                    </div>
                    <div className="space-y-2">
                      {requiredDocsForTender.map((doc) => (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded",
                            doc.status === "Valid"
                              ? "bg-success-100 dark:bg-success-900/30"
                              : "bg-danger-100 dark:bg-danger-900/30",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {doc.status === "Valid" ? (
                              <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                            )}
                            <span
                              className={cn(
                                "text-sm",
                                doc.status === "Valid"
                                  ? "text-success-900 dark:text-success-100"
                                  : "text-danger-900 dark:text-danger-100",
                              )}
                            >
                              {doc.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {doc.id}
                          </span>
                        </div>
                      ))}
                    </div>
                    {availableRequiredDocs.length ===
                      requiredDocsForTender.length && (
                      <button className="mt-4 w-full px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700">
                        Generate Complete Package
                      </button>
                    )}
                    {availableRequiredDocs.length <
                      requiredDocsForTender.length && (
                      <div className="mt-4 p-3 bg-danger-100 dark:bg-danger-900/30 rounded text-sm text-danger-700 dark:text-danger-300">
                        ⚠️ Missing{" "}
                        {requiredDocsForTender.length -
                          availableRequiredDocs.length}{" "}
                        required document(s). Please upload or renew before
                        proceeding.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="dark:bg-slate-900 dark:border-slate-700"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {doc.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {doc.type}
                        </span>
                        <span
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium",
                            getStatusColor(doc.status, doc.daysUntilExpiry),
                          )}
                        >
                          {getExpiryIcon(doc.status, doc.daysUntilExpiry)}
                          {doc.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {doc.currentVersion}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {doc.department} • Uploaded {doc.uploadDate}
                      </div>
                      {doc.expiryDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Expires: {doc.expiryDate}
                          </span>
                          {doc.daysUntilExpiry !== undefined && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                doc.daysUntilExpiry < 0 &&
                                  "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
                                doc.daysUntilExpiry >= 0 &&
                                  doc.daysUntilExpiry < 30 &&
                                  "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
                                doc.daysUntilExpiry >= 30 &&
                                  doc.daysUntilExpiry < 90 &&
                                  "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
                                doc.daysUntilExpiry >= 90 &&
                                  "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
                              )}
                            >
                              {doc.daysUntilExpiry < 0
                                ? `Expired ${Math.abs(doc.daysUntilExpiry)} days ago`
                                : `${doc.daysUntilExpiry} days remaining`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowVersionHistory(!showVersionHistory);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <History className="w-4 h-4" />
                        Version History
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  {showVersionHistory && selectedDocument?.id === doc.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Version History ({doc.versions.length} versions)
                      </h4>
                      <div className="space-y-3">
                        {doc.versions.map((version, idx) => (
                          <div
                            key={version.version}
                            className={cn(
                              "p-3 rounded",
                              idx === 0
                                ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                                : "bg-slate-100 dark:bg-slate-800",
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-xs font-bold",
                                    idx === 0
                                      ? "bg-primary-600 text-white"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
                                  )}
                                >
                                  {version.version}
                                  {idx === 0 && " (Current)"}
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {version.fileSize}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {idx !== 0 && (
                                  <button className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Restore
                                  </button>
                                )}
                                <button className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                                  Download
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              {version.changes}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Uploaded by {version.uploadedBy} on{" "}
                              {version.uploadedAt}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
