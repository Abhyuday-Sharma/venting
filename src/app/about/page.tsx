
import { VentingShowcase } from "@/components/landing/venting-showcase";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to App</span>
          </Link>
        </Button>
      </div>
      <VentingShowcase mode="post-auth" />
    </div>
  );
}
