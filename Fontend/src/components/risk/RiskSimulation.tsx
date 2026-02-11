"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Percent,
  Target,
  BarChart3,
  Calculator,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskFactor {
  id: string;
  name: string;
  category: "financial" | "legal" | "technical" | "commercial";
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}

interface MonteCarloResult {
  scenario: string;
  probability: number;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

const mockRiskFactors: RiskFactor[] = [
  {
    id: "R-001",
    name: "Delayed payment terms",
    category: "financial",
    probability: 35,
    impact: 60,
    mitigation: "Request advance payment clause",
  },
  {
    id: "R-002",
    name: "Scope change during execution",
    category: "commercial",
    probability: 55,
    impact: 70,
    mitigation: "Clear change order process in contract",
  },
  {
    id: "R-003",
    name: "Regulatory compliance changes",
    category: "legal",
    probability: 25,
    impact: 80,
    mitigation: "Include regulatory change clause",
  },
  {
    id: "R-004",
    name: "Technology obsolescence",
    category: "technical",
    probability: 20,
    impact: 50,
    mitigation: "Modular architecture with upgrade path",
  },
  {
    id: "R-005",
    name: "Currency fluctuation (Multi-currency)",
    category: "financial",
    probability: 40,
    impact: 45,
    mitigation: "Hedge currency exposure",
  },
];

export default function RiskSimulation() {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(mockRiskFactors);
  const [iterations, setIterations] = useState(10000);
  const [baseRevenue, setBaseRevenue] = useState(5000000);
  const [baseCosts, setBaseCosts] = useState(3500000);
  const [isSimulating, setIsSimulating] = useState(false);

  // Monte Carlo Simulation
  const monteCarloResults = useMemo<MonteCarloResult[]>(() => {
    const results: MonteCarloResult[] = [];
    const simulations = 1000; // Reduced for performance

    for (let i = 0; i < simulations; i++) {
      // Random variation ±20%
      const revenueVariation = 0.8 + Math.random() * 0.4;
      const costVariation = 0.8 + Math.random() * 0.4;

      const revenue = baseRevenue * revenueVariation;
      const costs = baseCosts * costVariation;
      const profit = revenue - costs;
      const margin = (profit / revenue) * 100;

      results.push({
        scenario: `Scenario ${i + 1}`,
        probability: 100 / simulations,
        revenue,
        costs,
        profit,
        margin,
      });
    }

    return results;
  }, [baseRevenue, baseCosts, iterations]);

  // Statistical Analysis
  const stats = useMemo(() => {
    const profits = monteCarloResults.map((r) => r.profit);
    const margins = monteCarloResults.map((r) => r.margin);

    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;

    const sortedProfits = [...profits].sort((a, b) => a - b);
    const p10 = sortedProfits[Math.floor(sortedProfits.length * 0.1)];
    const p50 = sortedProfits[Math.floor(sortedProfits.length * 0.5)];
    const p90 = sortedProfits[Math.floor(sortedProfits.length * 0.9)];

    const successProb =
      (profits.filter((p) => p > 0).length / profits.length) * 100;
    const profitableProb =
      (margins.filter((m) => m > 15).length / margins.length) * 100;

    return {
      avgProfit,
      avgMargin,
      p10,
      p50,
      p90,
      successProb,
      profitableProb,
    };
  }, [monteCarloResults]);

  // Risk Score Calculation
  const calculateRiskScore = (factor: RiskFactor) => {
    return (factor.probability * factor.impact) / 100;
  };

  const overallRiskScore = useMemo(() => {
    const total = riskFactors.reduce(
      (sum, factor) => sum + calculateRiskScore(factor),
      0,
    );
    return Math.round(total / riskFactors.length);
  }, [riskFactors]);

  const getRiskLevel = (score: number) => {
    if (score >= 70)
      return {
        label: "Critical",
        color: "text-danger-600",
        bg: "bg-danger-100",
      };
    if (score >= 50)
      return { label: "High", color: "text-warning-600", bg: "bg-warning-100" };
    if (score >= 30)
      return {
        label: "Medium",
        color: "text-primary-600",
        bg: "bg-primary-100",
      };
    return { label: "Low", color: "text-success-600", bg: "bg-success-100" };
  };

  const getCategoryIcon = (category: RiskFactor["category"]) => {
    switch (category) {
      case "financial":
        return <DollarSign className="w-4 h-4" />;
      case "legal":
        return <AlertTriangle className="w-4 h-4" />;
      case "technical":
        return <Zap className="w-4 h-4" />;
      case "commercial":
        return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: RiskFactor["category"]) => {
    switch (category) {
      case "financial":
        return "text-green-600 bg-green-100";
      case "legal":
        return "text-purple-600 bg-purple-100";
      case "technical":
        return "text-blue-600 bg-blue-100";
      case "commercial":
        return "text-orange-600 bg-orange-100";
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Risk Simulation & Analysis
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Monte Carlo simulation and probability analysis for tender
                success
              </p>
            </div>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium",
                isSimulating && "opacity-50 cursor-not-allowed",
              )}
            >
              <RefreshCw
                className={cn("w-4 h-4", isSimulating && "animate-spin")}
              />
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </button>
          </div>

          {/* Overall Risk Score */}
          <Card
            className={cn(
              "border-2",
              getRiskLevel(overallRiskScore).bg,
              "dark:bg-slate-800 dark:border-slate-700",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Overall Risk Level
                  </div>
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      getRiskLevel(overallRiskScore).color,
                    )}
                  >
                    {overallRiskScore}/100
                  </div>
                </div>
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold",
                    getRiskLevel(overallRiskScore).bg,
                    getRiskLevel(overallRiskScore).color,
                  )}
                >
                  {getRiskLevel(overallRiskScore).label} Risk
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Success Probability */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                    <Target className="w-6 h-6 text-success-600 dark:text-success-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Success Probability
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.successProb.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Chance of positive profit
                </div>
              </CardContent>
            </Card>

