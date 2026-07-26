
import ProtectedPage from "@/components/auth/protected-page";
import { MyMomentsClient } from "@/components/moments/my-moments-client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function MyMomentsPage() {
  return (
    <ProtectedPage>
      <div className="container mx-auto p-4 md:p-8">
        <Button asChild variant="ghost" className="mb-4 pl-1">
          <Link href="/moments">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Bright Spots
          </Link>
        </Button>
        <Suspense
          fallback={
            <div className="container mx-auto p-4 md:p-8">
              Loading your bright spots...
            </div>
          }
        >
          <MyMomentsClient />
        </Suspense>
      </div>
    </ProtectedPage>
  );
}
