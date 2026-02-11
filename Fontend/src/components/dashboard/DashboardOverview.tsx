"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  FileText,
  DollarSign,
  Award,
  CalendarDays,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  Target,
  BarChart3,
  Activity,
  Bell,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityEntry {
  id: string;
  type: "submission" | "award" | "update" | "alert";
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  value?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  activeTenders: number;
  completionRate: number;
  avatar: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  trend: "up" | "down";
  target?: string;
  subtitle?: string;
}

export default function DashboardOverview() {
  const [dateFilter] = useState("Oct 18 - Nov 18");
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Enhanced metrics with targets and trends
  const metrics: MetricCard[] = [
    {
      title: "Active Tenders",
      value: "12,450",
      change: 18.8,
      changeLabel: "+2,345 this month",
      icon: FileText,
      trend: "up",
      target: "15,000",
      subtitle: "83% of target",
    },
    {
      title: "Total Contract Value",
      value: "$363.95M",
      change: -34.05,
      changeLabel: "-$128.5M vs last month",
      icon: DollarSign,
      trend: "down",
      target: "$450M",
      subtitle: "81% of target",
    },
    {
      title: "Success Rate",
      value: "86.5%",
      change: 14.25,
      changeLabel: "+12.3% improvement",
      icon: Award,
      trend: "up",
      target: "90%",
      subtitle: "4.5% to target",
    },
    {
      title: "Average Response Time",
      value: "2.4 days",
      change: -18.5,
      changeLabel: "0.5 days faster",
      icon: Clock,
      trend: "up",
      target: "2 days",
      subtitle: "0.4 days to target",
    },
  ];

  // Real-time activity feed
  const activities: ActivityEntry[] = [
    {
      id: "1",
      type: "submission",
      title: "Tender Submitted",
      description: "Healthcare Equipment Supply - Region Nord",
      timestamp: "2 minutes ago",
      user: "Sarah Johnson",
      value: "$2.5M",
    },
    {
      id: "2",
      type: "award",
      title: "Contract Awarded",
      description: "IT Infrastructure Modernization",
      timestamp: "15 minutes ago",
      user: "Michael Chen",
      value: "$1.8M",
    },
    {
      id: "3",
      type: "update",
      title: "Compliance Updated",
      description: "Construction - New Community Center",
      timestamp: "1 hour ago",
      user: "Emma Williams",
    },
    {
      id: "4",
      type: "alert",
      title: "Deadline Approaching",
      description: "Emergency Response Vehicles - Due in 3 days",
      timestamp: "2 hours ago",
    },
    {
      id: "5",
      type: "submission",
      title: "Tender Submitted",
      description: "Consulting Services - Digital Transformation",
      timestamp: "3 hours ago",
      user: "David Lee",
      value: "$750K",
    },
  ];

  // Team performance data
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Senior Bid Manager",
      activeTenders: 8,
      completionRate: 92,
      avatar: "SJ",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Proposal Lead",
      activeTenders: 6,
      completionRate: 88,
      avatar: "MC",
    },
    {
      id: "3",
      name: "Emma Williams",
      role: "Compliance Officer",
      activeTenders: 5,
      completionRate: 95,
      avatar: "EW",
    },
    {
      id: "4",
      name: "David Lee",
      role: "Bid Coordinator",
      activeTenders: 4,
      completionRate: 85,
      avatar: "DL",
    },
  ];

  const getActivityIcon = (type: ActivityEntry["type"]) => {
    switch (type) {
      case "submission":
        return <CheckCircle2 className="w-4 h-4 text-success-600" />;
      case "award":
        return <Award className="w-4 h-4 text-primary-600" />;
      case "update":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "alert":
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
    }
  };

  const getActivityColor = (type: ActivityEntry["type"]) => {
    switch (type) {
      case "submission":
        return "bg-success-100 dark:bg-success-900/30";
      case "award":
        return "bg-primary-100 dark:bg-primary-900/30";
      case "update":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "alert":
        return "bg-warning-100 dark:bg-warning-900/30";
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen">
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real-time insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")}
                />
                Refresh
              </Button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900">
                <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {dateFilter}
                </span>
              </button>
              <select className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Yearly</option>
              </select>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="px-6 pt-6"
        >
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Team Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Enhanced Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, idx) => (
                <Card
                  key={idx}
                  className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                          <metric.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {metric.title}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {metric.value}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={metric.trend === "up" ? "success" : "danger"}
                          className="flex items-center gap-1"
                        >
                          {metric.trend === "up" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(metric.change)}%
                        </Badge>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {metric.changeLabel}
                        </span>
                      </div>
                      {metric.target && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400">
                              Target: {metric.target}
                            </span>
                            <Target className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {metric.subtitle}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Tender Value Overview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      Filter
                    </button>
                    <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      Sort
                    </button>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      $9,257.51
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="text-success-600 dark:text-success-400 font-medium">
                        18.6% ↑
                      </span>{" "}
                      +$143.50 increased
                    </p>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-4">
                    {[
                      { month: "Oct", values: [60, 45, 40] },
                      { month: "Nov", values: [50, 40, 35] },
                      { month: "Dec", values: [70, 55, 45] },
                    ].map((data, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-3"
                      >
                        <div className="w-full flex flex-col gap-1">
                          {data.values.map((val, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-full rounded transition-all hover:opacity-80",
                                i === 0 && "bg-purple-500",
                                i === 1 && "bg-primary-400",
                                i === 2 && "bg-teal-400",
                              )}
                              style={{ height: `${val}px` }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                      <span className="text-slate-600 dark:text-slate-400">
                        Public
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-400"></div>
                      <span className="text-slate-600 dark:text-slate-400">
                        Private
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                      <span className="text-slate-600 dark:text-slate-400">
                        Framework
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Total Submitted Tenders
                  </CardTitle>
                  <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                      24,473
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <span className="text-success-600 dark:text-success-400 font-medium">
                        8.3% ↑
                      </span>{" "}
                      +749 increased
                    </p>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-3">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, idx) => {
                        const heights = [45, 50, 90, 55, 60, 65, 95];
                        return (
                          <div
                            key={day}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div
                              className={cn(
                                "w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer",
                                idx === 2 || idx === 6
                                  ? "bg-primary-600"
                                  : "bg-slate-200 dark:bg-slate-700",
                              )}
                              style={{ height: `${heights[idx]}%` }}
                            ></div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {day}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Tender Distribution
                  </CardTitle>
                  <select className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    <option>Monthly</option>
                  </select>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-40 h-40">
                      <svg
                        viewBox="0 0 100 100"
                        className="transform -rotate-90"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="15"
                          strokeDasharray={`${38 * 2.2} ${220 - 38 * 2.2}`}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="15"
                          strokeDasharray={`${24 * 2.2} ${220 - 24 * 2.2}`}
                          strokeDashoffset={-38 * 2.2}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="15"
                          strokeDasharray={`${21 * 2.2} ${220 - 21 * 2.2}`}
                          strokeDashoffset={-(38 + 24) * 2.2}
                        />
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full mt-6">
                      {[
                        {
                          color: "bg-primary-500",
                          label: "Public",
                          value: "$374.82",
                        },
                        {
                          color: "bg-purple-500",
                          label: "Private",
                          value: "$241.60",
                        },
                        {
                          color: "bg-slate-200 dark:bg-slate-700",
                          label: "Other",
                          value: "$213.42",
                        },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                            ></div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    Recent Awarded Contracts
                  </CardTitle>
                  <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300">
                    See All
                  </button>
                </CardHeader>
                <CardContent className="pt-6">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="pb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Application
                        </th>
                        <th className="pb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Type
                        </th>
                        <th className="pb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Rate
                        </th>
                        <th className="pb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase text-right">
                          Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        {
                          name: "Infrastructure Build",
                          icon: "🏗️",
                          type: "Construction",
                          rate: 40,
                          profit: "$650.00",
                        },
                        {
                          name: "Security System",
                          icon: "🔒",
                          type: "Technology",
                          rate: 80,
                          profit: "$720.50",
                        },
                        {
                          name: "Medical Equipment",
                          icon: "🏥",
                          type: "Healthcare",
                          rate: 20,
                          profit: "$432.25",
                        },
                      ].map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span>{item.icon}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                  className="bg-primary-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${item.rate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400 w-10">
                                {item.rate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {item.profit}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card className="bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Recent Activity
                  </CardTitle>
                  <Badge variant="primary" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          getActivityColor(activity.type),
                        )}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {activity.description}
                            </p>
                            {activity.user && (
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                                by {activity.user}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                              {activity.timestamp}
                            </span>
                            {activity.value && (
                              <Badge variant="secondary" className="font-mono">
                                {activity.value}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-6 mt-6">
            <Card className="bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {member.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {member.activeTenders}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Active
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                            {member.completionRate}%
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Success
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
