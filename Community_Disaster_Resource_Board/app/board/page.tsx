import type { Metadata } from "next";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { BoardClient } from "../../components/board/BoardClient";
import { categoryOrder, Category } from "../../lib/listings";

export const metadata: Metadata = {
  title: "Resource Board · Community Disaster Resource Board",
  description: "Search shelters, supplies, volunteers, transport and requests near you.",
};

type Params = { near?: string; category?: string };

export default async function BoardPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const category = categoryOrder.find((c) => c === sp.category) as Category | undefined;

  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 py-8 sm:px-8">
        <h1 className="sr-only">Resource Board</h1>
        <BoardClient initialQuery={sp.near ?? ""} initialCategory={category ?? "shelter"} />
      </main>
      <Footer />
    </>
  );
}
