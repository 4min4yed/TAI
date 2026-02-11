import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Euro,
  User,
  BarChart3,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { formatRelativeDate } from "@/lib";

interface TenderCardProps {
  id: string;
  title: string;
  client: string;
  status: string;
  value: number;
  deadline: string;
  complianceScore: number;
  assignee: string;
  progress: number;
  compact?: boolean;
}

const STATUS_VARIANTS = {
  new: "secondary" as const,
  in_progress: "default" as const,
  in_review: "warning" as const,
  ready_to_submit: "success" as const,
  submitted: "outline" as const,
};

/**
 * Tender card component
 * Displays tender information in a card format
 */
export function TenderCard({
  id,
  title,
  client,
  status,
  value,
  deadline,
  complianceScore,
  assignee,
  progress,
  compact = false,
}: TenderCardProps) {
  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-success-600";
    if (score >= 70) return "text-warning-600";
    return "text-danger-600";
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h4>
          <p className="text-xs text-slate-500 mb-2">{client}</p>
          <div className="flex items-center justify-between text-xs">
            <span className={getComplianceColor(complianceScore)}>
              {complianceScore}%
            </span>
            <span className="text-slate-500">
              {formatRelativeDate(deadline, "left")}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {client}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS]}
            >
              {status.replace(/_/g, " ")}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Value</p>
              <p className="text-sm font-semibold">
                €{(value / 1000).toFixed(0)}K
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Deadline</p>
              <p className="text-sm font-semibold">
                {formatRelativeDate(deadline, "left")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Compliance</p>
              <p
                className={`text-sm font-semibold ${getComplianceColor(complianceScore)}`}
              >
                {complianceScore}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Assignee</p>
              <p className="text-sm font-semibold">{assignee}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
