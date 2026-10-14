"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, onAuthChange, DemoUser } from "../../lib/auth";

export function LoginPrompt() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => { setUser(getUser()); setReady(true); };
    read();
    return onAuthChange(read);
  }, []);

  if (!ready) return <div className="h-[96px]" aria-hidden="true" />;
  if (user) {
    return (
      <section className="rounded-xl border border-line bg-[#eef3fb] p-6">
        <h2 className="text-[17px] font-bold">Signed in as {user.name}</h2>
        <p className="mt-1 text-[15px] text-muted">Your listing goes live after a quick check.</p>
      </section>
    );
  }
  return (
    <section aria-labelledby="login-h" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-[#eef3fb] p-6">
      <div>
        <h2 id="login-h" className="text-[17px] font-bold">Log in to post</h2>
        <p className="mt-1 text-[15px] text-muted">We will bring you straight back to this page. Organizations can add a verified badge.</p>
      </div>
      <div className="flex gap-3">
        <Link href="/signup?next=/offer-help" className="rounded-lg border-2 border-navy bg-white px-5 py-3 font-bold hover:bg-navy hover:text-white">Create account</Link>
        <Link href="/login?next=/offer-help" className="rounded-lg bg-navy px-6 py-3.5 font-bold text-white hover:bg-navy-soft">Log in</Link>
      </div>
    </section>
  );
}
