import type { Metadata } from "next";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { GuideBrowser } from "../../components/guides/GuideBrowser";

export const metadata: Metadata = {
  title: "Safety guides · Community Disaster Resource Board",
  description: "What to do before, during and after floods, earthquakes, cyclones, landslides, fires and outbreaks.",
};

export default function SafetyGuidesPage() {
  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <h1 className="mb-6 font-display text-[44px] font-bold leading-tight sm:text-[52px]">Safety guides</h1>
        <GuideBrowser />
      </main>
      <Footer />
    </>
  );
}
