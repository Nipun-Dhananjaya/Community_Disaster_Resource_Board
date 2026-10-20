import { notFound, redirect } from "next/navigation";
import { AccountFrame } from "../../../components/dashboard/frames";
import { RequestTracker } from "../../../components/dashboard/account/RequestTracker";
import { PostsCard } from "../../../components/dashboard/account/PostsCard";
import { SavedCard } from "../../../components/dashboard/account/SavedCard";
import { ComingSoon } from "../../../components/dashboard/ui";
import { requireSession } from "../../../lib/server/guard";

const sections: Record<string, { title: string; body: () => React.ReactNode }> = {
  requests: { title: "My requests", body: () => <RequestTracker /> },
  posts: { title: "My posts", body: () => <PostsCard /> },
  saved: { title: "Saved", body: () => <SavedCard /> },
  messages: { title: "Messages", body: () => <ComingSoon title="Messages" /> },
  settings: { title: "Settings", body: () => <ComingSoon title="Settings" /> },
};

export default async function AccountSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = await requireSession(`/account/${section}`);
  if (s.role === "organization") redirect("/org");
  const def = sections[section];
  if (!def) notFound();
  return <AccountFrame title={def.title} subtitle="Your account">{def.body()}</AccountFrame>;
}
