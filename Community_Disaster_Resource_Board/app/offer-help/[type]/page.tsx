import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmergencyBar } from "../../../components/EmergencyBar";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { OfferForm } from "../../../components/offer/OfferForm";
import { isOfferType, offerConfigs, offerTypes } from "../../../lib/offer-config";

type Props = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return offerTypes.map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  return { title: isOfferType(type) ? `${offerConfigs[type].title} · Community Disaster Resource Board` : "Not found" };
}

export default async function OfferFormPage({ params }: Props) {
  const { type } = await params;
  if (!isOfferType(type)) notFound();
  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-9 sm:px-8">
        <OfferForm slug={type} />
      </main>
      <Footer />
    </>
  );
}
