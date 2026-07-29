import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading dashboard...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
