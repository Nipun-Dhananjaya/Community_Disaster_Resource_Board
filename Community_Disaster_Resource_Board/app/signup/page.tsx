import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "../../components/auth/AuthPanel";
import { DemoAccounts } from "../../components/auth/DemoAccounts";

export const metadata: Metadata = { title: "Create account · Community Disaster Resource Board" };

export default function Page() {
    return (
        <Suspense fallback={null}>
            <AuthPanel initialTab="register" footer={<DemoAccounts />} />
        </Suspense>
    );
}
