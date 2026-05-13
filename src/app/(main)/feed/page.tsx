import ProtectedPage from "@/components/auth/protected-page";
import { PublicFeed } from "@/components/feed/public-feed";
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <ProtectedPage>
        <Suspense fallback={<div className="container mx-auto p-4 md:p-8">Loading feed...</div>}>
            <PublicFeed />
        </Suspense>
    </ProtectedPage>
  );
}
