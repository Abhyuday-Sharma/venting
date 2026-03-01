import ProtectedPage from "@/components/auth/protected-page";
import { VentForm } from "@/components/vent/vent-form";
import { Suspense } from "react";

export default function VentPage() {
  return (
    <ProtectedPage>
      <Suspense fallback={<div>Loading...</div>}>
        <VentForm />
      </Suspense>
    </ProtectedPage>
  );
}
