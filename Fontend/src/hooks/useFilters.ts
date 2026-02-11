"use client";

import { useState, useCallback } from "react";
import {
  PipelineFilters,
  FilterStatus,
  SortField,
  SortOrder,
} from "@/types/dashboard";

/**
 * Custom hook for managing pipeline filters
 */
export function useFilters() {
  const [filters, setFilters] = useState<PipelineFilters>({
    status: "all",
    sortBy: "deadline",
    sortOrder: "asc",
    searchQuery: "",
  });

  const updateStatus = useCallback((status: FilterStatus) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const updateSort = useCallback((sortBy: SortField, sortOrder: SortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const updateSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: "all",
      sortBy: "deadline",
      sortOrder: "asc",
      searchQuery: "",
    });
  }, []);

  return {
    filters,
    updateStatus,
    updateSort,
    updateSearchQuery,
    resetFilters,
  };
}
