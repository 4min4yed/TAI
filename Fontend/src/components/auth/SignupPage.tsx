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
  User,
  Building2,
  CheckCircle2,
  Shield,
  Zap,
  FileText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.length < 2) return "First name must be at least 2 characters";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.length < 2) return "Last name must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      case "company":
        if (!value.trim()) return "Company name is required";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain uppercase, lowercase, and number";
        }
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(
        key,
        formData[key as keyof typeof formData],
      );
      if (errorMsg) newErrors[key] = errorMsg;
    });

    if (!acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Signup data:", formData);

      // Redirect to verification page or dashboard
      window.location.href = "/verify-email";
    } catch (err) {
      setError("Failed to create account. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      // TODO: Implement Google OAuth
      console.log("Google signup initiated");
    } catch (err) {
      setError("Failed to connect with Google. Please try again.");
    }
  };

  const handleSlackSignup = async () => {
    setError("");
    try {
      // TODO: Implement Slack OAuth
      console.log("Slack signup initiated");
    } catch (err) {
      setError("Failed to connect with Slack. Please try again.");
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "14-day free trial",
      description: "No credit card required",
    },
    {
      icon: Users,
      title: "Team collaboration",
      description: "Invite unlimited members",
    },
    {
      icon: Zap,
      title: "AI-powered insights",
      description: "Smart tender analysis",
    },
    {
      icon: FileText,
      title: "Unlimited documents",
      description: "Store all your tenders",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center my-8">
        {/* Left Side - Benefits */}
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
              Start Your Free Trial Today
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Join thousands of teams using TenderAI to streamline their
              procurement process and win more contracts.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-3">
                  <benefit.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white font-semibold text-sm"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Join 2,500+ companies
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already using TenderAI
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <Card className="bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Create Your Account
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get started with your 14-day free trial
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Social Signup Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleGoogleSignup}
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span className="font-medium">Sign up with Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-3 h-11"
                onClick={handleSlackSignup}
              >
                <Slack className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Sign up with Slack</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Or sign up with email
                </span>
              </div>
            </div>

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

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.firstName
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.lastName
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.email
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Company Input */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    placeholder="Acme Inc."
                    value={formData.company}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.company
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                </div>
                {errors.company && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.company}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.password
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
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
                {!errors.password && formData.password && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full pl-11 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400",
                      errors.confirmPassword
                        ? "border-red-300 dark:border-red-700"
                        : "border-slate-300 dark:border-slate-700",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-primary-600 border-slate-300 dark:border-slate-700 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full justify-center gap-2 h-11"
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
