

import ProtectedPage from "@/components/auth/protected-page";
import { SettingsForm } from "@/components/settings/settings-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <ProtectedPage>
      <div className="container mx-auto max-w-3xl p-4 md:p-8">
        <Button asChild variant="ghost" size="icon" className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to App</span>
          </Link>
        </Button>
        <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsForm />
        </Suspense>
      </div>
    </ProtectedPage>
  );
}
