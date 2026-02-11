"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Bell,
  Calendar,
  UserPlus,
  FileText,
  History,
  Send,
  Filter,
  ChevronRight,
  Eye,
  Edit,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TaskStatus = "pending" | "in-progress" | "review" | "completed";
type TaskRole = "technical" | "legal" | "pricing" | "reviewer" | "manager";

interface Task {
  id: string;
  title: string;
  section: string;
  assignedTo: string;
  role: TaskRole;
  status: TaskStatus;
  deadline: string;
  priority: "high" | "medium" | "low";
  comments: number;
  progress: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: "assignment" | "comment" | "status" | "upload" | "edit";
}

interface DocumentVersion {
  id: string;
  version: string;
  author: string;
  date: string;
  changes: string;
  size: string;
}

const mockTasks: Task[] = [
  {
    id: "T-001",
    title: "Technical Architecture Description",
    section: "Section 3.2",
    assignedTo: "Sarah Chen",
    role: "technical",
    status: "in-progress",
    deadline: "2026-02-05",
    priority: "high",
    comments: 3,
    progress: 65,
  },
  {
    id: "T-002",
    title: "Legal Compliance Review",
    section: "Section 5.1",
    assignedTo: "Marc Dubois",
    role: "legal",
    status: "pending",
    deadline: "2026-02-03",
    priority: "high",
    comments: 1,
    progress: 0,
  },
  {
    id: "T-003",
    title: "Pricing Model & Cost Breakdown",
    section: "Section 7.4",
    assignedTo: "You",
    role: "pricing",
    status: "review",
    deadline: "2026-02-02",
    priority: "medium",
    comments: 5,
    progress: 100,
  },
  {
    id: "T-004",
    title: "Final Proposal Review",
    section: "All Sections",
    assignedTo: "Ali ben Ali",
    role: "manager",
    status: "pending",
    deadline: "2026-02-08",
    priority: "high",
    comments: 0,
    progress: 0,
  },
  {
    id: "T-005",
    title: "Environmental Impact Assessment",
    section: "Section 4.3",
    assignedTo: "Emma Rodriguez",
    role: "technical",
    status: "completed",
    deadline: "2026-01-28",
    priority: "medium",
    comments: 2,
    progress: 100,
  },
];

const mockActivity: ActivityItem[] = [
  {
    id: "A-001",
    user: "Ali ben Ali",
    action: "assigned",
    target: "Legal Compliance Review to Marc Dubois",
    timestamp: "2 minutes ago",
    type: "assignment",
  },
  {
    id: "A-002",
    user: "Sarah Chen",
    action: "updated",
    target: "Technical Architecture Description to 65%",
    timestamp: "15 minutes ago",
    type: "edit",
  },
  {
    id: "A-003",
    user: "Marc Dubois",
    action: "commented on",
    target: "Legal Compliance Review",
    timestamp: "1 hour ago",
    type: "comment",
  },
  {
    id: "A-004",
    user: "Emma Rodriguez",
    action: "completed",
    target: "Environmental Impact Assessment",
    timestamp: "2 hours ago",
    type: "status",
  },
  {
    id: "A-005",
    user: "You",
    action: "uploaded",
    target: "Cost Breakdown v3.2.xlsx",
    timestamp: "3 hours ago",
    type: "upload",
  },
];

const mockVersions: DocumentVersion[] = [
  {
    id: "V-004",
    version: "3.2",
    author: "Ali ben Ali",
    date: "Jan 30, 2026 14:30",
    changes: "Updated pricing model, added risk analysis",
    size: "2.4 MB",
  },
  {
    id: "V-003",
    version: "3.1",
    author: "Sarah Chen",
    date: "Jan 29, 2026 16:45",
    changes: "Technical section improvements, architecture diagrams",
    size: "2.1 MB",
  },
  {
    id: "V-002",
    version: "3.0",
    author: "Marc Dubois",
    date: "Jan 28, 2026 11:20",
    changes: "Legal compliance updates, contract terms revision",
    size: "1.9 MB",
  },
  {
    id: "V-001",
    version: "2.5",
    author: "Emma Rodriguez",
    date: "Jan 27, 2026 09:15",
    changes: "Initial draft with core sections",
    size: "1.5 MB",
  },
];

