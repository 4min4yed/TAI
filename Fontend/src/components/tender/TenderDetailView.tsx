"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  DollarSign,
  FileCheck,
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  X,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  TenderDetailData,
  TenderDocument,
  TenderSection,
  TeamType,
} from "@/types/tender-detail";

// Mock data
const mockTenderDetail: TenderDetailData = {
  id: "1",
  title: "Healthcare Equipment Supply - Region Nord",
  buyer: "Ministry of Health",
  status: "in_progress",
  deadline: "2026-02-15T23:59:59",
  created_at: "2026-01-15T10:00:00",
  documents: [
    {
      id: "doc-1",
      name: "RFP_Healthcare_Equipment_2026.pdf",
      type: "pdf",
      size: 2458624,
      uploaded_at: "2026-01-15T10:30:00",
      uploaded_by: "Sarah Johnson",
      url: "/documents/rfp-1.pdf",
      status: "ready",
      page_count: 45,
    },
    {
      id: "doc-2",
      name: "Technical_Specifications.xlsx",
      type: "xlsx",
      size: 156789,
      uploaded_at: "2026-01-16T14:20:00",
      uploaded_by: "Michael Chen",
      url: "/documents/specs-1.xlsx",
      status: "ready",
    },
  ],
  metadata: {
    buyer_name: "Ministry of Health",
    buyer_contact: "procurement@health.gov",
    deadline: "2026-02-15T23:59:59",
    submission_method: "online",
    reference_number: "MOH-2026-RFP-001",
    contract_duration: "24 months",
    lots: [
      {
        id: "lot-1",
        number: "1",
        title: "Medical Imaging Equipment",
        description: "MRI scanners, CT scanners, and ultrasound machines",
        estimated_value: 1500000,
        currency: "EUR",
      },
      {
        id: "lot-2",
        number: "2",
        title: "Laboratory Equipment",
        description: "Blood analyzers, chemistry analyzers, microscopes",
        estimated_value: 800000,
        currency: "EUR",
      },
    ],
    evaluation_criteria: [
      { id: "ec-1", name: "Technical Quality", weight: 40 },
      { id: "ec-2", name: "Price", weight: 35 },
      { id: "ec-3", name: "After-sales Service", weight: 15 },
      { id: "ec-4", name: "Delivery Timeline", weight: 10 },
    ],
    required_documents: [
      {
        id: "rd-1",
        name: "Company Registration Certificate",
        mandatory: true,
        status: "uploaded",
      },
      {
        id: "rd-2",
        name: "Financial Statements (3 years)",
        mandatory: true,
        status: "uploaded",
      },
      {
        id: "rd-3",
        name: "ISO 9001 Certification",
        mandatory: true,
        status: "missing",
      },
      {
        id: "rd-4",
        name: "Reference Projects List",
        mandatory: true,
        status: "uploaded",
      },
      {
        id: "rd-5",
        name: "Technical Brochures",
        mandatory: false,
        status: "validated",
      },
    ],
    budget_indicators: [
      {
        id: "bi-1",
        type: "estimated_budget",
        value: "2,500,000",
        currency: "EUR",
      },
      { id: "bi-2", type: "quantity", value: "50", unit: "units" },
    ],
  },
  sections: [
    {
      id: "sec-1",
      name: "Technical Proposal",
      description:
        "Equipment specifications, technical approach, and implementation plan",
      assigned_team: "technical",
      progress: 75,
      validation_status: "in_progress",
      assigned_users: ["Sarah Johnson", "Michael Chen"],
      deadline: "2026-02-10T17:00:00",
      comments_count: 12,
      last_updated: "2026-01-29T16:45:00",
      subsections: [
        {
          id: "sub-1",
          name: "Equipment Specifications",
          completed: true,
          required: true,
        },
        {
          id: "sub-2",
          name: "Technical Approach",
          completed: true,
          required: true,
        },
        {
          id: "sub-3",
          name: "Implementation Plan",
          completed: false,
          required: true,
        },
        {
          id: "sub-4",
          name: "Quality Assurance",
          completed: false,
          required: true,
        },
      ],
    },
    {
      id: "sec-2",
      name: "Legal & Compliance",
      description: "Contractual terms, legal compliance, and certifications",
      assigned_team: "legal",
      progress: 90,
      validation_status: "ready_for_review",
      assigned_users: ["Emma Williams"],
      deadline: "2026-02-08T17:00:00",
      comments_count: 5,
      last_updated: "2026-01-28T11:20:00",
      subsections: [
        {
          id: "sub-5",
          name: "Contract Review",
          completed: true,
          required: true,
        },
        {
          id: "sub-6",
          name: "Compliance Checklist",
          completed: true,
          required: true,
        },
        {
          id: "sub-7",
          name: "Certifications",
          completed: true,
          required: true,
        },
        {
          id: "sub-8",
          name: "Insurance Documents",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "sec-3",
      name: "Financial Proposal",
      description: "Pricing breakdown, payment terms, and financial guarantees",
      assigned_team: "pricing",
      progress: 60,
      validation_status: "in_progress",
      assigned_users: ["David Brown", "Lisa Anderson"],
      deadline: "2026-02-12T17:00:00",
      comments_count: 8,
      last_updated: "2026-01-30T09:15:00",
      subsections: [
        {
          id: "sub-9",
          name: "Price Breakdown",
          completed: true,
          required: true,
        },
        {
          id: "sub-10",
          name: "Payment Terms",
          completed: true,
          required: true,
        },
        {
          id: "sub-11",
          name: "Financial Guarantees",
          completed: false,
          required: true,
        },
        {
          id: "sub-12",
          name: "Cost Optimization",
          completed: false,
          required: false,
        },
      ],
    },
    {
      id: "sec-4",
      name: "Management & Timeline",
      description:
        "Project management plan, delivery schedule, and resource allocation",
      assigned_team: "management",
      progress: 45,
      validation_status: "in_progress",
      assigned_users: ["Sarah Johnson"],
      deadline: "2026-02-11T17:00:00",
      comments_count: 3,
      last_updated: "2026-01-27T14:30:00",
      subsections: [
        {
          id: "sub-13",
          name: "Project Timeline",
          completed: true,
          required: true,
        },
        {
          id: "sub-14",
          name: "Resource Allocation",
          completed: false,
          required: true,
        },
        {
          id: "sub-15",
          name: "Risk Management",
          completed: false,
          required: true,
        },
        {
          id: "sub-16",
          name: "Stakeholder Communication",
          completed: false,
          required: false,
        },
      ],
    },
  ],
  team_members: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "technical",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael@company.com",
      role: "technical",
    },
    {
      id: "3",
      name: "Emma Williams",
      email: "emma@company.com",
      role: "legal",
    },
    {
      id: "4",
      name: "David Brown",
      email: "david@company.com",
      role: "pricing",
    },
    {
      id: "5",
      name: "Lisa Anderson",
      email: "lisa@company.com",
      role: "pricing",
    },
  ],
};

