import { DisplayPrefs } from "./DisplayPrefs";
import { FooterNav } from "./FooterNav";
import { LowBandwidthToggle } from "./LowBandwidthToggle";

export function Footer() {
    return (
        <footer className="bg-navy text-white">
            <DisplayPrefs />
            <div className="mx-auto flex max-w-[1328px] flex-wrap items-center justify-between gap-4 px-4 py-9 sm:px-8">
                <FooterNav />
                <LowBandwidthToggle />
            </div>
        </footer>
    );
}
