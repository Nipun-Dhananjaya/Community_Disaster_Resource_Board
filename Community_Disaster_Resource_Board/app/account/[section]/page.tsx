import { notFound, redirect } from "next/navigation";
import { AccountFrame } from "../../../components/dashboard/frames";
import { MessagesApp } from "../../../components/dashboard/account/MessagesApp";
import { PostsCard } from "../../../components/dashboard/account/PostsCard";
import { RequestTracker } from "../../../components/dashboard/account/RequestTracker";
import { SavedCard } from "../../../components/dashboard/account/SavedCard";
import { SettingsApp } from "../../../components/dashboard/account/SettingsApp";
import { requireSession } from "../../../lib/server/guard";
import { recentSignIns } from "../../../lib/server/data";
import { listConversations } from "../../../lib/server/messages";
import { findById } from "../../../lib/server/users";

export const dynamic = "force-dynamic";

export default async function AccountSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = await requireSession(`/account/${section}`);
  if (s.role === "organization") redirect("/org");
  const staff = s.role === "admin" || s.role === "moderator";

  switch (section) {
    case "requests": return <AccountFrame title="My requests" subtitle="Your account"><RequestTracker /></AccountFrame>;
    case "posts": return <AccountFrame title="My posts" subtitle="Your account"><PostsCard /></AccountFrame>;
    case "saved": return <AccountFrame title="Saved" subtitle="Your account"><SavedCard /></AccountFrame>;
    case "messages":
      return <AccountFrame title="Messages"><MessagesApp initial={listConversations(s)} staff={staff} /></AccountFrame>;
    case "settings": {
      const u = findById(s.id);
      if (!u) notFound();
      return (
          <AccountFrame title="Settings">
            <SettingsApp
                initial={{
                  profile: { name: u.name, phone: u.phone ?? "", email: u.email ?? "", homeArea: u.homeArea ?? "" },
                  prefs: u.prefs, staff,
                  signIns: staff ? recentSignIns(u.name).map((e) => ({ at: e.at, action: e.action, result: e.result })) : [],
                }}
            />
          </AccountFrame>
      );
    }
    default: notFound();
  }
}
