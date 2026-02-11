"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Key,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Password reset requested for:", email);
      setIsSuccess(true);
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setEmail("");
    setError("");
    setEmailError("");
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: "Secure Reset",
      description: "Encrypted link sent to your email",
    },
    {
      icon: Key,
      title: "One-time Link",
      description: "Valid for 1 hour only",
    },
    {
      icon: CheckCircle2,
      title: "Account Protection",
      description: "Additional verification if needed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Information */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  TenderAI
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Intelligent Tender Management
                </p>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Reset Your Password
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Don't worry! It happens. We'll send you a secure link to reset
              your password.
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-4">
              How it works
            </h3>
            {securityFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Help Link */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Need help?</strong> Contact our support team at{" "}
              <a
                href="mailto:support@tenderai.com"
                className="underline hover:text-blue-700 dark:hover:text-blue-100"
              >
                support@tenderai.com
              </a>
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <Card className="bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800">
          {!isSuccess ? (
            <>
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Forgot Password?
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Error Alert */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        onBlur={() => validateEmail(email)}
                        className={cn(
                          "w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                          emailError
                            ? "border-red-300 dark:border-red-700"
                            : "border-slate-300 dark:border-slate-700",
                        )}
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full justify-center gap-2 h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6">
                  <a
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </a>
                </div>

                {/* Alternative Options */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Don't have an account?
                  </p>
                  <a
                    href="/signup"
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Sign up for free
                  </a>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              {/* Success State */}
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Check Your Email
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We've sent a password reset link to
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {email}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Next Steps:
                    </h4>
                    <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Check your email inbox (and spam folder)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Click the reset link in the email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Create a new password</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">4.</span>
                        <span>Sign in with your new password</span>
                      </li>
                    </ol>
                  </div>

                  {/* Resend Button */}
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Didn't receive the email?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Resending...
                        </>
                      ) : (
                        "Resend Reset Link"
                      )}
                    </Button>
                  </div>

                  {/* Try Different Email */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Try a different email address
                    </button>
                  </div>

                  {/* Back to Login */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                    <a
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Sign In
                    </a>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
