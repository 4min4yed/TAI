"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { clearAuthSession, readAccessToken, readUserProfile } from "@/lib/auth-storage";

interface TenantUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tenant_id: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_2fa_enabled: boolean;
}

const API_BASE = "http://127.0.0.1:8000";

export default function SecurityPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const profile = readUserProfile();
  const token = readAccessToken();
  const isOwner = useMemo(() => String(profile?.role || "").toLowerCase() === "owner", [profile?.role]);

  const loadUsers = async () => {
    if (!token || !isOwner) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/v1/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 401) {
        clearAuthSession();
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to fetch users.");
      }
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch users.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [isOwner]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!isOwner) {
      setError("Owner role is required.");
      return;
    }
    if (!token) {
      setError("No session found. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/v1/users/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          role,
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        clearAuthSession();
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to send invitation.");
      }

      setNotice(data?.message || "Invitation sent.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("viewer");
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send invitation.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Security">
      <section className="mx-auto w-full max-w-6xl px-6 py-8 space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Team Security Access</h1>
          <p className="mt-2 text-sm text-slate-600">
            Owners can invite users, assign roles, and keep access locked until email verification and password setup are complete.
          </p>
        </header>

        {!isOwner ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-6 opacity-70">
            <h2 className="text-lg font-semibold text-slate-800">Owner Access Required</h2>
            <p className="mt-2 text-sm text-slate-600">
              This page is visible but disabled for non-owner roles. Invite requests are also rejected by the backend.
            </p>
          </div>
        ) : null}

        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleInvite}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            aria-disabled={!isOwner}
          >
            <h2 className="text-lg font-semibold text-slate-900">Invite New User</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isOwner || submitting}
                required
              />
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isOwner || submitting}
                required
              />
            </div>
            <input
              type="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isOwner || submitting}
              required
            />
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!isOwner || submitting}
            >
              <option value="viewer">viewer</option>
              <option value="editor">editor</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <Button type="submit" className="w-full" disabled={!isOwner || submitting}>
              {submitting ? "Sending invitation..." : "Create user and send verification email"}
            </Button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Tenant Users</h2>
            {loading ? <p className="mt-4 text-sm text-slate-500">Loading users...</p> : null}
            {!loading && users.length === 0 ? <p className="mt-4 text-sm text-slate-500">No users yet.</p> : null}

            {!loading && users.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Role</th>
                      <th className="px-2 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100">
                        <td className="px-2 py-2 text-slate-700">{user.first_name} {user.last_name}</td>
                        <td className="px-2 py-2 text-slate-700">{user.email}</td>
                        <td className="px-2 py-2 text-slate-700">{user.role}</td>
                        <td className="px-2 py-2 text-slate-700">
                          {user.is_verified ? "Verified" : "Pending verification"}
                          {user.is_active ? " / Active" : " / Inactive"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
