import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountFrame } from "../../components/dashboard/frames";
import { RequestTracker } from "../../components/dashboard/account/RequestTracker";
import { PostsCard } from "../../components/dashboard/account/PostsCard";
import { SavedCard } from "../../components/dashboard/account/SavedCard";
import { StatCard } from "../../components/dashboard/ui";
import { requireSession } from "../../lib/server/guard";

export const metadata: Metadata = { title: "My account · Community Disaster Resource Board" };

export default async function AccountPage() {
  const s = await requireSession("/account");
  if (s.role === "organization") redirect("/org");
  const first = s.name.split(" ")[0];
  return (
    <AccountFrame title={`Hello, ${first}`} subtitle="Your requests, posts and saved places" action={{ href: "/request-help", label: "Request help" }}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="My requests" value={2} />
        <StatCard label="My posts" value={3} />
        <StatCard label="Saved" value={8} />
        <StatCard label="New messages" value={4} />
      </div>
      <div className="mt-5"><RequestTracker /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <PostsCard />
        <SavedCard />
      </div>
    </AccountFrame>
  );
}