export default function WorkflowCollaboration() {
  const [activeTab, setActiveTab] = useState<"tasks" | "activity" | "versions">(
    "tasks",
  );
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const tabs = [
    {
      id: "tasks" as const,
      label: "Tasks & Assignments",
      icon: Users,
      count: tasks.filter((t) => t.status !== "completed").length,
    },
    {
      id: "activity" as const,
      label: "Activity Timeline",
      icon: History,
      count: mockActivity.length,
    },
    {
      id: "versions" as const,
      label: "Document Versions",
      icon: FileText,
      count: mockVersions.length,
    },
  ];

  const getRoleColor = (role: TaskRole) => {
    switch (role) {
      case "technical":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "legal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "pricing":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "reviewer":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "manager":
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "review":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300";
      case "completed":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <AlertCircle className="w-4 h-4" />;
      case "review":
        return <Eye className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-danger-500";
      case "medium":
        return "border-l-4 border-l-warning-500";
      case "low":
        return "border-l-4 border-l-slate-300";
      default:
        return "";
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "assignment":
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "status":
        return <CheckCircle2 className="w-4 h-4 text-success-600" />;
      case "upload":
        return <Download className="w-4 h-4 text-primary-600" />;
      case "edit":
        return <Edit className="w-4 h-4 text-orange-600" />;
    }
  };

  const myTasks = tasks.filter(
    (t) => t.assignedTo === "You" && t.status !== "completed",
  );

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Workflow & Collaboration
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage tasks, track activity, and collaborate with your team
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {myTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs text-white">
                    {myTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Assign Task
              </button>
            </div>
          </div>

          {/* Waiting for Action Alert */}
          {myTasks.length > 0 && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-warning-900 dark:text-warning-200">
                    Waiting for Your Action
                  </h3>
                  <p className="text-sm text-warning-700 dark:text-warning-300 mt-0.5">
                    You have {myTasks.length} pending{" "}
                    {myTasks.length === 1 ? "task" : "tasks"} requiring your
                    attention
                  </p>
                </div>
                <button className="text-sm font-medium text-warning-700 dark:text-warning-300 hover:text-warning-800 dark:hover:text-warning-200">
                  View All <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          )}

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
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "tasks" && (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-700",
                    getPriorityColor(task.priority),
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                            {task.title}
                          </h3>
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium",
                              getRoleColor(task.role),
                            )}
                          >
                            {task.role.charAt(0).toUpperCase() +
                              task.role.slice(1)}
                          </span>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              getStatusColor(task.status),
                            )}
                          >
                            {getStatusIcon(task.status)}
                            {task.status
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(" ")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {task.section} • Assigned to{" "}
                          <span className="font-medium">{task.assignedTo}</span>
                        </p>

                        {/* Progress Bar */}
                        {task.progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                Progress
                              </span>
                              <span className="text-xs font-medium text-slate-900 dark:text-white">
                                {task.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full transition-all",
                                  task.progress === 100
                                    ? "bg-success-500"
                                    : "bg-primary-600",
                                )}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>Due {task.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{task.comments} comments</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="max-w-4xl">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-6">
                  {mockActivity.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <Card className="dark:bg-slate-900 dark:border-slate-700">
                          <CardContent className="p-4">
                            <p className="text-sm text-slate-900 dark:text-white">
                              <span className="font-semibold">
                                {activity.user}
                              </span>{" "}
                              <span className="text-slate-600 dark:text-slate-400">
                                {activity.action}
                              </span>{" "}
                              <span className="font-medium">
                                {activity.target}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {activity.timestamp}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="max-w-4xl space-y-4">
              {mockVersions.map((version) => (
                <Card
                  key={version.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Version {version.version}
                          </h3>
                          <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                            Latest
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {version.changes}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {version.author}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {version.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            {version.size}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
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
