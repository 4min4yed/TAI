"use client";

import React, { useState } from "react";
import { PipelineHeader, QuickInsights } from "./index";
import { PipelineFilters } from "./PipelineFilters";
import { PipelineList } from "./PipelineList";
import { PipelineKanban } from "./PipelineKanban";
import { usePipelineData, useFilters } from "@/hooks";
import { LoadingSpinner, ErrorState } from "@/components/common";
import { ViewMode } from "@/types/dashboard";

/**
 * Dashboard Pipeline Component
 * Main tender pipeline view with filters, list/kanban views, and actions
 */
export function DashboardPipeline() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { data, loading, error, refreshData } = usePipelineData();
  const { filters, updateStatus, updateSort, updateSearchQuery, resetFilters } =
    useFilters();

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleExport = () => {
    console.log("Exporting pipeline data...");
  };

  const handleNewTender = () => {
    console.log("Creating new tender...");
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading pipeline data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />;
  }

  // Mock stats for now (will come from API)
  const stats = {
    activeTenders: 18,
    totalTenders: 24,
    complianceAvg: 81,
    upcomingDeadlines: 6,
    redFlags: 3,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-full">
      <PipelineHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        onNewTender={handleNewTender}
      />

      <div className="px-6 pt-6 space-y-6">
        <QuickInsights {...stats} />

        <PipelineFilters
          filters={filters}
          viewMode={viewMode}
          onStatusChange={updateStatus}
          onSearchChange={updateSearchQuery}
          onViewModeChange={setViewMode}
          onReset={resetFilters}
        />

        {viewMode === "list" ? (
          <PipelineList data={data} filters={filters} />
        ) : (
          <PipelineKanban data={data} />
        )}
      </div>
    </div>
  );
}
