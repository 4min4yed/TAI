"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  FileText,
  Users,
  BarChart3,
  LayoutGrid,
  List,
  Download,
  Plus,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Tag,
  MapPin,
  Euro,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tender, TenderStatus, Priority, DashboardStats } from "@/types/tender";
import { getTimeRemaining, getUrgencyLevel, cn } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";

// Mock data - will be replaced with API calls
const mockTenders: Tender[] = [
  {
    id: "1",
    title: "Healthcare Equipment Supply - Region Nord",
    buyer: "Ministry of Health",
    status: "in_progress",
    priority: "high",
    deadline: "2026-02-15T23:59:59",
    compliance_percentage: 78,
    missing_documents: 3,
    total_value: 2500000,
    currency: "EUR",
    assignee: "Sarah Johnson",
    created_at: "2026-01-15T10:00:00",
    updated_at: "2026-01-29T14:30:00",
    description: "Supply of medical equipment for 5 hospitals",
    tags: ["healthcare", "equipment", "public-sector"],
  },
  {
    id: "2",
    title: "IT Infrastructure Modernization",
    buyer: "Public Works Department",
    status: "ready_to_submit",
    priority: "high",
    deadline: "2026-02-08T17:00:00",
    compliance_percentage: 95,
    missing_documents: 1,
    total_value: 1800000,
    currency: "EUR",
    assignee: "Michael Chen",
    created_at: "2026-01-10T09:00:00",
    updated_at: "2026-01-30T11:00:00",
    description: "Network upgrade and server replacement",
    tags: ["IT", "infrastructure", "public-sector"],
  },
  {
    id: "3",
    title: "Construction - New Community Center",
    buyer: "City Council",
    status: "in_review",
    priority: "medium",
    deadline: "2026-03-01T18:00:00",
    compliance_percentage: 82,
    missing_documents: 2,
    total_value: 5000000,
    currency: "EUR",
    assignee: "Emma Williams",
    created_at: "2025-12-20T08:00:00",
    updated_at: "2026-01-28T16:45:00",
    description: "Design and construction of 3500sqm facility",
    tags: ["construction", "public-works"],
  },
  {
    id: "4",
    title: "Consulting Services - Digital Transformation",
    buyer: "Transport Authority",
    status: "new",
    priority: "low",
    deadline: "2026-03-20T23:59:59",
    compliance_percentage: 45,
    missing_documents: 8,
    total_value: 750000,
    currency: "EUR",
    assignee: "Unassigned",
    created_at: "2026-01-28T13:00:00",
    updated_at: "2026-01-28T13:00:00",
    description: "Strategy and implementation support",
    tags: ["consulting", "digital", "transformation"],
  },
  {
    id: "5",
    title: "Emergency Response Vehicles",
    buyer: "Fire Department",
    status: "in_progress",
    priority: "high",
    deadline: "2026-02-05T12:00:00",
    compliance_percentage: 88,
    missing_documents: 2,
    total_value: 3200000,
    currency: "EUR",
    assignee: "David Brown",
    created_at: "2026-01-05T07:30:00",
    updated_at: "2026-01-30T09:15:00",
    description: "Purchase of 12 specialized fire trucks",
    tags: ["vehicles", "emergency", "public-safety"],
  },
  {
    id: "6",
    title: "Education Software Platform",
    buyer: "Education Ministry",
    status: "submitted",
    priority: "medium",
    deadline: "2026-01-31T23:59:59",
    compliance_percentage: 100,
    missing_documents: 0,
    total_value: 980000,
    currency: "EUR",
    assignee: "Lisa Anderson",
    created_at: "2025-12-15T10:00:00",
    updated_at: "2026-01-25T17:00:00",
    description: "Learning management system for 500 schools",
    tags: ["software", "education", "SaaS"],
  },
];

const mockStats: DashboardStats = {
  total_tenders: 24,
  active_tenders: 18,
  compliance_avg: 81,
  pending_tasks: 47,
  upcoming_deadlines: 6,
  red_flags: 3,
};

const statusConfig: Record<
  TenderStatus,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "danger"
      | "outline";
  }
