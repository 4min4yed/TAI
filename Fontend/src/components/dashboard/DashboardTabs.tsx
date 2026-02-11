"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./overview";
import { DashboardPipeline } from "./pipeline";
import { BarChart3, ListTodo } from "lucide-react";

/**
 * Dashboard Tabs Component
 * Wrapper that provides tab navigation between Overview and Pipeline views
 */
export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline">(
    "overview",
  );

  return (
    <div className="h-full">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "overview" | "pipeline")}
        className="h-full"
      >
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6">
          <TabsList className="h-12">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <ListTodo className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="m-0 h-full">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="pipeline" className="m-0 h-full">
          <DashboardPipeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
