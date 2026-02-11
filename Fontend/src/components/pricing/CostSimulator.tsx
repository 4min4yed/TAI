"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  Calculator,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Download,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Globe,
  Layers,
  Table,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Currency = "EUR" | "USD" | "TND" | "MAD" | "SAR" | "DZD";

interface ExchangeRate {
  currency: Currency;
  rate: number; // Rate to EUR
  symbol: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Lot {
  id: string;
  name: string;
  items: LineItem[];
}

interface AOStructure {
  lots: Lot[];
}

const exchangeRates: ExchangeRate[] = [
  { currency: "EUR", rate: 1.0, symbol: "€" },
  { currency: "USD", rate: 1.08, symbol: "$" },
  { currency: "TND", rate: 3.35, symbol: "TND" },
  { currency: "MAD", rate: 10.85, symbol: "MAD" },
  { currency: "SAR", rate: 4.05, symbol: "SAR" },
  { currency: "DZD", rate: 145.5, symbol: "DZD" },
];

const mockAOStructure: AOStructure = {
  lots: [
    {
      id: "LOT-001",
      name: "Civil Works - Phase 1",
      items: [
        {
          id: "ITEM-001",
          description: "Excavation works",
          quantity: 500,
          unit: "m³",
          unitPrice: 45,
          total: 22500,
        },
        {
          id: "ITEM-002",
          description: "Concrete foundation",
          quantity: 300,
          unit: "m³",
          unitPrice: 180,
          total: 54000,
        },
        {
          id: "ITEM-003",
          description: "Reinforcement steel",
          quantity: 15,
          unit: "ton",
          unitPrice: 1200,
          total: 18000,
        },
      ],
    },
    {
      id: "LOT-002",
      name: "Electrical Installation",
      items: [
        {
          id: "ITEM-004",
          description: "Electrical panel 400A",
          quantity: 2,
          unit: "unit",
          unitPrice: 3500,
          total: 7000,
        },
        {
          id: "ITEM-005",
          description: "Cable laying",
          quantity: 1500,
          unit: "m",
          unitPrice: 12,
          total: 18000,
        },
        {
          id: "ITEM-006",
          description: "Lighting fixtures",
          quantity: 50,
          unit: "unit",
          unitPrice: 85,
          total: 4250,
        },
      ],
    },
  ],
};

export default function CostSimulator() {
  const [activeTab, setActiveTab] = useState<
    "structure" | "parameters" | "results"
  >("structure");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("EUR");
  const [aoStructure, setAOStructure] = useState<AOStructure>(mockAOStructure);

  // Parameters
  const [manHours, setManHours] = useState(2000);
  const [dailyRate, setDailyRate] = useState(450);
  const [subcontractorCost, setSubcontractorCost] = useState(50000);
  const [riskFactor, setRiskFactor] = useState(15);
  const [margin, setMargin] = useState(20);

  const tabs = [
    { id: "structure" as const, label: "AO Structure", icon: Layers },
    { id: "parameters" as const, label: "Parameters", icon: Settings },
    { id: "results" as const, label: "Results", icon: Calculator },
  ];

  const currentRate = exchangeRates.find(
    (r) => r.currency === selectedCurrency,
  )!;

  const convertToSelectedCurrency = (eurAmount: number) => {
    return eurAmount * currentRate.rate;
  };

  const formatCurrency = (amount: number) => {
    return `${currentRate.symbol} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalAOCost = aoStructure.lots.reduce(
    (sum, lot) =>
      sum + lot.items.reduce((itemSum, item) => itemSum + item.total, 0),
    0,
  );

  const laborCost = (manHours / 8) * dailyRate;
  const baseCost = laborCost + subcontractorCost + totalAOCost;
  const riskAmount = baseCost * (riskFactor / 100);
  const costWithRisk = baseCost + riskAmount;
  const marginAmount = costWithRisk * (margin / 100);
  const totalPrice = costWithRisk + marginAmount;

  const addLot = () => {
    const newLot: Lot = {
      id: `LOT-${String(aoStructure.lots.length + 1).padStart(3, "0")}`,
      name: `New Lot ${aoStructure.lots.length + 1}`,
      items: [],
    };
    setAOStructure({ ...aoStructure, lots: [...aoStructure.lots, newLot] });
  };

  const addItem = (lotId: string) => {
    const lot = aoStructure.lots.find((l) => l.id === lotId);
    if (!lot) return;

    const newItem: LineItem = {
      id: `ITEM-${String(aoStructure.lots.reduce((sum, l) => sum + l.items.length, 0) + 1).padStart(3, "0")}`,
      description: "New item",
      quantity: 1,
      unit: "unit",
      unitPrice: 0,
      total: 0,
    };

    setAOStructure({
      ...aoStructure,
      lots: aoStructure.lots.map((l) =>
        l.id === lotId ? { ...l, items: [...l.items, newItem] } : l,
      ),
    });
  };

  const updateItem = (
    lotId: string,
    itemId: string,
    field: keyof LineItem,
    value: any,
  ) => {
    setAOStructure({
      ...aoStructure,
      lots: aoStructure.lots.map((lot) =>
        lot.id === lotId
          ? {
              ...lot,
              items: lot.items.map((item) => {
                if (item.id === itemId) {
                  const updated = { ...item, [field]: value };
                  if (field === "quantity" || field === "unitPrice") {
                    updated.total = updated.quantity * updated.unitPrice;
                  }
                  return updated;
                }
                return item;
              }),
            }
          : lot,
      ),
    });
  };

  const deleteLot = (lotId: string) => {
    setAOStructure({
      ...aoStructure,
      lots: aoStructure.lots.filter((l) => l.id !== lotId),
    });
  };

  const deleteItem = (lotId: string, itemId: string) => {
    setAOStructure({
      ...aoStructure,
      lots: aoStructure.lots.map((lot) =>
        lot.id === lotId
          ? { ...lot, items: lot.items.filter((item) => item.id !== itemId) }
          : lot,
      ),
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Cost Simulator
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                AO structure builder • Multi-currency • Unit price tables
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <select
                  value={selectedCurrency}
                  onChange={(e) =>
                    setSelectedCurrency(e.target.value as Currency)
                  }
                  className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  {exchangeRates.map((rate) => (
                    <option key={rate.currency} value={rate.currency}>
                      {rate.currency} ({rate.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Export BQ
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  AO Structure Cost
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(convertToSelectedCurrency(totalAOCost))}
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Labor + Subcontractor
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(
                    convertToSelectedCurrency(laborCost + subcontractorCost),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Risk Buffer ({riskFactor}%)
                </div>
                <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                  {formatCurrency(convertToSelectedCurrency(riskAmount))}
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Total Price
                </div>
                <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {formatCurrency(convertToSelectedCurrency(totalPrice))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary-600 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "structure" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Lots & Line Items
                </h2>
                <button
                  onClick={addLot}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Lot
                </button>
              </div>

              {aoStructure.lots.map((lot) => (
                <Card
                  key={lot.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {lot.id}
                        </span>
                        <input
                          type="text"
                          value={lot.name}
                          onChange={(e) =>
                            setAOStructure({
                              ...aoStructure,
                              lots: aoStructure.lots.map((l) =>
                                l.id === lot.id
                                  ? { ...l, name: e.target.value }
                                  : l,
                              ),
                            })
                          }
                          className="text-lg font-semibold bg-transparent border-none text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Lot Total:{" "}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(
                              convertToSelectedCurrency(
                                lot.items.reduce(
                                  (sum, item) => sum + item.total,
                                  0,
                                ),
                              ),
                            )}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteLot(lot.id)}
                          className="p-2 text-danger-600 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                          <tr>
                            <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Item ID
                            </th>
                            <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Description
                            </th>
                            <th className="text-right p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Quantity
                            </th>
                            <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Unit
                            </th>
                            <th className="text-right p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Unit Price
                            </th>
                            <th className="text-right p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Total
                            </th>
                            <th className="text-center p-3 text-slate-600 dark:text-slate-400 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lot.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-200 dark:border-slate-700"
                            >
                              <td className="p-3 text-slate-900 dark:text-white font-mono text-xs">
                                {item.id}
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(
                                      lot.id,
                                      item.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent border-none text-slate-900 dark:text-white"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      lot.id,
                                      item.id,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-20 text-right bg-transparent border-none text-slate-900 dark:text-white"
                                  min="0"
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  value={item.unit}
                                  onChange={(e) =>
                                    updateItem(
                                      lot.id,
                                      item.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-transparent border-none text-slate-900 dark:text-white"
                                >
                                  <option>unit</option>
                                  <option>m</option>
                                  <option>m²</option>
                                  <option>m³</option>
                                  <option>ton</option>
                                  <option>hour</option>
                                  <option>day</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) =>
                                    updateItem(
                                      lot.id,
                                      item.id,
                                      "unitPrice",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-24 text-right bg-transparent border-none text-slate-900 dark:text-white"
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                                {formatCurrency(
                                  convertToSelectedCurrency(item.total),
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => deleteItem(lot.id, item.id)}
                                  className="p-1 text-danger-600 hover:bg-danger-100 dark:hover:bg-danger-900/30 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      onClick={() => addItem(lot.id)}
                      className="mt-4 flex items-center gap-2 px-3 py-1.5 text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded hover:border-primary-600 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Plus className="w-4 h-4" />
                      Add Line Item
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "parameters" && (
            <div className="grid grid-cols-2 gap-6">
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Labor Costs
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Total Man-Hours
                      </label>
                      <input
                        type="number"
                        value={manHours}
                        onChange={(e) => setManHours(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Daily Rate (EUR)
                      </label>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Total Labor Cost:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(convertToSelectedCurrency(laborCost))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Other Costs
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Subcontractor Cost (EUR)
                      </label>
                      <input
                        type="number"
                        value={subcontractorCost}
                        onChange={(e) =>
                          setSubcontractorCost(Number(e.target.value))
                        }
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Risk Factor (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={riskFactor}
                        onChange={(e) => setRiskFactor(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-right text-sm font-bold text-warning-600 dark:text-warning-400">
                        {riskFactor}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Margin (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-right text-sm font-bold text-success-600 dark:text-success-400">
                        {margin}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "results" && (
            <div className="space-y-6">
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                    Cost Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        AO Structure Cost
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(convertToSelectedCurrency(totalAOCost))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Labor Cost
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(convertToSelectedCurrency(laborCost))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Subcontractor Cost
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(
                          convertToSelectedCurrency(subcontractorCost),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-slate-300 dark:border-slate-600">
                      <span className="font-medium text-slate-900 dark:text-white">
                        Base Cost
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(convertToSelectedCurrency(baseCost))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Risk Buffer ({riskFactor}%)
                      </span>
                      <span className="font-bold text-warning-600 dark:text-warning-400">
                        +{" "}
                        {formatCurrency(convertToSelectedCurrency(riskAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-slate-300 dark:border-slate-600">
                      <span className="font-medium text-slate-900 dark:text-white">
                        Cost with Risk
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(
                          convertToSelectedCurrency(costWithRisk),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">
                        Margin ({margin}%)
                      </span>
                      <span className="font-bold text-success-600 dark:text-success-400">
                        +{" "}
                        {formatCurrency(
                          convertToSelectedCurrency(marginAmount),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        Total Price
                      </span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(convertToSelectedCurrency(totalPrice))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Currency Conversion Table
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="text-left p-3 text-slate-600 dark:text-slate-400 font-medium">
                            Currency
                          </th>
                          <th className="text-center p-3 text-slate-600 dark:text-slate-400 font-medium">
                            Exchange Rate
                          </th>
                          <th className="text-right p-3 text-slate-600 dark:text-slate-400 font-medium">
                            Total Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {exchangeRates.map((rate) => (
                          <tr
                            key={rate.currency}
                            className={cn(
                              "border-b border-slate-200 dark:border-slate-700",
                              rate.currency === selectedCurrency &&
                                "bg-primary-50 dark:bg-primary-900/20",
                            )}
                          >
                            <td className="p-3 font-medium text-slate-900 dark:text-white">
                              {rate.currency} ({rate.symbol})
                            </td>
                            <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                              1 EUR = {rate.rate.toFixed(4)} {rate.currency}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                              {rate.symbol}{" "}
                              {(totalPrice * rate.rate).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
