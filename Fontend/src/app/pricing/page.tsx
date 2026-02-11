"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import CostSimulator from "@/components/pricing/CostSimulator";

export default function PricingPage() {
  return (
    <AppLayout>
      <CostSimulator />
    </AppLayout>
  );
}
