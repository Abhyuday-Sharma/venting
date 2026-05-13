import ProtectedPage from "@/components/auth/protected-page";
import { DashboardClient } from "./dashboard-client";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading dashboard...</div>}>
        <DashboardClient />
      </Suspense>
    </ProtectedPage>
  );
}
