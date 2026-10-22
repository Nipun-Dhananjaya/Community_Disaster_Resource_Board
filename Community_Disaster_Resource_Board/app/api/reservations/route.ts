import { NextResponse } from "next/server";
import { getSupply } from "../../../lib/details";
import { listings } from "../../../lib/listings";
import { reservationSchema } from "../../../lib/reservation-schema";
import { validate } from "../../../lib/request-schema";
import { activeByPhone, addReservation, reservedFor } from "../../../lib/server/data";
import { fail, readJson, sameOrigin } from "../../../lib/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "Cross-site request blocked");
  const body = await readJson(req);
  const listing = listings.find((l) => l.id === body?.listingId);
  const info = listing ? getSupply(listing) : null;
  if (!listing || !info) return fail(404, "This supply isn’t available");

  const left = Math.max(0, info.left - reservedFor(listing.id));
  const schema = reservationSchema(Math.min(info.limit, left));
  const errors = validate(schema, body);
  if (Object.keys(errors).length) return fail(400, "Please check your answers", errors);
  const data = schema.parse(body);

  if (data.method === "delivery" && !info.delivery) return fail(400, "Delivery isn’t offered", { method: "Delivery isn’t offered for this supply" });
  const phoneKey = data.phone.replace(/\D/g, "");
  if (activeByPhone(phoneKey) >= 3) return fail(429, "You already have 3 active reservations. Please collect them first.");

  const r = addReservation({ listingId: listing.id, qty: data.quantity, phone: phoneKey, holdHours: info.holdHours });
  return NextResponse.json(
    { ok: true, reference: "RSV-" + r.id.replace(/-/g, "").slice(0, 6).toUpperCase(), expiresAt: r.expiresAt, left: left - data.quantity },
    { status: 201 },
  );
}
