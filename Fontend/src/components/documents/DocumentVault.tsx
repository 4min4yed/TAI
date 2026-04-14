"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clearAuthSession, readAccessToken, readUserProfile } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { Download, Eye, FileText, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

interface VaultDocument {
  id: number;
  filename: string;
  doc_type: string;
  department: string;
  status: string;
  mime_type: string;
  size_bytes: number;
  tags: string[];
  created_at_utc: string | null;
  updated_at_utc: string | null;
  allowed_actions: string[];
}

const API_BASE = "http://127.0.0.1:8000";
const EDIT_ROLES = new Set(["owner", "admin", "manager", "editor"]);
const DELETE_ROLES = new Set(["owner", "admin"]);

export default function DocumentVault() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("General");
  const [uploadDepartment, setUploadDepartment] = useState("General");
  const [uploadTags, setUploadTags] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editingDoc, setEditingDoc] = useState<VaultDocument | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("General");
  const [editDepartment, setEditDepartment] = useState("General");
  const [editTags, setEditTags] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const profile = readUserProfile();
  const token = readAccessToken();
  const role = String(profile?.role || "").toLowerCase();
  const canUpload = EDIT_ROLES.has(role);

  const loadDocuments = async () => {
    if (!token) {
      setError("No active session. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/v1/documents/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.status === 401) {
        clearAuthSession();
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to load documents.");
      }
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => Number(b.id) - Number(a.id)),
    [documents],
  );

  const openUpload = () => {
    if (!canUpload) return;
    setShowUpload(true);
    setError("");
  };

  const closeUpload = () => {
    setShowUpload(false);
    setSelectedFile(null);
    setUploadType("General");
    setUploadDepartment("General");
    setUploadTags("");
    setDragActive(false);
  };

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadDocument = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (!selectedFile) {
      setError("Please choose a file.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", selectedFile);
      body.append("doc_type", uploadType);
      body.append("department", uploadDepartment);
      body.append("tags", uploadTags);

      const response = await fetch(`${API_BASE}/v1/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await response.json();
      if (response.status === 401) {
        clearAuthSession();
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to upload document.");
      }

      closeUpload();
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const fetchBlob = async (url: string): Promise<Blob> => {
    if (!token) {
      throw new Error("No active session.");
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      clearAuthSession();
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
    if (!response.ok) {
      let detail = "Request failed";
      try {
        const data = await response.json();
        detail = data?.detail || detail;
      } catch {
        // Ignore body parse errors for non-JSON downloads.
      }
      throw new Error(detail);
    }
    return await response.blob();
  };

  const handleView = async (doc: VaultDocument) => {
    try {
      const blob = await fetchBlob(`${API_BASE}/v1/documents/${doc.id}/view`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open document.");
    }
  };

  const handleDownload = async (doc: VaultDocument) => {
    try {
      const blob = await fetchBlob(`${API_BASE}/v1/documents/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download document.");
    }
  };

  const openEdit = (doc: VaultDocument) => {
    setEditingDoc(doc);
    setEditName(doc.filename);
    setEditType(doc.doc_type || "General");
    setEditDepartment(doc.department || "General");
    setEditTags((doc.tags || []).join(", "));
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !editingDoc) return;

    setSavingEdit(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/v1/documents/${editingDoc.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: editName,
          doc_type: editType,
          department: editDepartment,
          tags: editTags,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to update document.");
      }
      setEditingDoc(null);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update document.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (doc: VaultDocument) => {
    if (!token) return;
    if (!window.confirm(`Delete ${doc.filename}?`)) return;

    setError("");
    try {
      const response = await fetch(`${API_BASE}/v1/documents/${doc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete document.");
      }
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Document Vault</h2>
              <p className="mt-1 text-sm text-slate-600">Real files from MinIO with metadata and role-based controls.</p>
            </div>
            <Button onClick={openUpload} disabled={!canUpload} className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <Card className="border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading documents...</div>
          ) : sortedDocuments.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No documents uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Size</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map((doc) => {
                    const canEdit = EDIT_ROLES.has(role) && doc.allowed_actions.includes("edit");
                    const canDelete = DELETE_ROLES.has(role) && doc.allowed_actions.includes("delete");
                    return (
                      <tr key={doc.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">{doc.filename}</div>
                              <div className="text-xs text-slate-500">{doc.mime_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{doc.doc_type}</td>
                        <td className="px-4 py-3 text-slate-700">{doc.department}</td>
                        <td className="px-4 py-3 text-slate-700">{(doc.size_bytes / 1024).toFixed(1)} KB</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(doc)} className="gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownload(doc)} className="gap-1">
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => openEdit(doc)} className="gap-1">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" disabled={!canDelete} onClick={() => handleDelete(doc)} className="gap-1">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showUpload ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <Card className="w-full max-w-xl border-slate-200">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
                <button onClick={closeUpload} className="rounded p-1 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={uploadDocument} className="space-y-4">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={onDrop}
                  className={cn(
                    "rounded-lg border-2 border-dashed p-8 text-center",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50",
                  )}
                >
                  <Upload className="mx-auto mb-3 h-6 w-6 text-slate-500" />
                  <p className="text-sm text-slate-600">Drag and drop a file here, or click to select.</p>
                  {selectedFile ? <p className="mt-2 text-sm font-medium text-slate-800">{selectedFile.name}</p> : null}
                  <input ref={inputRef} type="file" className="hidden" onChange={onFileSelected} />
                  <Button type="button" variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
                    Choose File
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    value={uploadType}
                    onChange={(event) => setUploadType(event.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Document type"
                  />
                  <input
                    value={uploadDepartment}
                    onChange={(event) => setUploadDepartment(event.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Department"
                  />
                </div>
                <input
                  value={uploadTags}
                  onChange={(event) => setUploadTags(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Tags (comma separated)"
                />

                <Button type="submit" className="w-full" disabled={uploading || !selectedFile}>
                  {uploading ? "Uploading..." : "Upload to MinIO"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {editingDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <Card className="w-full max-w-xl border-slate-200">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Edit Document</h3>
                <button onClick={() => setEditingDoc(null)} className="rounded p-1 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={saveEdit} className="space-y-3">
                <input value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input value={editType} onChange={(event) => setEditType(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <input value={editDepartment} onChange={(event) => setEditDepartment(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <input value={editTags} onChange={(event) => setEditTags(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <Button type="submit" className="w-full" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
