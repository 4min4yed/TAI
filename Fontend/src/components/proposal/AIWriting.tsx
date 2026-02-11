"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  Quote,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Citation {
  id: string;
  number: number;
  sourceDocument: string;
  articleNumber?: string;
  pageNumber?: number;
  clause?: string;
  excerpt: string;
  relevanceScore: number;
}

interface SourceReference {
  id: string;
  document: string;
  section: string;
  content: string;
  usedInSections: string[];
  confidence: number;
}

interface ExplainabilityEntry {
  suggestionId: string;
  reasoning: string;
  sourceDocuments: string[];
  confidenceScore: number;
  keywords: string[];
  alternativeApproaches: string[];
}

const mockCitations: Citation[] = [
  {
    id: "CIT-001",
    number: 1,
    sourceDocument: "RFP-2026-001 Technical Specifications",
    articleNumber: "Article 3.2.1",
    pageNumber: 15,
    clause: "Quality Standards",
    excerpt:
      "All deliverables must comply with ISO 9001:2015 standards and undergo third-party verification...",
    relevanceScore: 95,
  },
  {
    id: "CIT-002",
    number: 2,
    sourceDocument: "Contract Terms & Conditions",
    articleNumber: "Clause 7.4",
    pageNumber: 28,
    clause: "Liability",
    excerpt:
      "The contractor shall maintain professional liability insurance with minimum coverage of €2,000,000...",
    relevanceScore: 88,
  },
  {
    id: "CIT-003",
    number: 3,
    sourceDocument: "Environmental Requirements",
    articleNumber: "Section 2.1",
    pageNumber: 5,
    excerpt:
      "Environmental impact assessments must be conducted in accordance with EU Directive 2011/92/EU...",
    relevanceScore: 92,
  },
];

const mockSourceReferences: SourceReference[] = [
  {
    id: "SRC-001",
    document: "RFP-2026-001 Technical Specifications",
    section: "3.2 Quality Management",
    content:
      "The contractor must demonstrate a robust quality management system certified to ISO 9001:2015, with documented procedures for quality control, testing, and verification.",
    usedInSections: ["Technical Approach", "Quality Assurance Plan"],
    confidence: 94,
  },
  {
    id: "SRC-002",
    document: "Past Proposal - Highway Project 2025",
    section: "Risk Management Framework",
    content:
      "Our risk management approach incorporates regular risk assessments, mitigation strategies, and contingency planning aligned with ISO 31000 principles.",
    usedInSections: ["Risk Management"],
    confidence: 87,
  },
  {
    id: "SRC-003",
    document: "Contract Terms & Conditions",
    section: "7. Contractor Obligations",
    content:
      "The contractor shall provide monthly progress reports, maintain all required insurances, and comply with local labor laws throughout the contract period.",
    usedInSections: ["Management Plan", "Compliance Section"],
    confidence: 91,
  },
];

const mockExplainability: ExplainabilityEntry[] = [
  {
    suggestionId: "SUGG-001",
    reasoning:
      "This suggestion combines your company's proven track record from the Highway Project 2025 with the specific ISO 9001 requirements mentioned in Article 3.2.1 of the RFP. The AI identified a strong alignment between your past experience and the tender requirements.",
    sourceDocuments: [
      "RFP-2026-001",
      "Past Proposal - Highway Project 2025",
      "ISO 9001 Certificate",
    ],
    confidenceScore: 94,
    keywords: [
      "quality management",
      "ISO 9001",
      "third-party verification",
      "documented procedures",
    ],
    alternativeApproaches: [
      "Focus more on in-house testing capabilities rather than third-party verification",
      "Emphasize digital quality management tools and real-time monitoring",
      "Highlight specific quality achievements from previous projects with metrics",
    ],
  },
  {
    suggestionId: "SUGG-002",
    reasoning:
      "The AI cross-referenced the environmental requirements in the RFP with EU Directive 2011/92/EU and your company's ISO 14001 certification. This suggestion ensures compliance while demonstrating environmental expertise.",
    sourceDocuments: [
      "Environmental Requirements",
      "ISO 14001 Certificate",
      "EU Directive 2011/92/EU",
    ],
    confidenceScore: 89,
    keywords: [
      "environmental impact",
      "EU directive",
      "ISO 14001",
      "sustainability",
    ],
    alternativeApproaches: [
      "Add specific environmental KPIs and targets",
      "Include case studies of environmental initiatives from past projects",
      "Mention partnerships with environmental consultants",
    ],
  },
];

