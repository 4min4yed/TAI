"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCardData, MetricIconKey } from "@/types/dashboard";

// Icon mapping: iconKey → Lucide component
const ICON_MAP: Record<MetricIconKey, LucideIcon> = {
  fileText: FileText,
  dollarSign: DollarSign,
  award: Award,
  clock: Clock,
  checkCircle: CheckCircle,
  alertTriangle: AlertTriangle,
  users: Users,
  barChart: BarChart,
};

interface MetricCardsProps {
  metrics: MetricCardData[];
}

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, idx) => {
        const Icon = ICON_MAP[metric.iconKey];

        return (
          <Card
            key={metric.key}
            className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {metric.value}
                </h2>
                {metric.changePct !== undefined && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        metric.trend === "up"
                          ? "success"
                          : metric.trend === "down"
                            ? "danger"
                            : "default"
                      }
                      className="flex items-center gap-1"
                    >
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : metric.trend === "down" ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : null}
                      {Math.abs(metric.changePct)}%
                    </Badge>
                    {metric.changeLabel && (
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {metric.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
