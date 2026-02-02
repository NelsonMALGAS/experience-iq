"use client";

import { useState, useMemo } from "react";
import { Issue } from "@/types";
import { FilterState } from "@/components/issues/IssueFilters";

export function useIssueFilters(issues: Issue[]) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    priority: "all",
    category: "all",
  });

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower) ||
          issue.roomNumber?.toLowerCase().includes(searchLower) ||
          issue.guestName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && issue.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && issue.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && issue.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [issues, filters]);

  return {
    filters,
    setFilters,
    filteredIssues,
  };
}
