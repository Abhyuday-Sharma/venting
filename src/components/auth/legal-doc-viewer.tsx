
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { PrivacyPolicyText, TermsOfServiceText } from "./legal-text";

interface LegalDocViewerProps {
  type: "terms" | "privacy" | null;
  onOpenChange: (isOpen: boolean) => void;
}

export function LegalDocViewer({ type, onOpenChange }: LegalDocViewerProps) {
  if (!type) {
    return null;
  }

  const isOpen = !!type;
  const isTerms = type === "terms";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isTerms ? "Terms and Conditions" : "Privacy Policy"}
          </DialogTitle>
          <DialogDescription>
            Last Updated: August 1, 2024
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-6">
            {isTerms ? <TermsOfServiceText /> : <PrivacyPolicyText />}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
