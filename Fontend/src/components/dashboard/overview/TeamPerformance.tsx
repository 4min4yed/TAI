"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface TeamPerformanceProps {
  teamMembers?: TeamMember[];
}

// Mock data for standalone usage
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1" as any,
    name: "Sarah Johnson",
    role: "lead",
    avatar: "SJ",
    activeTenders: 8,
    successRate: 85,
  },
  {
    id: "tm-2" as any,
    name: "Mike Chen",
    role: "analyst",
    avatar: "MC",
    activeTenders: 12,
    successRate: 78,
  },
  {
    id: "tm-3" as any,
    name: "Emily Rodriguez",
    role: "coordinator",
    avatar: "ER",
    activeTenders: 6,
    successRate: 92,
  },
  {
    id: "tm-4" as any,
    name: "David Kim",
    role: "analyst",
    avatar: "DK",
    activeTenders: 10,
    successRate: 81,
  },
];

export default function TeamPerformance({
  teamMembers = MOCK_TEAM_MEMBERS,
}: TeamPerformanceProps) {
  return (
    <Card className="bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Team Performance
        </CardTitle>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {member.avatar}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                    {member.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {member.activeTenders} active tenders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Score: {member.avgScore}
                  </p>
                  <Badge
                    variant={
                      member.completionRate >= 90 ? "success" : "default"
                    }
                    className="mt-1"
                  >
                    {member.completionRate}% completion
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
