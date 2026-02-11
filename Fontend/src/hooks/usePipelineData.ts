"use client";

import { useState, useEffect } from "react";

export interface PipelineData {
  id: string;
  title: string;
  status: string;
  value: number;
  deadline: string;
  complianceScore: number;
  assignee: string;
  client: string;
  progress: number;
}

/**
 * Custom hook for fetching and managing pipeline data
 */
export function usePipelineData() {
  const [data, setData] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - backend not connected yet
    const mockData: PipelineData[] = [
      {
        id: "1",
        title: "Construction Project Alpha",
        status: "active",
        value: 450000,
        deadline: "2026-03-15",
        complianceScore: 85,
        assignee: "John Doe",
        client: "City Council",
        progress: 65,
      },
      {
        id: "2",
        title: "IT Infrastructure Upgrade",
        status: "in_progress",
        value: 320000,
        deadline: "2026-02-28",
        complianceScore: 92,
        assignee: "Jane Smith",
        client: "Tech Corp",
        progress: 45,
      },
      {
        id: "3",
        title: "Healthcare Equipment Supply",
        status: "active",
        value: 780000,
        deadline: "2026-04-10",
        complianceScore: 78,
        assignee: "Mike Johnson",
        client: "Regional Hospital",
        progress: 30,
      },
      {
        id: "4",
        title: "Education Platform Development",
        status: "completed",
        value: 250000,
        deadline: "2026-01-20",
        complianceScore: 95,
        assignee: "Sarah Williams",
        client: "University",
        progress: 100,
      },
    ];

    // Simulate API delay
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tenders/pipeline");
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refreshData };
}
