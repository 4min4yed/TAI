"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import ComplianceMatrix from "@/components/compliance/ComplianceMatrix";

export default function CompliancePage() {
  return (
    <AppLayout>
      <ComplianceMatrix />
    </AppLayout>
  );
}
