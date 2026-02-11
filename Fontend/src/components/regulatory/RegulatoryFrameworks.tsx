"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Scale,
  Shield,
  Landmark,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RegulatoryRequirement {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  reference: string;
  status: "compliant" | "partial" | "not-compliant" | "not-applicable";
}

interface CountryFramework {
  code: string;
  name: string;
  flag: string;
  platform: string;
  requirements: RegulatoryRequirement[];
  procurementLaw: string;
  guaranteeTypes: string[];
  bondRequirements: string[];
}

const frameworks: CountryFramework[] = [
  {
    code: "TN",
    name: "Tunisia",
    flag: "🇹🇳",
    platform: "TUNEPS (Tunisia National Electronic Procurement System)",
    procurementLaw: "Decree 2014-1039 on Public Procurement",
    guaranteeTypes: [
      "Bid Bond (Caution de soumission)",
      "Performance Bond (Caution de bonne exécution)",
      "Advance Payment Guarantee (Caution d'avance de démarrage)",
    ],
    bondRequirements: [
      "Bid Bond: 1-3% of tender value",
      "Performance Bond: 5-10% of contract value",
      "Validity: 90 days minimum for bid bonds",
    ],
    requirements: [
      {
        id: "TN-001",
        title: "Registration in TUNEPS",
        description: "Mandatory registration and validation on TUNEPS platform",
        mandatory: true,
        reference: "Article 5, Decree 2014-1039",
        status: "compliant",
      },
      {
        id: "TN-002",
        title: "Tax Compliance Certificate (Attestation fiscale)",
        description:
          "Certificate from tax authorities showing no outstanding debts",
        mandatory: true,
        reference: "Article 12, Decree 2014-1039",
        status: "compliant",
      },
      {
        id: "TN-003",
        title: "CNSS Certificate (Social Security)",
        description: "Proof of social security contributions",
        mandatory: true,
        reference: "Article 13, Decree 2014-1039",
        status: "compliant",
      },
      {
        id: "TN-004",
        title: "Company Registration (Registre de Commerce)",
        description: "Valid commercial registry extract (<3 months)",
        mandatory: true,
        reference: "Article 10, Decree 2014-1039",
        status: "compliant",
      },
      {
        id: "TN-005",
        title: "Financial Statements (Last 3 years)",
        description: "Audited financial statements with positive equity",
        mandatory: true,
        reference: "Article 14, Decree 2014-1039",
        status: "partial",
      },
    ],
  },
  {
    code: "MA",
    name: "Morocco",
    flag: "🇲🇦",
    platform: "Moroccan Public Procurement Portal",
    procurementLaw: "Decree No. 2-12-349 (2013)",
    guaranteeTypes: [
      "Provisional Guarantee (Cautionnement provisoire)",
      "Definitive Guarantee (Cautionnement définitif)",
      "Retention Guarantee (Garantie de retenue)",
    ],
    bondRequirements: [
      "Provisional: 2% of tender amount",
      "Definitive: 3% of contract amount",
      "Retention: 10% until final acceptance",
    ],
    requirements: [
      {
        id: "MA-001",
        title: "CNSS Registration Certificate",
        description: "National Social Security Fund registration proof",
        mandatory: true,
        reference: "Article 20, Decree 2-12-349",
        status: "compliant",
      },
      {
        id: "MA-002",
        title: "Tax Compliance (Attestation de régularité fiscale)",
        description:
          "Certificate of tax compliance from Direction Générale des Impôts",
        mandatory: true,
        reference: "Article 21, Decree 2-12-349",
        status: "compliant",
      },
      {
        id: "MA-003",
        title: "Professional License (Patente)",
        description: "Valid professional license for the activity domain",
        mandatory: true,
        reference: "Article 19, Decree 2-12-349",
        status: "compliant",
      },
      {
        id: "MA-004",
        title: "Certificates of Technical Capacity",
        description: "Proof of similar projects and technical expertise",
        mandatory: true,
        reference: "Article 24, Decree 2-12-349",
        status: "partial",
      },
      {
        id: "MA-005",
        title: "Bank Reference Letter",
        description: "Banking domiciliation and credit capacity proof",
        mandatory: true,
        reference: "Article 23, Decree 2-12-349",
        status: "compliant",
      },
    ],
  },
  {
    code: "GCC",
    name: "GCC Countries",
    flag: "🏳️",
    platform: "Various National Portals (UAE, KSA, Qatar, etc.)",
    procurementLaw: "GCC Common Market & National Regulations",
    guaranteeTypes: [
      "Bid Bond (Bank Guarantee)",
      "Performance Bond",
      "Advance Payment Guarantee",
      "Retention Money Guarantee",
    ],
    bondRequirements: [
      "Bid Bond: 1-5% of tender value",
      "Performance Bond: 5-10% of contract value",
      "Validity: Minimum 28 days beyond tender validity",
      "Must be from approved local or international banks",
    ],
    requirements: [
      {
        id: "GCC-001",
        title: "Commercial Registration",
        description: "Valid CR from Ministry of Commerce",
        mandatory: true,
        reference: "GCC Procurement Guidelines",
        status: "compliant",
      },
      {
        id: "GCC-002",
        title: "Chamber of Commerce Membership",
        description: "Active membership certificate",
        mandatory: true,
        reference: "GCC Procurement Guidelines",
        status: "compliant",
      },
      {
        id: "GCC-003",
        title: "Zakat/Tax Certificate",
        description: "Zakat, Income & Withholding Tax Certificates",
        mandatory: true,
        reference: "National Tax Authorities",
        status: "not-compliant",
      },
      {
        id: "GCC-004",
        title: "GOSI/Social Insurance",
        description: "General Organization for Social Insurance certificate",
        mandatory: true,
        reference: "GOSI Regulations",
        status: "not-applicable",
      },
      {
        id: "GCC-005",
        title: "Saudization/Emiratization Compliance",
        description: "Local workforce percentage compliance (if applicable)",
        mandatory: false,
        reference: "National Labor Laws",
        status: "partial",
      },
    ],
  },
];

