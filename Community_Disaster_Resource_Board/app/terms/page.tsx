import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalDocs } from "../../lib/legal";

export const metadata: Metadata = { title: "Terms of Use · Community Disaster Resource Board", description: "The rules for using the board." };
export default function Page() { return <LegalPage doc={legalDocs.terms} />; }
