"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Chrome,
  Slack,
  Shield,
  Zap,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, rememberMe })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      console.log("Email login:", { email, password, rememberMe });

      // Store token if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // Redirect to dashboard after successful login
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      // TODO: Implement Google OAuth flow
      // For NextAuth.js: signIn('google', { callbackUrl: '/dashboard' })
      // For custom implementation:
      // window.location.href = '/api/auth/google';

      console.log("Google login initiated");
      // Temporary: Simulate OAuth redirect
      // window.location.href = '/dashboard';
    } catch (err) {
      setError("Failed to connect with Google. Please try again.");
      console.error("Google login error:", err);
    }
  };

  const handleSlackLogin = async () => {
    setError("");
    try {
      // TODO: Implement Slack OAuth flow
      // For NextAuth.js: signIn('slack', { callbackUrl: '/dashboard' })
      // For custom implementation:
      // window.location.href = '/api/auth/slack';

      console.log("Slack login initiated");
      // Temporary: Simulate OAuth redirect
      // window.location.href = '/dashboard';
    } catch (err) {
      setError("Failed to connect with Slack. Please try again.");
      console.error("Slack login error:", err);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with ISO 27001 certification",
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Intelligent tender analysis and proposal generation",
    },
    {
      icon: CheckCircle2,
      title: "Compliance Tracking",
      description: "Real-time compliance monitoring and alerts",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized vault with version control",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
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
              Win More Tenders with AI
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Streamline your procurement process with automated compliance
              checking, AI-powered proposal generation, and real-time
              collaboration.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Certified
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              99.9% Uptime
            </Badge>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sign in to access your tender dashboard
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleGoogleLogin}
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span className="font-medium">Continue with Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleSlackLogin}
              >
                <Slack className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Continue with Slack</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
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

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    onBlur={() => validatePassword(password)}
                    className={cn(
                      "w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      passwordError
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-700 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>

                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Forgot password?
                </a>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Sign up for free
                </a>
              </p>
            </div>

            {/* Terms & Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="underline hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="underline hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Branding */}
        <div className="lg:hidden text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © 2026 TenderAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
