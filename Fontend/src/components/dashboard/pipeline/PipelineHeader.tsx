import React from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Plus } from "lucide-react";

interface PipelineHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onNewTender?: () => void;
}

/**
 * Pipeline page header with actions
 */
export function PipelineHeader({
  onRefresh,
  onExport,
  onNewTender,
}: PipelineHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tender & Procurement Pipeline
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage all your active tenders and track progress in real-time
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={onNewTender}>
            <Plus className="w-4 h-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>
    </div>
  );
}
