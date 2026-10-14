import type { Metadata } from "next";
import { Suspense } from "react";
import { EmergencyBar } from "../../components/EmergencyBar";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { SignupForm } from "../../components/auth/AuthForms";

export const metadata: Metadata = { title: "Create account · Community Disaster Resource Board" };

export default function Page() {
  return (
    <>
      <EmergencyBar />
      <Header />
      <main id="main" className="mx-auto w-full max-w-[1328px] px-4 pb-20 pt-12 sm:px-8">
        <div className="mx-auto max-w-[480px] rounded-2xl border border-line bg-white p-7 sm:p-9">
          <h1 className="font-display text-[34px] font-bold leading-tight">Create account</h1>
          <p className="mb-6 mt-2 text-[16px] text-muted">It takes a minute. You do not need an account to ask for help.</p>
          <Suspense fallback={null}>
            <SignupForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