export default function AIWriting() {
  const [activeTab, setActiveTab] = useState<
    "editor" | "citations" | "sources" | "explainability"
  >("editor");
  const [citations] = useState<Citation[]>(mockCitations);
  const [sourceReferences] = useState<SourceReference[]>(mockSourceReferences);
  const [explainability] = useState<ExplainabilityEntry[]>(mockExplainability);
  const [selectedExplanation, setSelectedExplanation] =
    useState<ExplainabilityEntry | null>(null);

  const tabs = [
    { id: "editor" as const, label: "AI Editor", icon: Sparkles },
    {
      id: "citations" as const,
      label: "Citations",
      icon: Quote,
      badge: citations.length,
    },
    {
      id: "sources" as const,
      label: "Source References",
      icon: BookOpen,
      badge: sourceReferences.length,
    },
    {
      id: "explainability" as const,
      label: "AI Explainability",
      icon: Lightbulb,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Writing Assistant
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Citations • Source references • AI explainability dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-lg text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {citations.length} Citations Added
              </div>
              <div className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Confidence:{" "}
                {Math.round(
                  explainability.reduce(
                    (sum, e) => sum + e.confidenceScore,
                    0,
                  ) / explainability.length,
                )}
                %
              </div>
            </div>
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
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 bg-primary-600 text-white rounded-full text-xs font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "editor" && (
            <div className="grid grid-cols-3 gap-6 h-full">
              <div className="col-span-2">
                <Card className="h-full dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex-1 mb-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <h2>3.2 Quality Management Approach</h2>
                        <p>
                          Our quality management system is certified to{" "}
                          <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                            [1]
                          </span>{" "}
                          ISO 9001:2015 standards and incorporates comprehensive
                          third-party verification procedures. All deliverables
                          undergo rigorous quality control processes documented
                          in our QM manual.
                        </p>
                        <p>
                          We maintain professional liability insurance with
                          coverage exceeding{" "}
                          <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                            [2]
                          </span>{" "}
                          €2,000,000 as required by contract terms.
                        </p>
                        <p>
                          Environmental impact assessments will be conducted in
                          full compliance with{" "}
                          <span className="text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                            [3]
                          </span>{" "}
                          EU Directive 2011/92/EU, leveraging our ISO 14001
                          certified environmental management system.
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Inline Citations
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {citations.map((citation) => (
                          <button
                            key={citation.id}
                            className="px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50"
                          >
                            [{citation.number}] {citation.sourceDocument}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="dark:bg-slate-900 dark:border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      AI Suggestions
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() =>
                          setSelectedExplanation(explainability[0])
                        }
                        className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Enhance quality section
                          </span>
                          <span className="px-2 py-0.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded text-xs font-bold">
                            94%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Add third-party verification details
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          setSelectedExplanation(explainability[1])
                        }
                        className="w-full p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Strengthen environmental compliance
                          </span>
                          <span className="px-2 py-0.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded text-xs font-bold">
                            89%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Reference ISO 14001 certification
                        </p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "citations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Bibliography ({citations.length} citations)
                </h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                  Auto-generate Bibliography
                </button>
              </div>

              {citations.map((citation) => (
                <Card
                  key={citation.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                          [{citation.number}]
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {citation.sourceDocument}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {citation.articleNumber && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {citation.articleNumber}
                              </span>
                            )}
                            {citation.pageNumber && (
                              <span>Page {citation.pageNumber}</span>
                            )}
                            {citation.clause && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                                {citation.clause}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold",
                            citation.relevanceScore >= 90 &&
                              "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
                            citation.relevanceScore >= 75 &&
                              citation.relevanceScore < 90 &&
                              "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
                            citation.relevanceScore < 75 &&
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                          )}
                        >
                          {citation.relevanceScore}% Relevant
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                        "{citation.excerpt}"
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                        View Full Document
                      </button>
                      <button className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                        Go to Section
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "sources" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Source-to-Output Mapping ({sourceReferences.length} sources)
              </h2>

              {sourceReferences.map((source) => (
                <Card
                  key={source.id}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          {source.document}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          Section: {source.section}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold",
                          source.confidence >= 90 &&
                            "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
                          source.confidence >= 75 &&
                            source.confidence < 90 &&
                            "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
                        )}
                      >
                        {source.confidence}% Confidence
                      </span>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {source.content}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5" />
                        Used in {source.usedInSections.length} section(s):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {source.usedInSections.map((section) => (
                          <span
                            key={section}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "explainability" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                AI Reasoning & Explainability
              </h2>

              {explainability.map((entry) => (
                <Card
                  key={entry.suggestionId}
                  className="dark:bg-slate-900 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Why this suggestion?
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded text-sm font-bold",
                          entry.confidenceScore >= 90 &&
                            "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
                          entry.confidenceScore >= 75 &&
                            entry.confidenceScore < 90 &&
                            "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
                        )}
                      >
                        {entry.confidenceScore}% Confidence
                      </span>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {entry.reasoning}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Source Documents ({entry.sourceDocuments.length})
                        </h4>
                        <div className="space-y-1">
                          {entry.sourceDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">
                                {doc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                          Key Concepts
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Alternative Approaches
                      </h4>
                      <div className="space-y-2">
                        {entry.alternativeApproaches.map((approach, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded"
                          >
                            <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {approach}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Was this explanation helpful?
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-success-100 dark:hover:bg-success-900/30 hover:border-success-600 dark:hover:border-success-400">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-danger-100 dark:hover:bg-danger-900/30 hover:border-danger-600 dark:hover:border-danger-400">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
