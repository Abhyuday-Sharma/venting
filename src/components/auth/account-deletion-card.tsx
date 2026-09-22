"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site-config";
import { useAuth } from "@/hooks/use-auth";
import { deleteUserAccount, submitFeedback } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle, CheckCircle2, Loader2, LogIn, Mail, ShieldCheck } from "lucide-react";

export function AccountDeletionCard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // In-app direct deletion states
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual deletion request states (for non-authenticated users)
  const [manualEmail, setManualEmail] = useState("");
  const [manualUsername, setManualUsername] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleDeleteCurrentAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUserAccount(user);
      toast({
        title: "Account Permanently Deleted",
        description: "Your account, vents, and data have been completely expunged.",
      });
      router.push("/login?deleted=true");
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "An error occurred while deleting your account. Please re-authenticate and try again.",
      });
      setIsDeleting(false);
    }
  };

  const handleManualRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please provide the email address associated with your Venting account.",
      });
      return;
    }

    setIsSubmittingRequest(true);
    try {
      // Save manual deletion request into feedback/support queue for manual verification
      await submitFeedback({
        userId: "manual_deletion_request",
        userName: manualUsername.trim() || "Account Deletion Request",
        rating: 1,
        text: `[ACCOUNT DELETION REQUEST]\nEmail: ${manualEmail.trim()}\nUsername: ${manualUsername.trim() || "N/A"}\nReason/Notes: ${manualReason.trim() || "None"}`,
      });

      setRequestSubmitted(true);
      toast({
        title: "Deletion Request Received",
        description: "Our privacy team has logged your deletion request. We will process it within 24–48 hours.",
      });
    } catch (error: any) {
      console.error("Manual deletion request error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: `Unable to send deletion request. Please contact ${CONTACT_EMAIL} directly.`,
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Interactive Account Deletion Module */}
      {loading ? (
        <Card className="border-white/10 bg-card/60 backdrop-blur-md">
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : user ? (
        <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-md shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-xl">You are signed in as @{user.username}</CardTitle>
            </div>
            <CardDescription>
              Registered Email: <span className="font-medium text-foreground">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can instantly trigger complete deletion of your account and all data directly from this browser session.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto flex items-center gap-2" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete @{user.username} Immediately
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely certain?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <span className="block font-semibold text-destructive">
                      This action is permanent and cannot be undone.
                    </span>
                    <span className="block text-sm">
                      Your authentication credentials, private journals, mood tracking records, public vents, comments, and notifications will be immediately erased from our databases.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCurrentAccount}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary" />
              Method 1: Instant Self-Service Deletion (Recommended)
            </CardTitle>
            <CardDescription>
              Sign in to verify your identity and instantly delete your account with one click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/login?redirect=/account-deletion">
                Sign In to Delete Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manual Request Form for users without app or login access */}
      <Card className="border-white/10 bg-card/60 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Method 2: Submit a Manual Deletion Request
          </CardTitle>
          <CardDescription>
            If you have uninstalled the Venting app, lost access to your login provider, or need assistance, submit your details below or email us directly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestSubmitted ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-emerald-300">Deletion Request Received</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your request has been logged. Our data protection officer will verify your identity via email and completely erase your account records within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleManualRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Registered Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  placeholder="e.g. anonymous_venter"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Additional Notes (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Any details or confirmation you'd like to provide..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  rows={3}
                  className="bg-background/50"
                />
              </div>

              <Button type="submit" disabled={isSubmittingRequest} className="w-full sm:w-auto">
                {isSubmittingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  "Submit Account Deletion Request"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
