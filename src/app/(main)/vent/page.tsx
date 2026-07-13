import { VentForm } from "@/components/vent/vent-form";
import { Suspense } from "react";

export default function VentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VentForm />
    </Suspense>
  );
}
