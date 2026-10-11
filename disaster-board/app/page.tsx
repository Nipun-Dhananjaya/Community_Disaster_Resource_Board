import { EmergencyBar } from "/components/EmergencyBar";
import { Header } from "/components/Header";
import { IncidentBanner } from "/components/IncidentBanner";
import { Hero } from "/components/Hero";
import { StatsStrip } from "/components/StatsStrip";
import { LatestUpdates } from "/components/LatestUpdates";
import { HowItWorks } from "/components/HowItWorks";
import { Footer } from "/components/Footer";

export default function HomePage() {
  return (
    <>
      <EmergencyBar />
      <Header />
      <IncidentBanner />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 sm:px-8">
        <Hero />
        <StatsStrip />
        <LatestUpdates />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
