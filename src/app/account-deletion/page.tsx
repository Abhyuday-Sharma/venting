import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ShieldCheck, Trash2, Smartphone, Clock, FileText, CheckCircle } from "lucide-react";
import { AccountDeletionCard } from "@/components/auth/account-deletion-card";

export const metadata: Metadata = {
  title: "Account & Data Deletion Request",
  description:
    "Learn how to delete your Venting.in account and understand what data is permanently erased and retained under Google Play Data Safety policies.",
  alternates: {
    canonical: "https://venting.in/account-deletion",
  },
  openGraph: {
    title: "Account & Data Deletion | Venting.in",
    description:
      "Permanent account and data deletion portal for Venting.in users, compliant with Google Play Developer Data Safety standards.",
    url: "https://venting.in/account-deletion",
    siteName: "Venting.in",
    images: [
      {
        url: "https://venting.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Venting Account Deletion",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Account & Data Deletion | Venting.in",
    description:
      "Permanent account and data deletion portal for Venting.in users, compliant with Google Play Developer Data Safety standards.",
    images: ["https://venting.in/og-image.png"],
    creator: "@venting_in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AccountDeletionPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-8">
      {/* Navigation & Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/feed" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Venting</span>
          </Link>
        </Button>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Google Play Data Safety & Privacy Compliance
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
            Account & Data Deletion
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            At Venting, privacy is our founding principle. You have the unconditional right to delete your account and all associated personal data at any time.
          </p>
        </div>
      </div>

      {/* Information Cards: What is Deleted vs Retained */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              What Data is Permanently Deleted
            </CardTitle>
            <CardDescription>
              All the following items are erased immediately from our databases upon deletion:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Authentication Account:</strong> Firebase Auth credentials, email address, display name, and profile photos.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Username Reservation:</strong> Your unique username handle is unlinked and released.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Private Journals & Vents:</strong> Every private vent, mood rating, emotion tag, and audio note.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Public Posts & Comments:</strong> All public vents authored by you, along with associated comments and thread replies.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">App Preferences & Notifications:</strong> Notification history, quiet hours, and settings.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              Data Retention & Transparency Policy
            </CardTitle>
            <CardDescription>
              How we handle remaining logs and timelines:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Zero AI Training:</strong> Your vented thoughts and emotions are never saved, trained on, or retained by AI models.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span><strong className="text-foreground">No Advertising / Data Sale:</strong> We never sell or share user data with third-party advertising brokers.</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Security Logs (Max 30 Days):</strong> Anonymized server infrastructure access logs (IP, timestamp) are kept for up to 30 days strictly for DDoS and security defense, then purged automatically.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In-App Deletion Instructions */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            How to Delete Your Account From the Android App
          </CardTitle>
          <CardDescription>
            You can delete your account directly inside the installed Venting Android app in seconds:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open the <strong className="text-foreground">Venting</strong> app on your Android device.</li>
            <li>Tap on the <strong className="text-foreground">Settings</strong> tab in the bottom navigation bar (or your profile avatar in the header).</li>
            <li>Scroll down to the bottom of the Settings page.</li>
            <li>Tap the red <strong className="text-destructive">Delete Account</strong> button.</li>
            <li>Confirm the prompt in the verification dialog. Your account and all data will be permanently wiped immediately.</li>
          </ol>
        </CardContent>
      </Card>

      {/* Interactive Web Deletion & Request Form */}
      <AccountDeletionCard />

      {/* Footer Support Info */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-white/10">
        <p>
          Questions about your personal data or privacy rights? Read our{" "}
          <Link href="/legal/privacy-policy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>{" "}
          or email our Data Protection Team at{" "}
          <a href="mailto:support@venting.in" className="underline hover:text-foreground">
            support@venting.in
          </a>.
        </p>
      </div>
    </div>
  );
}
