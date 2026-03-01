import ProtectedPage from "@/components/auth/protected-page";
import { MoodTracksClient } from "@/components/dashboard/mood-tracks-client";
import { Suspense } from "react";

export default function MoodTracksPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading mood tracks...</div>}>
        <MoodTracksClient />
      </Suspense>
    </ProtectedPage>
  );
}
