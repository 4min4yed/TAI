"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import SettingsPage from "@/components/settings/SettingsPage";

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <SettingsPage />
    </AppLayout>
  );
}
