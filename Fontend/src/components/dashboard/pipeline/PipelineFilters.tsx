import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, LayoutGrid, List, X } from "lucide-react";
import {
  PipelineFilters as FilterType,
  ViewMode,
  FilterStatus,
} from "@/types/dashboard";

interface PipelineFiltersProps {
  filters: FilterType;
  viewMode: ViewMode;
  onStatusChange: (status: FilterStatus) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onReset: () => void;
}

/**
 * Pipeline filters component
 * Search, status filter, view mode toggle
 */
export function PipelineFilters({
  filters,
  viewMode,
  onStatusChange,
  onSearchChange,
  onViewModeChange,
  onReset,
}: PipelineFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tenders..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 bg-white dark:bg-slate-800">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Reset Button */}
        {(filters.searchQuery || filters.status !== "all") && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-md p-1">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === "kanban" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("kanban")}
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
