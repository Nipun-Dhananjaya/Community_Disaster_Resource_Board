export type HazardKey = "flood" | "earthquake" | "cyclone" | "landslide" | "fire" | "pandemic";

export interface Guide {
  key: HazardKey;
  label: string;
  glyph: string;
  heading: string;
  keywords: string;
  before: string[];
  during: string[];
  after: string[];
}

export const emergencyContacts = [
  { label: "Police", number: "119" },
  { label: "Ambulance", number: "1990" },
  { label: "Fire and rescue", number: "110" },
  { label: "Disaster hotline", number: "117" },
];

export const guides: Guide[] = [
  {
    key: "flood", label: "Flood", glyph: "~", heading: "If a flood is coming", keywords: "water river rain monsoon evacuate",
    before: ["Pack water, food, medicine and torch", "Charge phones and power banks", "Store papers in a sealed bag", "Know your nearest shelter"],
    during: ["Move to higher ground early", "Never walk or drive through floodwater", "Switch off power at the mains", "Call 117 for rescue"],
    after: ["Wait for official all-clear", "Boil water before drinking", "Photograph damage", "Update your status on the board"],
  },
  {
    key: "earthquake", label: "Earthquake", glyph: "∿", heading: "If an earthquake strikes", keywords: "tremor shaking aftershock quake",
    before: ["Fix heavy furniture to the wall", "Pick a safe spot in each room, away from glass", "Keep a bag with water, torch and medicine by the door", "Practise drop, cover and hold on with your family"],
    during: ["Drop, cover and hold on", "Stay away from windows and heavy shelves", "If outside, move to open ground away from buildings and wires", "Do not use lifts"],
    after: ["Expect aftershocks and be ready to drop again", "Check for injuries and help others if it is safe", "If you smell gas, open windows and leave", "Use text messages instead of calls to keep lines free"],
  },
  {
    key: "cyclone", label: "Cyclone", glyph: "@", heading: "If a cyclone is coming", keywords: "storm wind wind-storm hurricane monsoon",
    before: ["Know your evacuation route and shelter", "Secure the roof and bring in loose objects", "Stock three days of water, food and medicine", "Keep a battery radio and charged power bank"],
    during: ["Stay indoors, away from windows", "Shelter in the strongest, smallest room", "Do not go out when the wind drops. It may be the eye of the storm", "Follow official updates on the radio"],
    after: ["Stay away from fallen power lines", "Avoid floodwater and damaged buildings", "Boil water before drinking", "Report damage and update your status on the board"],
  },
  {
    key: "landslide", label: "Landslide", glyph: "◢", heading: "If a landslide threatens", keywords: "slope hill mud earth slip rain",
    before: ["Watch for cracks in the ground or walls and leaning trees", "Know a second route out that avoids the slope", "Agree on a warning plan with your neighbours", "Leave early when heavy rain and warnings come together"],
    during: ["Move away from the slide path, to the side and uphill if you can", "Listen for rumbling or cracking sounds", "Do not cross a slope or river you cannot see across", "Call 117 for rescue"],
    after: ["Stay away from the slide area. More may follow", "Tell rescuers about anyone trapped. Do not go in yourself", "Report broken pipes, wires and blocked roads", "Watch for flooding downstream"],
  },
  {
    key: "fire", label: "Fire", glyph: "▲", heading: "If there is a fire", keywords: "smoke burn flames house blaze",
    before: ["Fit smoke alarms and test them monthly", "Know two ways out of every room", "Keep matches and lighters away from children", "Do not overload sockets or leave cooking alone"],
    during: ["Get out and stay out", "Crawl low under smoke", "Feel a door with the back of your hand before opening it", "Call 110 from a safe place"],
    after: ["Do not go back in until fire officers say it is safe", "Watch for hot spots and weak floors", "Get checked for smoke breathing problems", "Photograph damage and update your status on the board"],
  },
  {
    key: "pandemic", label: "Pandemic", glyph: "+", heading: "If a disease is spreading", keywords: "virus infection epidemic health outbreak covid dengue",
    before: ["Keep vaccinations up to date", "Stock masks, soap or sanitiser and regular medicines", "Save the numbers of your clinic and 1990", "Plan how to work or study from home"],
    during: ["Wash hands often with soap", "Wear a mask in crowded places", "If you feel ill, stay home and phone a clinic first", "Follow guidance from the Ministry of Health"],
    after: ["Keep up good hygiene for a few more weeks", "Get any recommended boosters", "Check on older and vulnerable neighbours", "Restock your supplies"],
  },
];

export const guideNote = "General guidance only. In an emergency, follow instructions from the Disaster Management Centre and local officials.";
