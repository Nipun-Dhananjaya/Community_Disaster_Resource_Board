import type { Metadata } from "next";
import { LegalPage } from "../../components/legal/LegalPage";
import { legalDocs } from "../../lib/legal";

export const metadata: Metadata = { title: "Privacy Policy · Community Disaster Resource Board", description: "What we collect, who can see it and how long we keep it." };
export default function Page() { return <LegalPage doc={legalDocs.privacy} />; }
