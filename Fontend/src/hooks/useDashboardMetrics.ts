"use client";

import { useState, useEffect } from "react";
import { DashboardSummary, MetricCardData } from "@/types/dashboard";

/**
 * Custom hook for fetching and managing dashboard metrics
 * Returns both raw summary data and formatted metric cards
 */
export function useDashboardMetrics() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [metricCards, setMetricCards] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - backend not connected yet
    const mockSummary: DashboardSummary = {
      activeTenders: 24,
      totalValue: 1250000,
      successRate: 68.5,
      avgComplianceScore: 92.3,
    };

    // Transform summary into metric cards
    const cards: MetricCardData[] = [
      {
        key: "activeTenders",
        label: "Active Tenders",
        value: mockSummary.activeTenders,
        trend: "up",
        changePct: 12.5,
        changeLabel: "vs last month",
        iconKey: "fileText",
      },
      {
        key: "totalValue",
        label: "Total Value",
        value: `$${(mockSummary.totalValue / 1000000).toFixed(2)}M`,
        trend: "up",
        changePct: 18.8,
        changeLabel: "vs last month",
        iconKey: "dollarSign",
      },
      {
        key: "successRate",
        label: "Success Rate",
        value: `${mockSummary.successRate.toFixed(1)}%`,
        trend: "up",
        changePct: 5.2,
        changeLabel: "vs last month",
        iconKey: "award",
      },
      {
        key: "avgComplianceScore",
        label: "Avg Compliance",
        value: `${mockSummary.avgComplianceScore.toFixed(1)}%`,
        trend: "neutral",
        changePct: 0.5,
        changeLabel: "vs last month",
        iconKey: "checkCircle",
      },
    ];

    // Simulate API delay
    const timer = setTimeout(() => {
      setSummary(mockSummary);
      setMetricCards(cards);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { summary, metricCards, loading, error };
}
