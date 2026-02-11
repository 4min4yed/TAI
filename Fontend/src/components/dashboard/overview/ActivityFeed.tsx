"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Award,
  RefreshCw,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { ActivityItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

// Mock data for standalone usage
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1" as any,
    type: "submission",
    message: "New tender submitted for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user: "Sarah Johnson",
    userAvatar: undefined,
  },
  {
    id: "act-2" as any,
    type: "approval",
    message: "Tender #2045 approved by compliance team",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user: "Mike Chen",
    userAvatar: undefined,
  },
  {
    id: "act-3" as any,
    type: "deadline",
    message: "Deadline approaching for RFP-2024-089",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user: "System",
    userAvatar: undefined,
  },
  {
    id: "act-4" as any,
    type: "update",
    message: "Document updated in Tender #2043",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: "Emily Rodriguez",
    userAvatar: undefined,
  },
];

export default function ActivityFeed({
  activities = MOCK_ACTIVITIES,
}: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return <CheckCircle2 className="w-4 h-4 text-success-600" />;
      case "approval":
      case "upload":
        return <Award className="w-4 h-4 text-primary-600" />;
      case "update":
      case "review":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "deadline":
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "submission":
        return "bg-success-100 dark:bg-success-900/30";
      case "approval":
      case "upload":
        return "bg-primary-100 dark:bg-primary-900/30";
      case "update":
      case "review":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "deadline":
        return "bg-warning-100 dark:bg-warning-900/30";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className="bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </CardTitle>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  getActivityColor(activity.type),
                )}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.message}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        by {activity.user}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
