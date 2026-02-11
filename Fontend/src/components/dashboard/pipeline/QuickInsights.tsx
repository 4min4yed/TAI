import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface QuickInsight {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

interface QuickInsightsProps {
  activeTenders: number;
  totalTenders: number;
  complianceAvg: number;
  upcomingDeadlines: number;
  redFlags: number;
}

/**
 * Quick insights panel for pipeline metrics
 */
export function QuickInsights({
  activeTenders,
  totalTenders,
  complianceAvg,
  upcomingDeadlines,
  redFlags,
}: QuickInsightsProps) {
  const insights: QuickInsight[] = [
    {
      label: "Active Tenders",
      value: activeTenders,
      subtitle: `of ${totalTenders} total`,
      icon: FileText,
      color: "text-primary-500 dark:text-primary-400",
    },
    {
      label: "Avg Compliance",
      value: complianceAvg,
      subtitle: "+5% from last month",
      icon: CheckCircle2,
      color: "text-success-500 dark:text-success-400",
      trend: "up",
    },
    {
      label: "Upcoming Deadlines",
      value: upcomingDeadlines,
      subtitle: "Next 7 days",
      icon: Clock,
      color: "text-warning-500 dark:text-warning-400",
    },
    {
      label: "Red Flags",
      value: redFlags,
      subtitle: "Require attention",
      icon: AlertTriangle,
      color: "text-danger-500 dark:text-danger-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight) => (
        <Card
          key={insight.label}
          className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {insight.label}
            </CardTitle>
            <insight.icon className={`w-4 h-4 ${insight.color}`} />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                insight.label === "Avg Compliance"
                  ? "text-success-600 dark:text-success-400"
                  : insight.label === "Upcoming Deadlines"
                    ? "text-warning-600 dark:text-warning-400"
                    : insight.label === "Red Flags"
                      ? "text-danger-600 dark:text-danger-400"
                      : "text-slate-900 dark:text-white"
              }`}
            >
              {insight.label === "Avg Compliance"
                ? `${insight.value}%`
                : insight.value}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {insight.trend && <TrendingUp className="w-3 h-3 inline mr-1" />}
              {insight.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
