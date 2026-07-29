import { TermsOfServiceText } from "@/components/auth/legal-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Venting",
  description: "Terms and conditions governing the use of Venting, automated AI features, safety moderation, and community behavior rules.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Button asChild variant="ghost" size="icon" className="mb-4">
        <Link href="/dashboard">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Back to App</span>
        </Link>
      </Button>
      <Card className="w-full max-w-4xl mx-auto shadow-lg bg-card/60 backdrop-blur-md border-white/10 dark:border-white/5">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Terms and Conditions</CardTitle>
          <CardDescription>
            Last Updated: July 2026 (Including AI Feature Terms & Safety Moderation)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TermsOfServiceText />
        </CardContent>
      </Card>
    </div>
  );
}
