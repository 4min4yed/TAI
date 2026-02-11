"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import DocumentVault from "@/components/documents/DocumentVault";

export default function DocumentsPage() {
  return (
    <AppLayout>
      <DocumentVault />
    </AppLayout>
  );
}
