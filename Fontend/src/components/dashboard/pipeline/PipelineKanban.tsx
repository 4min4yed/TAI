import React from "react";
import { TenderCard } from "./TenderCard";
import { EmptyState } from "@/components/common";
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

interface PipelineKanbanProps {
  data: PipelineData[];
}

const KANBAN_COLUMNS = [
  { id: "new", label: "New", color: "bg-slate-100 dark:bg-slate-800" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    id: "in_review",
    label: "In Review",
    color: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    id: "ready_to_submit",
    label: "Ready",
    color: "bg-green-100 dark:bg-green-900/20",
  },
  {
    id: "submitted",
    label: "Submitted",
    color: "bg-purple-100 dark:bg-purple-900/20",
  },
];

/**
 * Pipeline kanban view component
 * Displays tenders in a kanban board by status
 */
export function PipelineKanban({ data }: PipelineKanbanProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No tenders found"
        description="Create a new tender to get started"
        icon={<FileX className="w-12 h-12" />}
      />
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((column) => {
        const columnTenders = data.filter(
          (tender) => tender.status === column.id,
        );

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div
              className={`p-4 border-b border-slate-200 dark:border-slate-700 ${column.color}`}
            >
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {column.label}
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                  ({columnTenders.length})
                </span>
              </h3>
            </div>

            <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnTenders.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No tenders
                </p>
              ) : (
                columnTenders.map((tender) => (
                  <TenderCard key={tender.id} {...tender} compact />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
