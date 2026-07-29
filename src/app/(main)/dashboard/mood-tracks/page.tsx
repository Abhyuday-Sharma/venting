import ProtectedPage from "@/components/auth/protected-page";
import { MoodTracksClient } from "@/components/dashboard/mood-tracks-client";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mood Tracks",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MoodTracksPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading mood tracks...</div>}>
        <MoodTracksClient />
      </Suspense>
    </ProtectedPage>
  );
}
