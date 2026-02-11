"use client";

import React from "react";
import { MetricCards, ActivityFeed, TeamPerformance } from "./index";
import { PageHeader, LoadingSpinner, ErrorState } from "@/components/common";
import { useDashboardMetrics } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

/**
 * Refactored Dashboard Overview Component
 * Reduced from 790 LOC to ~80 LOC using atomic components
 */
export default function DashboardOverview() {
  const { summary, metricCards, loading, error } = useDashboardMetrics();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger refresh logic
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleExport = () => {
    // Export logic
    console.log("Exporting dashboard data...");
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRefresh} />;
  }

  if (!summary || !metricCards.length) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Monitor your tender performance and key metrics"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </>
        }
      />

      <MetricCards metrics={metricCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <TeamPerformance />
      </div>
    </div>
  );
}
