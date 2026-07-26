import { VentingShowcase } from "@/components/landing/venting-showcase";

export const metadata = {
  title: "Discover Venting – Emotional Wellness & Growth Platform",
  description:
    "Explore Venting: a safe space for emotional expression, AI-powered growth tools, mood tracking, and a supportive anonymous community. More than just venting.",
};

export default function ShowcasePage() {
  return <VentingShowcase mode="pre-auth" />;
}
