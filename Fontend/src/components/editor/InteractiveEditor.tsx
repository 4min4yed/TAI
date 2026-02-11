"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  GripVertical,
  Plus,
  Type,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  FileText,
  CheckSquare,
  Quote,
  Video,
  Code,
  Eye,
  Download,
  Save,
  Layout,
  Trash2,
  Copy,
  Settings,
  Palette,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Block {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "image"
    | "table"
    | "chart"
    | "checklist"
    | "quote"
    | "video"
    | "code"
    | "divider"
    | "callout";
  content: any;
  style?: {
    alignment?: "left" | "center" | "right";
    color?: string;
    backgroundColor?: string;
  };
}

const blockTemplates = [
  {
    id: "heading",
    label: "Heading",
    icon: Type,
    description: "Large section title",
    defaultContent: { text: "New Section", level: 1 },
  },
  {
    id: "paragraph",
    label: "Paragraph",
    icon: FileText,
    description: "Text block",
    defaultContent: { text: "Start typing..." },
  },
  {
    id: "image",
    label: "Image",
    icon: ImageIcon,
    description: "Upload or embed image",
    defaultContent: { url: "", alt: "Image", caption: "" },
  },
  {
    id: "table",
    label: "Table",
    icon: TableIcon,
    description: "Data table",
    defaultContent: {
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [
        ["Row 1", "Data", "Data"],
        ["Row 2", "Data", "Data"],
      ],
    },
  },
  {
    id: "chart",
    label: "Chart",
    icon: BarChart3,
    description: "Data visualization",
    defaultContent: {
      type: "bar",
      data: [10, 20, 30, 40],
      labels: ["Q1", "Q2", "Q3", "Q4"],
    },
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: CheckSquare,
    description: "Task list",
    defaultContent: {
      items: [
        { text: "Task 1", checked: false },
        { text: "Task 2", checked: true },
      ],
    },
  },
  {
    id: "quote",
    label: "Quote",
    icon: Quote,
    description: "Blockquote",
    defaultContent: { text: "Insert quote here...", author: "" },
  },
  {
    id: "callout",
    label: "Callout",
    icon: Sparkles,
    description: "Important notice",
    defaultContent: { text: "Important information", type: "info" },
  },
];

const mockDocument = {
  id: "DOC-001",
  title: "Technical Proposal - IT Infrastructure Modernization",
  lastSaved: "2026-01-08 14:35",
  template: "Corporate Proposal",
};

export default function InteractiveEditor() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "block-1",
      type: "heading",
      content: { text: "Executive Summary", level: 1 },
    },
    {
      id: "block-2",
      type: "paragraph",
      content: {
        text: "This technical proposal outlines our comprehensive approach to modernizing your IT infrastructure...",
      },
    },
    {
      id: "block-3",
      type: "table",
      content: {
        headers: ["Phase", "Duration", "Deliverables"],
        rows: [
          ["Analysis", "2 months", "Infrastructure audit, needs assessment"],
          [
            "Implementation",
            "6 months",
            "Hardware deployment, system integration",
          ],
          ["Training", "1 month", "User training, documentation"],
        ],
      },
    },
  ]);

  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const addBlock = (templateId: string) => {
    const template = blockTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: templateId as Block["type"],
      content: template.defaultContent,
    };

    setBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    setSelectedBlock(null);
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: Block = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
    };

    const index = blocks.findIndex((b) => b.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case "heading":
        const HeadingTag =
          `h${block.content.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            className={cn(
              "font-bold text-slate-900 dark:text-white",
              block.content.level === 1 && "text-3xl",
              block.content.level === 2 && "text-2xl",
              block.content.level === 3 && "text-xl",
            )}
            style={{ textAlign: block.style?.alignment }}
          >
            {block.content.text}
          </HeadingTag>
        );

      case "paragraph":
        return (
          <p
            className="text-slate-700 dark:text-slate-300 leading-relaxed"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.content.text}
          </p>
        );

      case "table":
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  {block.content.headers.map((header: string, idx: number) => (
                    <th
                      key={idx}
                      className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content.rows.map((row: string[], rowIdx: number) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "checklist":
        return (
          <ul className="space-y-2">
            {block.content.items.map(
              (item: { text: string; checked: boolean }, idx: number) => (
                <li key={idx} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      item.checked
                        ? "line-through text-slate-500 dark:text-slate-400"
                        : "text-slate-700 dark:text-slate-300",
                    )}
                  >
                    {item.text}
                  </span>
                </li>
              ),
            )}
          </ul>
        );

      case "quote":
        return (
          <blockquote className="border-l-4 border-primary-600 dark:border-primary-400 pl-4 py-2 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-slate-700 dark:text-slate-300 italic">
              {block.content.text}
            </p>
            {block.content.author && (
              <footer className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                — {block.content.author}
              </footer>
            )}
          </blockquote>
        );

      case "callout":
        const calloutColors = {
          info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300",
          success:
            "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300",
          warning:
            "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-900 dark:text-warning-300",
          danger:
            "bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800 text-danger-900 dark:text-danger-300",
        };
        return (
          <div
            className={cn(
              "p-4 border rounded-lg",
              calloutColors[block.content.type as keyof typeof calloutColors] ||
                calloutColors.info,
            )}
          >
            <p className="text-sm font-medium">{block.content.text}</p>
          </div>
        );

      default:
        return (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Unsupported block type
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {mockDocument.title}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Last saved: {mockDocument.lastSaved} • Template:{" "}
                {mockDocument.template}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Palette className="w-4 h-4" />
                Theme
              </button>
              <button
                onClick={() =>
                  setViewMode(viewMode === "edit" ? "preview" : "edit")
                }
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-lg",
                  viewMode === "preview"
                    ? "bg-primary-600 text-white"
                    : "border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
              >
                <Eye className="w-4 h-4" />
                {viewMode === "edit" ? "Preview" : "Edit"}
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {viewMode === "edit" ? (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={cn(
                      "group relative p-4 border-2 rounded-lg transition-all",
                      selectedBlock === block.id
                        ? "border-primary-600 dark:border-primary-400 bg-white dark:bg-slate-900"
                        : "border-transparent bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600",
                    )}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    {/* Block Toolbar */}
                    <div className="absolute -left-12 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, "up");
                        }}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      >
                        <GripVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, "down");
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                      >
                        <GripVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>

                    <div className="absolute -right-12 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateBlock(block.id);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlock(block.id);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                        }}
                        className="p-1.5 bg-danger-100 dark:bg-danger-900/30 rounded hover:bg-danger-200 dark:hover:bg-danger-900/50"
                      >
                        <Trash2 className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                      </button>
                    </div>

                    {renderBlock(block)}
                  </div>
                ))}

                {/* Add Block Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowBlockMenu(!showBlockMenu)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-primary-600 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add Block</span>
                  </button>

                  {showBlockMenu && (
                    <Card className="absolute top-full mt-2 w-full z-10 dark:bg-slate-900 dark:border-slate-700 shadow-xl">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {blockTemplates.map((template) => {
                            const Icon = template.icon;
                            return (
                              <button
                                key={template.id}
                                onClick={() => addBlock(template.id)}
                                className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                              >
                                <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                                    {template.label}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {template.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              // Preview Mode
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12 space-y-6">
                {blocks.map((block) => (
                  <div key={block.id}>{renderBlock(block)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
