import { demoOrgListings } from "../../../lib/dashboard-demo";
import { statusLabel, statusMark } from "../../../lib/listings";
import { minutes } from "../../../lib/tone";
import { Badge, Card } from "../ui";

export function ListingsTable() {
  return (
    <Card title="My listings">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="text-[14px] text-muted">
              <th scope="col" className="pb-2 font-bold">Listing</th><th scope="col" className="pb-2 font-bold">Type</th>
              <th scope="col" className="pb-2 font-bold">Status</th><th scope="col" className="pb-2 font-bold">Quantity</th>
              <th scope="col" className="pb-2 font-bold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {demoOrgListings.map((l) => (
              <tr key={l.id} className="border-t border-line text-[16px]">
                <th scope="row" className="py-3.5 pr-3 font-bold">{l.name}</th>
                <td className="pr-3">{l.type}</td>
                <td className="pr-3"><Badge tone={l.status === "available" ? "ok" : "warn"}>{statusMark[l.status]} {statusLabel[l.status]}</Badge></td>
                <td className="pr-3">{l.qty}</td>
                <td className="text-muted">{minutes(l.minAgo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