            {/* Expected Profit */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Expected Profit
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${(stats.avgProfit / 1000000).toFixed(2)}M
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Average across {monteCarloResults.length} scenarios
                </div>
              </CardContent>
            </Card>

            {/* Margin Target */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                    <Percent className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Profitable Scenarios
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.profitableProb.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Margin &gt; 15%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monte Carlo Distribution */}
          <Card className="mb-6 dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monte Carlo Simulation Results
              </h2>

              {/* Percentile Analysis */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    10th Percentile (Pessimistic)
                  </div>
                  <div className="text-xl font-bold text-danger-600 dark:text-danger-400">
                    ${(stats.p10 / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    50th Percentile (Most Likely)
                  </div>
                  <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ${(stats.p50 / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    90th Percentile (Optimistic)
                  </div>
                  <div className="text-xl font-bold text-success-600 dark:text-success-400">
                    ${(stats.p90 / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>

              {/* Input Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Base Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={baseRevenue}
                    onChange={(e) => setBaseRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Base Costs ($)
                  </label>
                  <input
                    type="number"
                    value={baseCosts}
                    onChange={(e) => setBaseCosts(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors Table */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Factors Analysis
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Risk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Probability
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Impact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Mitigation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {riskFactors.map((factor) => {
                      const score = calculateRiskScore(factor);
                      const level = getRiskLevel(score);
                      return (
                        <tr
                          key={factor.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <td className="px-4 py-4 text-sm text-slate-900 dark:text-white font-medium">
                            {factor.name}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit",
                                getCategoryColor(factor.category),
                              )}
                            >
                              {getCategoryIcon(factor.category)}
                              {factor.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${factor.probability}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400 w-10">
                                {factor.probability}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full"
                                  style={{ width: `${factor.impact}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400 w-10">
                                {factor.impact}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-semibold",
                                level.bg,
                                level.color,
                              )}
                            >
                              {score.toFixed(0)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {factor.mitigation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