> = {
  new: { label: "New", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  in_review: { label: "In Review", variant: "warning" },
  ready_to_submit: { label: "Ready to Submit", variant: "success" },
  submitted: { label: "Submitted", variant: "outline" },
  won: { label: "Won", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-600" },
  medium: { label: "Medium", color: "text-warning-600" },
  high: { label: "High", color: "text-danger-600" },
};

export default function Dashboard() {
  const [selectedStatus, setSelectedStatus] = useState<TenderStatus | "all">(
    "all",
  );
  const [selectedPriority, setSelectedPriority] = useState<Priority | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [sortBy, setSortBy] = useState<"deadline" | "value" | "compliance">(
    "deadline",
  );
  const [selectedTenders, setSelectedTenders] = useState<string[]>([]);

  const filteredTenders = useMemo(() => {
    let filtered = mockTenders.filter((tender) => {
      const matchesStatus =
        selectedStatus === "all" || tender.status === selectedStatus;
      const matchesPriority =
        selectedPriority === "all" || tender.priority === selectedPriority;
      const matchesSearch =
        searchQuery === "" ||
        tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tender.buyer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "value":
          return b.total_value - a.total_value;
        case "compliance":
          return b.compliance_percentage - a.compliance_percentage;
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedStatus, selectedPriority, searchQuery, sortBy]);

  const getComplianceColor = (percentage: number): string => {
    if (percentage >= 90) return "text-success-600";
    if (percentage >= 70) return "text-warning-600";
    return "text-danger-600";
  };

  const getDeadlineDisplay = (deadline: string) => {
    const { days, hours, minutes, isOverdue } = getTimeRemaining(deadline);

    if (isOverdue) {
      return (
        <span className="text-danger-600 dark:text-danger-400 font-semibold">
          Overdue
        </span>
      );
    }

    if (days > 0) {
      return (
        <span
          className={cn(
            "font-semibold",
            days <= 2
              ? "text-danger-600 dark:text-danger-400"
              : days <= 7
                ? "text-warning-600 dark:text-warning-400"
                : "text-success-600 dark:text-success-400",
          )}
        >
          {days}d {hours}h
        </span>
      );
    }

    return (
      <span className="text-danger-600 dark:text-danger-400 font-semibold">
        {hours}h {minutes}m
      </span>
    );
  };

  const toggleTenderSelection = (tenderId: string) => {
    setSelectedTenders((prev) =>
      prev.includes(tenderId)
        ? prev.filter((id) => id !== tenderId)
        : [...prev, tenderId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedTenders.length === filteredTenders.length) {
      setSelectedTenders([]);
    } else {
      setSelectedTenders(filteredTenders.map((t) => t.id));
    }
  };

  // Group tenders by status for Kanban view
  const kanbanColumns: Record<TenderStatus, Tender[]> = {
    new: filteredTenders.filter((t) => t.status === "new"),
    in_progress: filteredTenders.filter((t) => t.status === "in_progress"),
    in_review: filteredTenders.filter((t) => t.status === "in_review"),
    ready_to_submit: filteredTenders.filter(
      (t) => t.status === "ready_to_submit",
    ),
    submitted: filteredTenders.filter((t) => t.status === "submitted"),
    won: filteredTenders.filter((t) => t.status === "won"),
    lost: filteredTenders.filter((t) => t.status === "lost"),
    cancelled: filteredTenders.filter((t) => t.status === "cancelled"),
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-full">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Tender & Procurement Pipeline
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage all your active tenders and track progress in real-time
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Tender
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Insights Panel */}
          <div className="px-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Tenders
                  </CardTitle>
                  <FileText className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {mockStats.active_tenders}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    of {mockStats.total_tenders} total
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg Compliance
                  </CardTitle>
                  <CheckCircle2 className="w-4 h-4 text-success-500 dark:text-success-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success-600 dark:text-success-400">
                    {mockStats.compliance_avg}%
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    +5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Upcoming Deadlines
                  </CardTitle>
                  <Clock className="w-4 h-4 text-warning-500 dark:text-warning-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                    {mockStats.upcoming_deadlines}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Next 7 days
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Red Flags
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-danger-500 dark:text-danger-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-danger-600 dark:text-danger-400">
                    {mockStats.red_flags}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Require attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6 bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by title, buyer, or keywords..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <select
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as TenderStatus | "all")
                    }
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="ready_to_submit">Ready to Submit</option>
                    <option value="submitted">Submitted</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={selectedPriority}
                    onChange={(e) =>
                      setSelectedPriority(e.target.value as Priority | "all")
                    }
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>

                  {/* Sort By */}
                  <select
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as "deadline" | "value" | "compliance",
                      )
                    }
                  >
                    <option value="deadline">Sort: Deadline</option>
                    <option value="value">Sort: Value</option>
                    <option value="compliance">Sort: Compliance</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredTenders.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">{mockTenders.length}</span>{" "}
                    tenders
                    {selectedTenders.length > 0 && (
                      <span className="ml-2">
                        ({selectedTenders.length} selected)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTenders.length > 0 && (
                      <div className="flex gap-2 mr-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Bulk Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-1 border border-slate-300 dark:border-slate-700 rounded-md p-1">
                      <button
                        className={cn(
                          "px-3 py-1 rounded text-sm",
                          viewMode === "list"
                            ? "bg-primary-600 text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                        onClick={() => setViewMode("list")}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        className={cn(
                          "px-3 py-1 rounded text-sm",
                          viewMode === "kanban"
                            ? "bg-primary-600 text-white"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                        onClick={() => setViewMode("kanban")}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3">
                {filteredTenders.map((tender) => (
                  <Card
                    key={tender.id}
                    className="hover:shadow-lg transition-all hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer bg-white dark:bg-slate-900"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Checkbox */}
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedTenders.includes(tender.id)}
                            onChange={() => toggleTenderSelection(tender.id)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                        </div>

                        {/* Title and Buyer */}
                        <div className="col-span-12 lg:col-span-5">
                          <Link
                            href={`/tenders/${tender.id}`}
                            className="block"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 truncate hover:text-primary-600 dark:hover:text-primary-400">
                                  {tender.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <Users className="w-4 h-4" />
                                  {tender.buyer}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge
                                    variant={
                                      statusConfig[tender.status].variant
                                    }
                                  >
                                    {statusConfig[tender.status].label}
                                  </Badge>
                                  <span
                                    className={cn(
                                      "text-xs font-medium",
                                      priorityConfig[tender.priority].color,
                                    )}
                                  >
                                    {priorityConfig[tender.priority].label}{" "}
                                    Priority
                                  </span>
                                  {tender.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Metrics */}
                        <div className="col-span-12 lg:col-span-4">
                          <div className="grid grid-cols-3 gap-4">
                            {/* Compliance */}
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                Compliance
                              </div>
                              <div
                                className={cn(
                                  "text-2xl font-bold",
                                  getComplianceColor(
                                    tender.compliance_percentage,
                                  ),
                                )}
                              >
                                {tender.compliance_percentage}%
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                <div
                                  className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    tender.compliance_percentage >= 90
                                      ? "bg-success-500"
                                      : tender.compliance_percentage >= 70
                                        ? "bg-warning-500"
                                        : "bg-danger-500",
                                  )}
                                  style={{
                                    width: `${tender.compliance_percentage}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Missing Docs */}
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                Missing
                              </div>
                              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {tender.missing_documents}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                documents
                              </div>
                            </div>

                            {/* Value */}
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                Value
                              </div>
                              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {(tender.total_value / 1000000).toFixed(1)}M
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {tender.currency}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Deadline and Actions */}
                        <div className="col-span-12 lg:col-span-2">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  Time Remaining
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  {getDeadlineDisplay(tender.deadline)}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link
                                href={`/tenders/${tender.id}`}
                                className="flex-1"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Kanban View */}
            {viewMode === "kanban" && (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {Object.entries(kanbanColumns).map(([status, tenders]) => (
                    <div
                      key={status}
                      className="flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {statusConfig[status as TenderStatus].label}
                        </h3>
                        <Badge variant="secondary">{tenders.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {tenders.map((tender) => (
                          <Link key={tender.id} href={`/tenders/${tender.id}`}>
                            <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
                                  {tender.title}
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                  {tender.buyer}
                                </p>
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Compliance
                                  </span>
                                  <span
                                    className={cn(
                                      "font-semibold",
                                      getComplianceColor(
                                        tender.compliance_percentage,
                                      ),
                                    )}
                                  >
                                    {tender.compliance_percentage}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Deadline
                                  </span>
                                  {getDeadlineDisplay(tender.deadline)}
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                  <Badge
                                    variant={
                                      priorityConfig[tender.priority].label ===
                                      "High"
                                        ? "danger"
                                        : priorityConfig[tender.priority]
                                              .label === "Medium"
                                          ? "warning"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {priorityConfig[tender.priority].label}{" "}
                                    Priority
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTenders.length === 0 && (
              <Card className="bg-white dark:bg-slate-900">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No tenders found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Try adjusting your filters or search query
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
