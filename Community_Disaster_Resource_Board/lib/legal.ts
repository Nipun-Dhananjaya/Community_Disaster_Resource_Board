// Draft policy text. Have it reviewed by someone qualified before you publish it.
export interface LegalDoc {
  slug: "privacy" | "terms";
  title: string;
  updated: string;
  summaryTitle: string;
  summary: string[];
  sections: { id: string; title: string; body: string[] }[];
}

export const legalDocs: Record<LegalDoc["slug"], LegalDoc> = {
  privacy: {
    slug: "privacy", title: "Privacy Policy", updated: "1 October 2026", summaryTitle: "In short",
    summary: [
      "Names and phones are never shown on the public board",
      "You choose who sees your contact details",
      "We delete request data after the incident closes",
      "We do not sell your data",
    ],
    sections: [
      { id: "collect", title: "What we collect", body: ["Your name and phone when you request help or post a listing, your approximate location if you allow it, and basic device information to keep the site secure. We do not collect more than we need."] },
      { id: "public", title: "What is public and what is private", body: ["The public board shows the type of need, a general area and urgency. Your name, phone and exact location are shared only with verified responders you consent to."] },
      { id: "use", title: "How we use your information", body: ["To match requests with resources, send alerts you subscribe to, prevent abuse and improve the service. We never sell personal data or use it for advertising."] },
      { id: "see", title: "Who can see it", body: ["Verified responders, moderators and administrators with a role that requires it. Every admin access is recorded in an audit log."] },
      { id: "keep", title: "How long we keep it", body: ["Requests and contact details are deleted or anonymized within a set period after an incident closes. You can ask us to delete your account at any time."] },
      { id: "choices", title: "Your choices", body: ["Download your data, edit or delete a request, turn off notifications, or hide your profile from volunteers in [Settings](/account/settings)."] },
    ],
  },
  terms: {
    slug: "terms", title: "Terms of Use", updated: "1 October 2026", summaryTitle: "Key points",
    summary: [
      "This is a community tool, not an emergency service",
      "Post only accurate, current information",
      "No one may charge people in need for aid listed here",
      "We can remove content that breaks these rules",
    ],
    sections: [
      { id: "using", title: "Using the board", body: ["Anyone can search the board and ask for help. Posting resources requires an account. This is a community tool and does not replace emergency services; in danger, call 119 first."] },
      { id: "accurate", title: "Posting accurate information", body: ["You must post only resources you can provide, keep quantities current and remove listings when they are no longer available. False or misleading posts may be removed."] },
      { id: "verification", title: "Verification", body: ["A verified badge means a moderator checked registration documents. It is not a guarantee of quality, and users should still use judgment."] },
      { id: "behavior", title: "Acceptable behavior", body: ["No harassment, fraud, selling aid, or requests for payment from people in need. Report problems using the Report button on any listing."] },
      { id: "safety", title: "Volunteers and safety", body: ["Volunteers act on their own responsibility, follow the code of conduct and local authority instructions, and must not enter unsafe areas."] },
      { id: "liability", title: "Limits of liability", body: ["We work to keep information current but cannot guarantee it. We are not responsible for losses from relying on a listing."] },
      { id: "changes", title: "Changes and contact", body: ["We may update these terms and will announce major changes on the site. Questions can be sent through the [Contact page](/contact)."] },
    ],
  },
};