export default function RegulatoryFrameworks() {
  const [selectedCountry, setSelectedCountry] = useState<CountryFramework>(
    frameworks[0],
  );

  const getStatusIcon = (status: RegulatoryRequirement["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="w-4 h-4 text-success-600" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
      case "not-compliant":
        return <AlertCircle className="w-4 h-4 text-danger-600" />;
      case "not-applicable":
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: RegulatoryRequirement["status"]) => {
    switch (status) {
      case "compliant":
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300";
      case "partial":
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300";
      case "not-compliant":
        return "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300";
      case "not-applicable":
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const stats = {
    compliant: selectedCountry.requirements.filter(
      (r) => r.status === "compliant",
    ).length,
    partial: selectedCountry.requirements.filter((r) => r.status === "partial")
      .length,
    nonCompliant: selectedCountry.requirements.filter(
      (r) => r.status === "not-compliant",
    ).length,
    notApplicable: selectedCountry.requirements.filter(
      (r) => r.status === "not-applicable",
    ).length,
  };

  const complianceRate = Math.round(
    (stats.compliant / selectedCountry.requirements.length) * 100
  );

  return <div className="bg-slate-50 dark:bg-slate-950">
      <div className="p-6 space-y-6">
        {/* Country Selector */}
        <div className="flex gap-3">
          {frameworks.map((country) => (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
                selectedCountry.code === country.code
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
              )}
            >
              <span className="text-3xl">{country.flag}</span>
              <div className="text-left">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {country.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {country.code}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {complianceRate}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Compliance Rate
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success-700 dark:text-success-300">
                  {stats.compliant}
                </div>
                <div className="text-xs text-success-700 dark:text-success-300 mt-1">
                  Compliant
                </div>
              </CardContent>
            </Card>
            <Card className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-warning-700 dark:text-warning-300">
                  {stats.partial}
                </div>
                <div className="text-xs text-warning-700 dark:text-warning-300 mt-1">
                  Partial
                </div>
              </CardContent>
            </Card>
            <Card className="bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-danger-700 dark:text-danger-300">
                  {stats.nonCompliant}
                </div>
                <div className="text-xs text-danger-700 dark:text-danger-300 mt-1">
                  Non-Compliant
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {stats.notApplicable}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  N/A
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Platform Info */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Procurement Platform
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedCountry.platform}
                </p>
              </CardContent>
            </Card>

            {/* Legal Framework */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Procurement Law
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedCountry.procurementLaw}
                </p>
              </CardContent>
            </Card>

            {/* Guarantee Types */}
            <Card className="dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Required Guarantees
                </h3>
                <ul className="space-y-2">
                  {selectedCountry.guaranteeTypes.map((type, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>{type}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Bond Requirements */}
          <Card className="mb-6 dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                Bond & Guarantee Requirements
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedCountry.bondRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {req}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements Table */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Regulatory Requirements Checklist
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Requirement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Legal Reference
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedCountry.requirements.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {req.id}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {req.title}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {req.description}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium",
                              req.mandatory
                                ? "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
                            )}
                          >
                            {req.mandatory ? "Mandatory" : "Optional"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {req.reference}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium w-fit",
                              getStatusColor(req.status),
                            )}
                          >
                            {getStatusIcon(req.status)}
                            {req.status
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(" ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
