import { FeedbackForm } from "@/components/feedback/feedback-form";
import ProtectedPage from "@/components/auth/protected-page";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function FeedbackPage() {
  return (
    <ProtectedPage>
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <Button asChild variant="ghost" size="icon" className="mb-4">
            <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to App</span>
            </Link>
        </Button>
        <Suspense fallback={<div>Loading form...</div>}>
          <FeedbackForm />
        </Suspense>
      </div>
    </ProtectedPage>
  );
}
