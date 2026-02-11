import React from "react";
import { TenderCard } from "./TenderCard";
import { EmptyState } from "@/components/common";
import { PipelineFilters } from "@/types/dashboard";
import { FileX } from "lucide-react";

interface PipelineData {
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

interface PipelineListProps {
  data: PipelineData[];
  filters: PipelineFilters;
}

/**
 * Pipeline list view component
 * Displays tenders in a vertical list
 */
export function PipelineList({ data, filters }: PipelineListProps) {
  // Apply filters
  const filteredData = data.filter((item) => {
    const matchesStatus =
      filters.status === "all" || item.status === filters.status;
    const matchesSearch =
      !filters.searchQuery ||
      item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (filteredData.length === 0) {
    return (
      <EmptyState
        title="No tenders found"
        description="Try adjusting your filters or create a new tender"
        icon={<FileX className="w-12 h-12" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredData.map((tender) => (
        <TenderCard key={tender.id} {...tender} />
      ))}
    </div>
  );
}
