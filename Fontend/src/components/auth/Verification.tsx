"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";

export default function VerificationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // TODO: Get token from URL params and call your API
      // const response = await fetch('http://127.0.0.1:8000/auth/verify?token=...');
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API
      setIsVerified(true);
    } catch (err) {
      setError("Verification link is invalid or has expired.");
    } finally {
      setIsLoading(false);
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
              ? "Your account is now active. You can proceed to the dashboard."
              : "Please click the button below to confirm your email address and activate your account."}
          </p>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!isVerified ? (
            <Button 
              onClick={handleVerify} 
              className="w-full h-11 gap-2" 
              disabled={isLoading}
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
          ) : (
            <Button 
              onClick={() => window.location.href = "/dashboard"} 
              className="w-full h-11 gap-2 bg-green-600 hover:bg-green-700"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Didn't receive an email? Resend link
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}