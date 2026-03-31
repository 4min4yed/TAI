"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const action = useMemo(() => searchParams.get("action") || "", [searchParams]);
  const prefilledEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isNotMeLoading, setIsNotMeLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [tokenState, setTokenState] = useState<"checking" | "valid" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [emailForResend, setEmailForResend] = useState(prefilledEmail);

  useEffect(() => {
    setEmailForResend(prefilledEmail);
  }, [prefilledEmail]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenState("invalid");
        setError("Missing verification token.");
        return;
      }

      setTokenState("checking");
      setError("");
      try {
        const response = await fetch("http://127.0.0.1:8000/v1/auth/verify-email/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok || !data.valid) {
          setTokenState("invalid");
          setError(data?.message || "Verification link is invalid or has expired.");
          return;
        }
        setTokenState("valid");
      } catch (err) {
        setTokenState("invalid");
        setError("Unable to validate verification link right now.");
      }
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    if (action !== "not-me" || !token) {
      return;
    }

    const executeNotMe = async () => {
      setIsNotMeLoading(true);
      setError("");
      setNotice("");
      try {
        const response = await fetch("http://127.0.0.1:8000/v1/auth/verify-email/not-me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Unable to process this request.");
        }
        setNotice(data.message || "If a pending signup exists, it has been canceled.");
      } catch (err) {
        setError("Unable to process this request right now.");
      } finally {
        setIsNotMeLoading(false);
      }
    };

    executeNotMe();
  }, [action, token]);

  const handleVerify = async () => {
    if (!password) {
      setError("Please enter your password to confirm this verification.");
      return;
    }

    setIsLoading(true);
    setError("");
    setNotice("");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/v1/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== "verified") {
        setError(data?.message || "Verification failed.");
        return;
      }

      setIsVerified(true);
      setNotice("Email verified. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError("Verification link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!emailForResend) {
      setError("Please enter your email to resend the verification link.");
      return;
    }

    setIsResending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("http://127.0.0.1:8000/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForResend }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to resend verification instructions.");
      }
      setNotice(data.message || "If an account exists, we've sent instructions.");
    } catch (err) {
      setError("Unable to resend verification instructions.");
    } finally {
      setIsResending(false);
    }
  };

  const handleNotMe = async () => {
    if (!token) {
      setError("Missing verification token.");
      return;
    }
    setIsNotMeLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("http://127.0.0.1:8000/v1/auth/verify-email/not-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Unable to process this request.");
      }
      setNotice(data.message || "If a pending signup exists, it has been canceled.");
    } catch (err) {
      setError("Unable to process this request right now.");
    } finally {
      setIsNotMeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              {isVerified ? (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              ) : (
                <Mail className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {isVerified ? "Email Verified!" : "Verify Your Email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {isVerified 
              ? "Your account is now active. You will be redirected to login."
              : "Use the verification link token and confirm with your password to activate your account."}
          </p>

          {tokenState === "checking" && !isVerified && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300">
              Checking your verification link...
            </div>
          )}

          {notice && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
              {notice}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!isVerified && tokenState === "valid" ? (
            <div className="space-y-3 text-left">
              <label
                htmlFor="verification-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Confirm your password
              </label>
              <input
                id="verification-password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your signup password"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          ) : null}

          {!isVerified && tokenState === "valid" ? (
            <Button 
              onClick={handleVerify} 
              className="w-full h-11 gap-2" 
              disabled={isLoading || isNotMeLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify Email Address</span>
                  <ShieldCheck className="w-5 h-5" />
                </>
              )}
            </Button>
          ) : isVerified ? (
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>This link is invalid or expired. You can request a new one below.</span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <input
                type="email"
                value={emailForResend}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailForResend(e.target.value)}
                placeholder="Enter your email to resend"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isResending || isLoading || isNotMeLoading}
              >
                {isResending ? "Sending..." : "Resend verification link"}
              </Button>
              <button
                type="button"
                onClick={handleNotMe}
                disabled={isNotMeLoading || isLoading}
                className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
              >
                {isNotMeLoading ? "Processing..." : "This wasn't me"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}