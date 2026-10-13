import type { Metadata } from "next";
import { EmergencyBar } from "@/components/EmergencyBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RequestForm } from "@/components/request/RequestForm";

export const metadata: Metadata = {
  title: "Request help · Community Disaster Resource Board",
  description: "Tell volunteers what you need. No account required.",
};

export default function RequestHelpPage() {
  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-9 sm:px-8">
        <h1 className="sr-only">Request help</h1>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,860px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p role="note" className="rounded-xl border border-[#e8b4ae] bg-alert-soft px-5 py-4 text-[16px]">
              <strong className="text-[#9a1c14]">If life is in danger, call 119 first.</strong> Then use this form so volunteers can find you.
            </p>
            <div className="mt-8">
              <RequestForm />
            </div>
          </div>

          <aside className="space-y-4 lg:mt-[70px]">
            <section className="rounded-xl border border-line bg-white p-6">
              <h2 className="text-[18px] font-bold">No signal?</h2>
              <p className="mt-3 text-[16px] leading-7 text-muted">
                Your answers are saved on this phone and sent when you reconnect. You can also text HELP to the community SMS number.
              </p>
            </section>
            <section className="rounded-xl border border-line bg-white p-6">
              <h2 className="text-[18px] font-bold">Who sees this?</h2>
              <p className="mt-3 text-[16px] leading-7 text-muted">
                The public board shows only what you need and your general area. Your name and phone go to verified responders.
              </p>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
