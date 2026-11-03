export const topics = [
  { key: "question", label: "A question" }, { key: "partner", label: "Partnering" }, { key: "volunteering", label: "Volunteering" },
  { key: "media", label: "Media" }, { key: "feedback", label: "Feedback" },
] as const;
export type TopicKey = (typeof topics)[number]["key"];