const teamConfig: Record<
  TeamType,
  { label: string; color: string; bgColor: string }
> = {
  technical: {
    label: "Technical",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  legal: { label: "Legal", color: "text-purple-700", bgColor: "bg-purple-100" },
  pricing: {
    label: "Pricing",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  management: {
    label: "Management",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
};

const validationStatusConfig = {
  not_started: {
    label: "Not Started",
    variant: "secondary" as const,
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    variant: "default" as const,
    icon: Clock,
  },
  ready_for_review: {
    label: "Ready for Review",
    variant: "warning" as const,
    icon: AlertCircle,
  },
  validated: {
    label: "Validated",
    variant: "success" as const,
    icon: CheckCircle2,
  },
  rejected: { label: "Rejected", variant: "danger" as const, icon: XCircle },
};

export default function TenderDetailView() {
  const [tender] = useState<TenderDetailData>(mockTenderDetail);
  const [activeSection, setActiveSection] = useState<string>(
    tender.sections[0].id,
  );
  const [selectedDocument, setSelectedDocument] =
    useState<TenderDocument | null>(tender.documents[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
    // Handle file upload
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const activeSectionData = tender.sections.find((s) => s.id === activeSection);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 min-h-full">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <div className="h-6 w-px bg-slate-300" />
                <Badge variant="default">In Progress</Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {tender.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tender.buyer}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Deadline: Feb 15, 2026
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  €2.5M
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Sections Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tender.sections.map((section) => {
                  const StatusIcon =
                    validationStatusConfig[section.validation_status].icon;
                  const isActive = section.id === activeSection;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all",
                        isActive
                          ? "bg-primary-50 border-2 border-primary-500 shadow-sm"
                          : "bg-white border border-slate-200 hover:border-primary-300 hover:shadow-sm",
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-primary-700" : "text-slate-900",
                          )}
                        >
                          {section.name}
                        </span>
                        <StatusIcon
                          className={cn(
                            "w-4 h-4",
                            section.validation_status === "validated"
                              ? "text-success-600"
                              : section.validation_status === "ready_for_review"
                                ? "text-warning-600"
                                : "text-slate-400",
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              section.progress >= 90
                                ? "bg-success-500"
                                : section.progress >= 70
                                  ? "bg-primary-500"
                                  : section.progress >= 50
                                    ? "bg-warning-500"
                                    : "bg-orange-500",
                            )}
                            style={{ width: `${section.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {section.progress}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-medium",
                            teamConfig[section.assigned_team].color,
                            teamConfig[section.assigned_team].bgColor,
                          )}
                        >
                          {teamConfig[section.assigned_team].label}
                        </span>
                        <span className="text-slate-500">
                          {section.comments_count} comments
                        </span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Document Upload & Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Documents
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUploadArea(!showUploadArea)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showUploadArea && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "mb-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      isDragging
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-300 hover:border-primary-400",
                    )}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Drag and drop files here
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      or click to browse (PDF, DOCX, XLSX, ZIP - max 50MB)
                    </p>
                    <Button size="sm" variant="outline">
                      Browse Files
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tender.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedDocument?.id === doc.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:border-primary-300 bg-white",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            doc.type === "pdf"
                              ? "bg-red-100"
                              : doc.type === "xlsx"
                                ? "bg-green-100"
                                : "bg-blue-100",
                          )}
                        >
                          <FileText
                            className={cn(
                              "w-5 h-5",
                              doc.type === "pdf"
                                ? "text-red-600"
                                : doc.type === "xlsx"
                                  ? "text-green-600"
                                  : "text-blue-600",
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                            <span>{formatFileSize(doc.size)}</span>
                            {doc.page_count && (
                              <>
                                <span>•</span>
                                <span>{doc.page_count} pages</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Uploaded by {doc.uploaded_by}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Metadata */}
            {tender.metadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-success-600" />
                    Extracted Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Reference Number
                      </label>
                      <p className="text-sm text-slate-900">
                        {tender.metadata.reference_number}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Buyer
                      </label>
                      <p className="text-sm text-slate-900">
                        {tender.metadata.buyer_name}
                      </p>
                      {tender.metadata.buyer_contact && (
                        <p className="text-xs text-slate-600">
                          {tender.metadata.buyer_contact}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Contract Duration
                      </label>
                      <p className="text-sm text-slate-900">
                        {tender.metadata.contract_duration}
                      </p>
                    </div>
                  </div>

                  {/* Lots */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                      Lots ({tender.metadata.lots.length})
                    </label>
                    <div className="space-y-2">
                      {tender.metadata.lots.map((lot) => (
                        <div
                          key={lot.id}
                          className="p-2 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                Lot {lot.number}: {lot.title}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {lot.description}
                              </p>
                            </div>
                            {lot.estimated_value && (
                              <span className="text-sm font-bold text-primary-600 ml-2">
                                €{(lot.estimated_value / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                      Evaluation Criteria
                    </label>
                    <div className="space-y-2">
                      {tender.metadata.evaluation_criteria.map((criterion) => (
                        <div
                          key={criterion.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded"
                        >
                          <span className="text-sm text-slate-900">
                            {criterion.name}
                          </span>
                          <span className="text-sm font-bold text-primary-600">
                            {criterion.weight}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Documents */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                      Required Documents
                    </label>
                    <div className="space-y-2">
                      {tender.metadata.required_documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {doc.status === "validated" && (
                              <CheckCircle2 className="w-4 h-4 text-success-600" />
                            )}
                            {doc.status === "uploaded" && (
                              <Clock className="w-4 h-4 text-warning-600" />
                            )}
                            {doc.status === "missing" && (
                              <XCircle className="w-4 h-4 text-danger-600" />
                            )}
                            {doc.status === "rejected" && (
                              <AlertCircle className="w-4 h-4 text-danger-600" />
                            )}
                            <span className="text-sm text-slate-900">
                              {doc.name}
                            </span>
                          </div>
                          {doc.mandatory && (
                            <Badge variant="danger" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Section Details */}
            {activeSectionData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {activeSectionData.name}
                        <Badge
                          variant={
                            validationStatusConfig[
                              activeSectionData.validation_status
                            ].variant
                          }
                        >
                          {
                            validationStatusConfig[
                              activeSectionData.validation_status
                            ].label
                          }
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {activeSectionData.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Section Info */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Assigned Team
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            teamConfig[activeSectionData.assigned_team].color,
                            teamConfig[activeSectionData.assigned_team].bgColor,
                          )}
                        >
                          {teamConfig[activeSectionData.assigned_team].label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Progress
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${activeSectionData.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {activeSectionData.progress}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">
                        Team Members
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        {activeSectionData.assigned_users.map((user, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-xs font-bold text-primary-700"
                            title={user}
                          >
                            {user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subsections */}
                  {activeSectionData.subsections && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Tasks
                      </label>
                      {activeSectionData.subsections.map((subsection) => (
                        <div
                          key={subsection.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-2 transition-colors",
                            subsection.completed
                              ? "bg-success-50 border-success-200"
                              : "bg-white border-slate-200",
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              subsection.completed
                                ? "bg-success-500 border-success-500"
                                : "border-slate-300",
                            )}
                          >
                            {subsection.completed && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "flex-1 text-sm",
                              subsection.completed
                                ? "text-slate-600 line-through"
                                : "text-slate-900 font-medium",
                            )}
                          >
                            {subsection.name}
                          </span>
                          {subsection.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                    <Button variant="outline">Add Comment</Button>
                    <Button variant="outline">Attach Files</Button>
                    <div className="flex-1" />
                    {activeSectionData.validation_status === "in_progress" && (
                      <Button>Mark as Ready for Review</Button>
                    )}
                    {activeSectionData.validation_status ===
                      "ready_for_review" && (
                      <Button
                        variant="default"
                        className="bg-success-600 hover:bg-success-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Validate Section
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
