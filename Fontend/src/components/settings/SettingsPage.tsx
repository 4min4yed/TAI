"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Shield,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  readAccessToken,
  readUserProfile,
  clearAuthSession,
  updateStoredUserProfile,
} from "@/lib/auth-storage";
import { getApiBaseUrl } from "@/lib/api-base";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "account" ? "account" : "security";
  const [activeTab, setActiveTab] = useState<"security" | "account">(initialTab);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 2FA state
  const [totpCode, setTotpCode] = useState("");
  const [showDisable2faForm, setShowDisable2faForm] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [showDisableLoginMfaForm, setShowDisableLoginMfaForm] = useState(false);
  const [loginMfaPassword, setLoginMfaPassword] = useState("");
  const [disablingLoginMfa, setDisablingLoginMfa] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Account deletion state
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const profile = readUserProfile();
  const token = readAccessToken();
  const apiBase = getApiBaseUrl();
  const hasAccount2faEnabled = Boolean(profile?.is_2fa_enabled);
  const hasLoginMfaEnabled = Boolean(profile?.login_mfa_enabled);
  const is2faEnabled = hasAccount2faEnabled || hasLoginMfaEnabled;

  if (!profile || !token) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700 dark:text-danger-300">
              You need to be logged in to access settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!totpCode.trim()) {
      setError("Please enter your 2FA code to disable 2FA");
      return;
    }

    if (!/^\d{6}$/.test(totpCode.trim())) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setDisabling(true);
    try {
      const response = await fetch(`${apiBase}/v1/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: totpCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to disable 2FA");
      }

      setSuccess("2FA has been successfully disabled");
      setTotpCode("");
      setShowDisable2faForm(false);
      updateStoredUserProfile({ is_2fa_enabled: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error disabling 2FA");
    } finally {
      setDisabling(false);
    }
  };

  const handleDisableLoginMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginMfaPassword.trim()) {
      setError("Please enter your password to disable login MFA");
      return;
    }

    setDisablingLoginMfa(true);
    try {
      const response = await fetch(`${apiBase}/v1/auth/2fa/login/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: loginMfaPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Failed to disable login MFA");
      }

      updateStoredUserProfile({ login_mfa_enabled: false });
      setLoginMfaPassword("");
      setShowDisableLoginMfaForm(false);
      setSuccess("Login MFA has been disabled successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error disabling login MFA");
    } finally {
      setDisablingLoginMfa(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword.trim()) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${apiBase}/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (deleteConfirmation.toLowerCase() !== "delete my account") {
      setError("Please type 'delete my account' to confirm");
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${apiBase}/v1/users/delete-self`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || "Failed to delete account");
      }

      setSuccess("Your account has been deleted");
      setTimeout(() => {
        clearAuthSession();
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "account"
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Account
          </button>
        </div>

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700 dark:text-danger-300">
                  {error}
                </p>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success-700 dark:text-success-300">
                  {success}
                </p>
              </div>
            )}

            {/* Two-Factor Authentication Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Manage your account security
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    is2faEnabled
                      ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {is2faEnabled ? "Enabled" : "Disabled"}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {hasLoginMfaEnabled && (
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Login MFA is currently enabled. You can disable email verification at login.
                    </p>

                    {!showDisableLoginMfaForm ? (
                      <Button
                        onClick={() => setShowDisableLoginMfaForm(true)}
                        variant="outline"
                        className="text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                      >
                        Disable Login MFA
                      </Button>
                    ) : (
                      <form onSubmit={handleDisableLoginMfa} className="space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Confirm your password to disable login MFA:
                        </p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="password"
                            value={loginMfaPassword}
                            onChange={(e) => setLoginMfaPassword(e.target.value)}
                            placeholder="Your password"
                            className="w-full max-w-xs px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <Button
                            type="submit"
                            disabled={disablingLoginMfa}
                            className="bg-danger-600 dark:bg-danger-700 hover:bg-danger-700 dark:hover:bg-danger-800 text-white"
                          >
                            {disablingLoginMfa ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Disabling...
                              </>
                            ) : (
                              "Disable"
                            )}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowDisableLoginMfaForm(false);
                            setLoginMfaPassword("");
                            setError("");
                          }}
                          variant="ghost"
                          className="text-slate-600 dark:text-slate-400"
                        >
                          Cancel
                        </Button>
                      </form>
                    )}
                  </div>
                )}

                {hasAccount2faEnabled ? (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Your account is protected with two-factor authentication using a
                        time-based one-time password (TOTP) authenticator app.
                      </p>

                      {!showDisable2faForm ? (
                        <Button
                          onClick={() => setShowDisable2faForm(true)}
                          variant="outline"
                          className="text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        >
                          Disable 2FA
                        </Button>
                      ) : (
                        <form onSubmit={handleDisable2fa} className="space-y-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Enter your 6-digit authentication code to disable 2FA:
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="000000"
                              value={totpCode}
                              onChange={(e) =>
                                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-mono tracking-widest text-center"
                            />
                            <Button
                              type="submit"
                              disabled={disabling}
                              className="bg-danger-600 dark:bg-danger-700 hover:bg-danger-700 dark:hover:bg-danger-800 text-white"
                            >
                              {disabling ? (
                                <>
                                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                                  Disabling...
                                </>
                              ) : (
                                "Disable"
                              )}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowDisable2faForm(false);
                              setTotpCode("");
                              setError("");
                            }}
                            variant="ghost"
                            className="text-slate-600 dark:text-slate-400"
                          >
                            Cancel
                          </Button>
                        </form>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Email login verification is active for this account. App-based TOTP 2FA is not enabled.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Change your password regularly to keep your account secure.
                </p>
                
                {!showPasswordForm ? (
                  <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showOldPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="Enter new password (min 8 chars)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={changingPassword}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        {changingPassword ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setError("");
                        }}
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-700 dark:text-danger-300">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-success-700 dark:text-success-300">
                  {success}
                </p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <p className="text-slate-900 dark:text-white">
                    {profile ? `${profile.first_name} ${profile.last_name}` : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <p className="text-slate-900 dark:text-white">{profile?.email || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <p className="text-slate-900 dark:text-white capitalize">
                    {profile?.role || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Organization
                  </label>
                  <p className="text-slate-900 dark:text-white">
                    {profile?.tenant_name || "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Irreversible actions for your account. Proceed with caution.
                </p>
                
                {!showDeleteForm ? (
                  <Button
                    onClick={() => setShowDeleteForm(true)}
                    variant="outline"
                    className="text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  >
                    Delete Account
                  </Button>
                ) : (
                  <form onSubmit={handleDeleteAccount} className="space-y-4 p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                    <div>
                      <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mb-2">
                        ⚠️ This action cannot be undone. All your data will be permanently deleted.
                      </p>
                      <p className="text-sm text-danger-600 dark:text-danger-400 mb-4">
                        Type "delete my account" below to confirm:
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="delete my account"
                        className="w-full px-4 py-2 border border-danger-300 dark:border-danger-700 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={deleting || deleteConfirmation.toLowerCase() !== "delete my account"}
                        className="bg-danger-600 dark:bg-danger-700 hover:bg-danger-700 dark:hover:bg-danger-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Permanently Delete Account"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowDeleteForm(false);
                          setDeleteConfirmation("");
                          setError("");
                        }}
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
