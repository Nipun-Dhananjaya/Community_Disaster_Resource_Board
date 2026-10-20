import Link from "next/link";
import { demoPosts } from "../../../lib/dashboard-demo";
import { statusLabel, statusMark } from "../../../lib/listings";
import { Badge, Card } from "../ui";

export function PostsCard() {
  return (
    <Card title="My posts">
      <ul className="divide-y divide-line border-t border-line">
        {demoPosts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
            <span className="min-w-[120px] flex-1 text-[17px] font-bold">{p.title}</span>
            <Badge tone={p.status === "available" ? "ok" : "warn"}>{statusMark[p.status]} {statusLabel[p.status]}</Badge>
            <span className="min-w-[90px] text-[16px]">{p.qty}</span>
            <Link href={p.href} className="rounded-lg border-2 border-navy px-5 py-2 text-[15px] font-bold hover:bg-navy hover:text-white">Update</Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
