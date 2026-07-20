import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading dashboard...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
