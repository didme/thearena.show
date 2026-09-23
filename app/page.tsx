"use client";

import { type CSSProperties, FormEvent, type ReactNode, type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Audience = "visitor" | "exhibitor";
type ModalType = "visitor" | "waitlist" | "book" | "offer" | "article";
type RailStage = 1 | 2 | 3 | 4 | 5;

const VERSION = "v6.08";

// (H) Sample-data honesty flag: flip to false once real molecules, speakers
// and waitlist entries replace the demo content.
const SAMPLE_DATA = true;

const molecules = [
  {
    company: "MEYOU",
    person: "Andrew Pay",
    image: "/speakers/mateo-garcia.jpg",
    useful:
      "AI matchmaking for events, a 5,000+ member Dubai business community and practical event-tech integrations.",
    offer:
      "Free 30-minute LeadChats audit and a warm-introduction map for your next business event.",
  },
  {
    company: "NORTH/45",
    person: "Mira Stone",
    image: "/speakers/nadine-laurent.jpg",
    useful:
      "UAE market-entry campaigns, bilingual production and performance marketing for B2B services.",
    offer:
      "20% off a launch sprint plus a free campaign audit for companies entering Dubai in 2026.",
  },
  {
    company: "FLOWOPS",
    person: "Omar Rahman",
    image: "/speakers/daniel-okafor.jpg",
    useful:
      "CRM architecture, workflow automation and practical AI adoption for service teams of 20–200 people.",
    offer:
      "A free operations diagnostic and a ready-to-build automation backlog for one business process.",
  },
  {
    company: "CRESCENT PEOPLE",
    person: "Sara Haddad",
    image: "/speakers/aisha-rahman.jpg",
    useful:
      "Executive search, UAE hiring compliance and rapid team setup for international companies.",
    offer:
      "Free role calibration and 15% off the first successful senior placement signed at The Arena.",
  },
];

type EventDay = {
  id: string;
  date: string;
  theme: string;
  title: string;
  intro?: string;
  services: string[];
};

const eventDays: EventDay[] = [
  {
    id: "day-1",
    date: "21 SEP",
    theme: "ATTRACT",
    title: "ATTRACT SERVICES DAY",
    services: [
      "Marketing Services",
      "Sales & lead generation",
      "Media & PR",
      "Branding & creative",
      "Partnerships & events",
    ],
  },
  {
    id: "day-2",
    date: "22 SEP",
    theme: "AUTOMATE",
    title: "AUTOMATE SERVICES DAY",
    services: [
      "AI Services",
      "IT infrastructure",
      "Software & SaaS",
      "Cybersecurity & data",
      "Process & workflow",
    ],
  },
  {
    id: "day-both",
    date: "21–22 SEP",
    theme: "EXPAND",
    title: "EXPAND CATEGORIES — BOTH DAYS",
    intro: "Legal, finance, HR and market-entry companies are welcome on either day.",
    services: [
      "Market-entry Services",
      "Legal & compliance",
      "Finance & tax",
      "HR & recruitment",
      "Business setup & operations",
    ],
  },
];

// (E) Two event days: the on-site talks track uses only the two real dates;
// the third card covers expand categories across both days.
const talkDays = eventDays.filter((day) => day.id !== "day-both");

const speakers = [
  {
    day: "day-1",
    name: "Amira Al Mansouri",
    company: "NOURA GROWTH",
    role: "Co-founder · Growth strategist",
    topic: "From SMM Reach to a Qualified Sales Pipeline",
    time: "11:30",
    image: "/speakers/amira-al-mansouri.jpg",
  },
  {
    day: "day-1",
    name: "Mateo Garcia",
    company: "SIGNAL HOUSE",
    role: "Creative director · B2B media strategist",
    topic: "Earned Attention: B2B Media People Remember",
    time: "14:00",
    image: "/speakers/mateo-garcia.jpg",
  },
  {
    day: "day-1",
    name: "Aisha Rahman",
    company: "SANDSTONE PEOPLE",
    role: "People operations partner",
    topic: "Hiring the First UAE Team Without Slowing the Launch",
    time: "16:00",
    image: "/speakers/aisha-rahman.jpg",
  },
  {
    day: "day-2",
    name: "Daniel Okafor",
    company: "BRIDGEWORKS UAE",
    role: "Managing partner · Market entry advisor",
    topic: "Entering the UAE Market Without the Guesswork",
    time: "11:00",
    image: "/speakers/daniel-okafor.jpg",
  },
  {
    day: "day-2",
    name: "Nadine Laurent",
    company: "CRESCENT CAPITAL",
    role: "Investment partner",
    topic: "What Makes a Service Business Financeable in 2026",
    time: "13:30",
    image: "/speakers/nadine-laurent.jpg",
  },
  {
    day: "day-1",
    name: "Luca Bianchi",
    company: "CLEARLINE LEGAL",
    role: "Partner · Commercial compliance",
    topic: "UAE Contracts: Five Clauses That Protect the Deal",
    time: "16:00",
    image: "/speakers/luca-bianchi.jpg",
  },
  {
    day: "day-1",
    name: "Mei Lin Tan",
    company: "FLOWSTATE AI",
    role: "COO · AI operations lead",
    topic: "AI Agents for Service Operations: What Actually Works",
    time: "11:30",
    image: "/speakers/mei-lin-tan.jpg",
  },
  {
    day: "day-1",
    name: "Kenji Watanabe",
    company: "SYSTEMS NORTH",
    role: "Founder · Automation architect",
    topic: "From Process Map to Automation in Thirty Days",
    time: "14:00",
    image: "/speakers/kenji-watanabe.jpg",
  },
];

type WaitlistEntry = {
  id: string;
  company: string;
  industry: string;
  madePromo?: boolean;
};

const serviceOptions = eventDays.flatMap((day) => day.services);
const trialHours = [
  "10–11 AM",
  "11 AM–12 PM",
  "12–1 PM",
  "1–2 PM",
  "2–3 PM",
  "3–4 PM",
  "4–5 PM",
  "5–6 PM",
];

// Deterministic fictional names make the long-list behaviour testable without
// exposing contact data. Initial letters and legal suffixes remain readable.
const demoWaitlistCompanies: WaitlistEntry[] = [
  ["North Gr**** FZ-LLC", "Marketing Services"],
  ["Bridge L**** LLC", "Legal & compliance"],
  ["People Ope****** FZE", "HR & recruitment"],
  ["Clear Pa*** DMCC", "Market-entry Services"],
  ["Flowst Sys**** LLC", "AI Services"],
  ["Studio Me*** FZCO", "Media & PR"],
  ["Atlas Rea** LLC", "Sales & lead generation"],
  ["Bright Cr****** FZE", "Branding & creative"],
  ["Cresce Eve*** LLC", "Partnerships & events"],
  ["Meridi Ta* FZ-LLC", "Finance & tax"],
  ["North Gr**** FZ-LLC", "Marketing Services", true],
  ["Harbor Adv**** LLC", "Business setup & operations"],
  ["Nexora Inf***** FZE", "IT infrastructure"],
  ["Cloudl Saa* DMCC", "Software & SaaS"],
  ["Shield Dat* FZCO", "Cybersecurity & data"],
  ["Optima Wor***** LLC", "Process & workflow"],
  ["Vertex Sal** FZE", "Sales & lead generation"],
  ["Mosaic Br*** LLC", "Branding & creative"],
  ["Mosaic Br*** LLC", "Branding & creative", true],
  ["Pioneer Eve*** DMCC", "Partnerships & events"],
  ["Gateway Mar*** FZ-LLC", "Market-entry Services"],
  ["Juris Co***** LLC", "Legal & compliance"],
  ["Ledger Po*** FZE", "Finance & tax"],
  ["Talent Br**** LLC", "HR & recruitment"],
  ["Launch Ope****** FZCO", "Business setup & operations"],
  ["Neural Wor** DMCC", "AI Services"],
  ["Neural Wor** DMCC", "AI Services", true],
  ["Infra Co***** LLC", "IT infrastructure"],
  ["Orbit Sof***** FZE", "Software & SaaS"],
  ["Cipher Gu*** LLC", "Cybersecurity & data"],
  ["Process Pi*** FZ-LLC", "Process & workflow"],
  ["Signal Mar****** DMCC", "Marketing Services"],
  ["Leadfo Sal** LLC", "Sales & lead generation"],
  ["Pressr Med** FZE", "Media & PR"],
  ["Canvas Cr****** LLC", "Branding & creative"],
  ["Forum Par***** FZCO", "Partnerships & events"],
  ["Entryw Adv***** DMCC", "Market-entry Services"],
  ["Comply Le*** LLC", "Legal & compliance"],
  ["Comply Le*** LLC", "Legal & compliance", true],
  ["Fiscal Br**** FZE", "Finance & tax"],
  ["Peoplef Rec******* LLC", "HR & recruitment"],
  ["Operat Set** FZ-LLC", "Business setup & operations"],
  ["Automa Lab* DMCC", "AI Services"],
  ["Networ Inf** LLC", "IT infrastructure"],
  ["Platfo Saa* FZE", "Software & SaaS"],
  ["Secure Dat* LLC", "Cybersecurity & data"],
  ["Flowma Wor***** FZCO", "Process & workflow"],
  ["Signal Mar****** DMCC", "Marketing Services", true],
  ["Campaig Hou** LLC", "Media & PR"],
  ["Venture Eve*** FZE", "Partnerships & events"],
].map(([company, industry, madePromo], index) => ({
  id: `demo-${index + 1}`,
  company: maskCompanyName(String(company)),
  industry: String(industry),
  madePromo: Boolean(madePromo),
}));

// Temporary manual source for public counters. This object can later be
// replaced by a Google Sheet or another live source without changing the UI.
const siteStats = {
  offers: 150,
  visitors: 500,
  exhibitors: 120,
  showcaseSlots: 80,
  paidSpots: 12,
  totalSpots: 32,
  trialSpots: 20,
  hoursPerTrialSpot: 8,
  potentialTrialSlots: 160,
  waitlistCandidates: demoWaitlistCompanies.length,
};

const interblockContent = {
  eventToOffers: {
    rail: "offers",
    summary: "Why services need a different trade show",
    title: "Services sell through consultation, visibility and trust",
    intro: "The Arena is built around three things services need: sales, visibility and access to real industry know-how.",
    points: [
      ["LEAD GENERATION", "Services are not products for a shelf or marketplace. The Arena creates consultation handshakes with relevant visitors."],
      ["MEDIA FOOTPRINT", "If a service is not visible, it is easy to overlook. Interviews, photos and reportage make expertise easier to discover."],
      ["KNOW-HOW TALKS", "Markets are built by people who show up. Panels and introductions bring C-level decision-makers into the same conversation."],
    ],
  },
  offersToProfile: {
    rail: "offers",
    summary: "How a clear offer starts a conversation",
    title: "Make your usefulness understandable before the handshake",
    intro: "A concise capability and a concrete offer give visitors a reason to start a relevant consultation instead of another generic exchange of business cards.",
    points: [
      ["BE SPECIFIC", "State what your company is useful with and what a visitor can receive or test now."],
      ["GET MATCHED", "The format combines walk-in handshakes with organiser-led introductions to relevant passed-by visitors."],
      ["START BEFORE THE EVENT", "A published company molecule lets visitors understand your value before they decide whom to meet."],
    ],
  },
  profileToSpot: {
    rail: "inventory",
    summary: "From company profile to physical showcase",
    title: "Bring a representative and a laptop - the spot is ready",
    intro: "A no-booth, no-wall format: construction removed from selling services.",
    points: [
      ["NO CONSTRUCTION", "No booth walls, build-up days or shared dismantling costs charged to exhibitors."],
      ["READY EQUIPMENT", "The showcase format includes a TV, a round bar table and two bar stools."],
      ["PAY FOR ACCESS", "The commercial value is conversations, leads and media visibility - not temporary architecture."],
    ],
  },
  spotToWaitlist: {
    rail: "inventory",
    summary: "Full-day spots create one-hour trial capacity",
    title: "Where the free hours come from — the whole model, in the open",
    intro: "Every unsold full-day spot is already built — and would stand idle. Under the #JoinDubai SMB program we split those idle spots into free one-hour trial timeslots for smaller companies. No catch: idle capacity is the only truly renewable resource in the events business.",
    points: [
      ["GUARANTEED", `${siteStats.paidSpots} paid full-day spots have a dedicated physical showcase for one complete event day.`],
      ["CALCULATED", `${siteStats.trialSpots} unsold full-day spots × ${siteStats.hoursPerTrialSpot} hours = up to ${siteStats.potentialTrialSlots} trial timeslots. Each square is one hour, and each hour goes to a company from the waitlist.`],
      ["DYNAMIC", "Every full-day purchase removes one complete column — eight potential one-hour timeslots — from the free pool. Applications are moderated and allocation is never guaranteed."],
    ],
  },
  talksToPartners: {
    rail: "talks",
    summary: "How The Arena and its partners extend visibility beyond the hall",
    title: "Our technologies for media footprint & your brand awareness",
    intro: "The Media Center and partnership formats turn useful on-site conversations into content that can keep working after the event.",
    points: [
      ["TV-STYLE INTERVIEWS", "Representatives can explain the services or news their company brings to The Arena."],
      ["RECORDED KNOW-HOW", "Round tables and panels can be recorded as talk shows and split into reels, shorts and stories."],
      ["QUOTES FOR PR", "Speaker insights can be reused in reportage, media materials and company social channels."],
      ["SHAREABLE MEDIA", "Short branded interviews and guest photos can be delivered for immediate social sharing."],
      ["SEARCH VISIBILITY", "Partnership formats can include a magazine review and an SEO-indexed website mention."],
      ["C-LEVEL ACCESS", "The Who's Who dinner format is designed for organiser-led introductions between decision-makers."],
    ],
  },
  partnersToFaq: {
    rail: "none",
    summary: "Arena compared with a traditional exhibition",
    title: "Built for services, not goods",
    intro: "The Arena replaces booth infrastructure with a recurring sales, media and introduction format.",
    points: [
      ["CONSULTATION FIRST", "Both formats have walk-ins; the Arena adds lead generation beyond the people who happen to pass by."],
      ["QUARTERLY CADENCE", "Regular focused Arenas keep market activity moving instead of concentrating it in one annual budget."],
      ["MEDIA INCLUDED", "Media footprint, talk-show content and C-level introductions are part of the format logic."],
      ["LOWER INFRASTRUCTURE", "No booth construction or set-up days: one sales representative and a laptop are enough."],
    ],
  },
};

const formatFeatureAlts = [
  "TV-style interview at a business event",
  "Recorded know-how conversation in progress",
  "Speaker quote prepared for press coverage",
  "Shareable event-media moment",
  "Search-visible editorial feature",
  "C-level business introduction",
];

// Keep editorial image assignments in one remappable manifest. These are
// existing local references only; this staging pass does not copy or fetch
// any image assets.
const editorialImageSources = {
  technology: [
    "/reference/editorial/technology/tv-style-interviews.webp",
    "/reference/editorial/technology/recorded-know-how.webp",
    "/reference/editorial/technology/quotes-for-pr.webp",
    "/reference/editorial/technology/shareable-media.webp",
    "/reference/editorial/technology/search-visibility.webp",
    "/reference/editorial/technology/c-level-access.webp",
  ],
  articles: [
    "/reference/articles/thumb/10.jpg",
    "/reference/articles/thumb/04.jpg",
    "/reference/articles/thumb/03.jpg",
    "/reference/articles/thumb/07.jpg",
    "/reference/articles/thumb/05.jpg",
    "/reference/articles/thumb/06.jpg",
  ],
  economy: [
    "/reference/editorial/economy/e13.jpg",
    "/reference/editorial/economy/e14.jpg",
    "/reference/editorial/economy/e15.jpg",
    "/reference/editorial/economy/e16.jpg",
    "/reference/editorial/economy/e17.jpg",
    "/reference/editorial/economy/e19.jpg",
    "/reference/editorial/economy/e20.jpg",
    "/reference/editorial/economy/e21.jpg",
    "/reference/editorial/economy/e18.jpg",
    "/reference/editorial/economy/e22.jpg",
  ],
} as const;

// (v5.3 · TASK 2) Audience terminology rule: the VISITOR version of the page
// never says "lead" / "leadgen" / "lead generation" — only introduction,
// introduce, arranged meeting, matched. The product name "LeadChats" stays in
// both versions. These overrides de-lead the interblock copy that a visitor
// reads; the exhibitor version keeps the original leadgen wording.
type InterblockContent = {
  rail: string;
  summary: string;
  title: string;
  intro: string;
  points: string[][];
};

type InterblockKey = keyof typeof interblockContent;

const visitorInterblockOverrides: Partial<
  Record<InterblockKey, Record<number, [string, string]>>
> = {
  eventToOffers: {
    0: [
      "ARRANGED INTRODUCTIONS",
      "Services are not products for a shelf or marketplace. The Arena creates consultation handshakes between you and the companies that match your need.",
    ],
  },
  profileToSpot: {
    2: [
      "PAY FOR ACCESS",
      "The commercial value is conversations, arranged introductions and media visibility - not temporary architecture.",
    ],
  },
  partnersToFaq: {
    0: [
      "CONSULTATION FIRST",
      "Both formats have walk-ins; the Arena adds arranged introductions beyond the people who happen to pass by.",
    ],
  },
};

function interblockFor(key: InterblockKey, audience: Audience): InterblockContent {
  const base = interblockContent[key] as InterblockContent;
  if (audience !== "visitor") return base;
  const override = visitorInterblockOverrides[key];
  if (!override) return base;
  return {
    ...base,
    points: base.points.map((point, index) => override[index] ?? point),
  };
}

// (v5.3 · TASK 2) Two full copy variants for the #leadchats section.
// (v5.4 · TASK 2) `productName` drives the visible product label wherever the
// product name itself appears in VISITOR-facing copy (phone mock header,
// chat-thread caption, aria-labels): "Introduction chats" for visitors,
// "LeadChats" unchanged for exhibitors. Code identifiers (LeadchatPhones,
// leadchat-* classes, #leadchats id) are untouched — only visible strings.
const leadchatsCopy: Record<
  Audience,
  {
    kicker: string;
    headingBefore: string;
    headingAfter: string;
    intro: string;
    steps: [string, string][];
    inboxBadge: string;
    caption: string;
    productName: string;
  }
> = {
  visitor: {
    kicker: "INTRODUCTIONS · HOW INTRODUCTION CHATS WORK",
    headingBefore: "Arena ",
    headingAfter: " you each other",
    intro:
      "Introduction chats are AI-arranged introductions between visitors and the companies showcasing at The Arena — opened before the event, finished at the spot.",
    steps: [
      ["ONE LINE", "You tell us what you need right now — one sentence is enough."],
      ["AI MATCH", "The engine matches your line with companies that can actually help — before doors open."],
      ["CHAT OPENER", "You get a short chat with a reason to talk and a spot number."],
      [
        "MEET AT THE SPOT",
        "Every exhibitor here opted in to meet you. You walk up with the spot number; they already know why you came. Free for visitors.",
      ],
    ],
    inboxBadge: "50 arranged",
    caption:
      "You choose which introductions to accept — nothing is confirmed without you. Left: the introductions arranged for you. Right: one of them, opened.",
    productName: "Introduction chats",
  },
  exhibitor: {
    kicker: "LEADGEN · HOW LEADCHATS WORK",
    headingBefore: "Arena ",
    headingAfter: " leads to you",
    intro:
      "LeadChats are AI-arranged introductions between visitors and exhibitors — lead generation that starts before the event and finishes at your spot.",
    steps: [
      ["ONE LINE", "Tell us what your company is useful with — and what you need right now. One sentence each."],
      ["AI MATCH", "The engine pairs your line with visitors whose current need fits it — that is where your leads come from."],
      ["CHAT OPENER", "Both sides get a short chat with a reason to talk and a spot number: the lead is warm before the handshake."],
      [
        "MEET AT THE SPOT",
        "Confirmed visitors arrive with your spot number in hand. Full day: up to 50 arranged introductions — 50 warm leads. Trial hour: up to 5.",
      ],
    ],
    inboxBadge: "50 arranged",
    caption:
      "Up to 50 arranged introductions per full-day spot — this is what you are buying. Left: the inbox we fill for you. Right: one of those leads, opened.",
    productName: "LeadChats",
  },
};

// (v5.3 · TASK 1) Left phone = the inbox of arranged introductions. Seven rows
// fit the 9 : 19.5 frame with the caption row below the last one — no partial
// row, no inner scrollbar.
const leadchatInbox = [
  { initials: "NK", name: "Nadia K.", tag: "MARKETING", preview: "Looking for a UAE launch partner…", time: "09:12", unread: true },
  { initials: "OR", name: "Omar R.", tag: "SAAS", preview: "Which spot are you on?", time: "09:40", unread: true },
  { initials: "PS", name: "Priya S.", tag: "HR", preview: "We hire marketers for teams…", time: "10:05", unread: false },
  { initials: "LB", name: "Luca B.", tag: "LEGAL", preview: "Can we review the contract on site?", time: "10:22", unread: true },
  { initials: "MT", name: "Mei T.", tag: "FINTECH", preview: "Payments stack — 15 minutes?", time: "10:48", unread: false },
  { initials: "JO", name: "James O.", tag: "LOGISTICS", preview: "Freight routes to KSA, quick chat.", time: "11:15", unread: false },
  { initials: "SH", name: "Sara H.", tag: "EXEC SEARCH", preview: "Two senior roles to close by Q4.", time: "11:30", unread: false },
];

// (v5.7 · T4) Joindubai economy dossiers, refreshed for the current two-day
// Arena model and current siteStats. Images remain the source e13…e22 set.
const alignmentCards = [
  {
    kicker: "InvestUAE",
    strategy: "In line with InvestUAE and the UAE National Investment Strategy 2031",
    body: "The Arena invests SecondScreen, Realtime Media, TV Lobby and AI matchmaking — plus a decade of event-tech expertise — directly into Dubai’s business economy.",
    agency: "United Arab Emirates — Ministry of Investment",
    image: editorialImageSources.economy[0],
    alt: "Business guests meeting at a Dubai event",
  },
  {
    kicker: "Dubai Economic Agenda D33",
    strategy: "In line with the Dubai Economic Agenda D33",
    body: "A recurring Arena creates a dependable rhythm of service-company deals, media and introductions instead of one annual spike, while participants carry Dubai’s business story into their own networks.",
    agency: "#JoinDubai · Dubai Economic Agenda 2033",
    image: editorialImageSources.economy[1],
    alt: "Business community gathering in Dubai",
  },
  {
    kicker: "UAE Tourism Strategy 2031",
    strategy: "In line with the UAE Tourism Strategy 2031",
    body: "The Arena turns a focused two-day services show into business-tourism demand: visitors meet suppliers, and participating companies share their Dubai experience with decision-makers abroad.",
    agency: "UAE Tourism Strategy 2031",
    image: editorialImageSources.economy[2],
    alt: "International guests networking in Dubai",
  },
  {
    kicker: "DET · SMB Development",
    strategy: "In line with Dubai DET strategy for SMB development",
    body: `The Arena lowers market-access risk for SMBs: ${siteStats.trialSpots} unsold full-day spots can become ${siteStats.potentialTrialSlots} free one-hour trial timeslots, while a guaranteed full day remains sponsor-subsidized.`,
    agency: "Dubai — Department of Economy and Tourism",
    image: editorialImageSources.economy[3],
    alt: "Small-business representatives at a Dubai event",
  },
  {
    kicker: "Dubai AI Ministry",
    strategy: "In line with Dubai’s AI and digital-economy agenda",
    body: "Arena matchmaking uses AI as practical infrastructure: it turns one-line company needs into relevant Introduction chats for visitors and LeadChats for exhibitors before doors open.",
    agency: "UAE AI, Digital Economy & Remote Work Applications Office",
    image: editorialImageSources.economy[4],
    alt: "Technology founders speaking at an event in Dubai",
  },
  {
    kicker: "Dubai RDI Programme",
    strategy: "In line with Dubai’s Research, Development and Innovation Programme",
    body: "The Arena is a live testbed for event technology, instant media and AI-assisted introductions across service industries — measured through real meetings on a working floor.",
    agency: "The Executive Council of Dubai",
    image: editorialImageSources.economy[5],
    alt: "Event-technology demonstration in Dubai",
  },
  {
    kicker: "Net Zero 2045",
    strategy: "In line with Net Zero and the UAE Circular Economy Policy",
    body: "No booth walls, build-up days or disposable scenery: the same 16 double-sided units are reused from Arena to Arena, removing construction waste from the format.",
    agency: "Net Zero · UAE Circular Economy",
    image: editorialImageSources.economy[6],
    alt: "Reusable event installation in Dubai",
  },
  {
    kicker: "DWC Airport & Expo City",
    strategy: "In line with Dubai’s exhibition and connectivity strategy",
    body: "A repeatable services-show format helps convert Dubai’s global connectivity into focused business visits, supplier discovery and reasons for companies to return.",
    agency: "Dubai Exhibition Centre · Dubai Airports",
    image: editorialImageSources.economy[7],
    alt: "Visitors arriving for a Dubai business event",
  },
  {
    kicker: "Universal Blueprint for AI",
    strategy: "In line with the Dubai Universal Blueprint for Artificial Intelligence",
    body: "By integrating AI-assisted matchmaking, relevant introductions and practical event technology, The Arena supports AI adoption that helps service companies grow and makes Dubai's innovation capability visible.",
    agency: "Dubai Universal Blueprint for AI",
    image: editorialImageSources.economy[8],
    alt: "Artificial-intelligence leaders at a Dubai business gathering",
  },
  {
    kicker: "Dubai Chambers",
    strategy: "In line with Dubai Chambers’ global-growth partnerships",
    body: "Local firms meet visiting buyers and international companies meet the suppliers needed to establish and grow in Dubai — supporting deals, hiring, partnerships, licences and branches.",
    agency: "Dubai Chambers",
    image: editorialImageSources.economy[9],
    alt: "Companies making introductions at a Dubai exhibition",
  },
];

// Six Arena-impact essays from the joindubai source. The cards open the
// transferred editorial copy in-page, so visitors can read without leaving
// the Arena site.
type InsightArticle = {
  image: string;
  label: string;
  title: string;
  teaser: string;
  body: string[];
};

const insightArticles: InsightArticle[] = [
  {
    image: editorialImageSources.articles[0],
    label: "NETWORKING ECONOMY",
    title: "Dubai: A Hub for Networking",
    teaser: "A close reading of the UAE’s economic model, and a proposal: position Dubai deliberately as the world’s capital of networking.",
    body: [
      "Dubai’s advantage is not only its infrastructure. It is the density of people, companies and institutions that can meet, compare needs and begin practical work in the same place.",
      "This essay considers a deliberate networking economy: formats that make introductions easier to start, give expertise a public stage and leave participants with useful next conversations.",
    ],
  },
  {
    image: editorialImageSources.articles[1],
    label: "BUSINESS MODELS",
    title: "Alternative Models for Service B2B Shows",
    teaser: "Booth-and-sponsorship economics do not fit service companies with nothing physical to display. Arena economics are built around relevant introductions instead.",
    body: [
      "A conventional booth is designed to display goods. Service businesses often need a different setting: a reason to talk, a clear explanation of expertise and a simple place to continue the conversation.",
      "The Arena model focuses on ready-to-use spots and relevant introductions, so companies can spend their event time on consultations rather than temporary construction.",
    ],
  },
  {
    image: editorialImageSources.articles[2],
    label: "INNOVATION",
    title: "Digital Disruption in Event Technology",
    teaser: "How real-time media and instant delivery turn an event appearance into a useful, shareable business asset.",
    body: [
      "Event technology is most useful when it makes a real encounter easier to revisit. Fast capture, delivery and publishing can turn a short appearance into material a company can share afterwards.",
      "The article looks at real-time media as event infrastructure: a practical way for interviews, conversations and demonstrations to keep working beyond the hall.",
    ],
  },
  {
    image: editorialImageSources.articles[3],
    label: "CITY AS A SERVICE",
    title: "Dubai — City as a Service (DaaS)",
    teaser: "Attract external buyers through trade shows and conferences — turning the whole city into a service that generates demand.",
    body: [
      "Trade shows and conferences do more than fill a venue. They can bring external buyers into contact with local capabilities and make the city easier to understand as a place to build business.",
      "This perspective treats the city itself as a service layer: a connected environment that helps companies discover suppliers, partners and reasons to return.",
    ],
  },
  {
    image: editorialImageSources.articles[4],
    label: "TOURISM STRATEGY",
    title: "Rethinking Dubai’s Tourism Strategy",
    teaser: "Business tourism brings companies, branches, residents and long-term demand — a durable engine for growth.",
    body: [
      "Business visitors can create a different kind of repeat demand. They come to meet people, inspect capability and decide whether a city can support their next move.",
      "The essay frames focused events as one route to longer-term economic relationships: companies, branches, residents and professional networks that continue after a visit.",
    ],
  },
  {
    image: editorialImageSources.articles[5],
    label: "SEASONALITY",
    title: "Using the Hot Months for Dubai’s Economy",
    teaser: "Exhibitions and conferences can turn Dubai’s quietest leisure season into productive business months.",
    body: [
      "A quieter leisure period can still be a productive business period. Exhibitions and conferences give companies a reason to travel when they can devote time to focused meetings.",
      "This article explores how a reliable calendar of professional formats can turn seasonal downtime into useful conversations, discovery and commercial preparation.",
    ],
  },
];

// (v5.3 · TASK 3) Footer "Our projects" — three categories of real external
// links, rendered inside the footer's main content zone.
const footerProjects: { label: string; links: { name: string; href: string }[] }[] = [
  {
    label: "FLAGSHIP",
    links: [{ name: "thearena.show", href: "https://thearena.show" }],
  },
  {
    label: "TECHNOLOGIES",
    links: [
      { name: "meyou.id", href: "https://meyou.id" },
      { name: "meyou.pro", href: "https://meyou.pro" },
      { name: "realtime.media", href: "https://realtime.media" },
      { name: "expochats.com", href: "https://expochats.com" },
    ],
  },
  {
    label: "CO-SHOWRUNNING",
    links: [
      { name: "join-dubai.com", href: "https://join-dubai.com" },
      { name: "emiratesfashionweek.com", href: "https://emiratesfashionweek.com" },
    ],
  },
];

const partnerCards = Array.from(
  { length: 8 },
  (_, index) => `/reference/partners/card-${index + 1}.webp`,
);

const faqByAudience: Record<Audience, { q: string; a: string }[]> = {
  visitor: [
    {
      q: "How much is a visitor pass?",
      a: "Free with registration. Add one current business need and we can start matching you before the event.",
    },
    {
      q: "What are Introduction chats?",
      a: "AI-arranged introductions: we match your need with a company at The Arena that can help, open a chat between you, and tell you which spot to meet at.",
    },
    {
      q: "How long should I plan for the visit?",
      a: "Two to three focused hours is enough for the floor and arranged meetings. Stay longer for on-site Talk Shows and evening networking.",
    },
    {
      q: "My company sells services too. Can we exhibit?",
      a: "Yes — apply for a free one-hour trial timeslot (switch to the exhibitor view), or reserve a full day. Your visitor pass stays free either way.",
    },
  ],
  exhibitor: [
    {
      q: "What do I need to bring?",
      a: "One representative and a laptop. Every spot has one TV, exactly two bar stools and one round bar table.",
    },
    {
      q: "How are leads generated?",
      a: "Through walk-in conversations and AI-matched LeadChats with visitors whose current needs fit your offer.",
    },
    {
      q: "Can I test the format first?",
      a: "Yes. Join the free one-hour waitlist. Trial capacity comes from the spots not sold as guaranteed full-day placements.",
    },
    {
      q: "Why is the trial free? What's the catch?",
      a: "There is no catch — there is idle capacity. Every unsold full-day spot would stand empty. We convert idle hours into free one-hour trial timeslots so smaller companies can test the format before paying. The pool exists only while spots stay unsold: every purchase removes eight timeslots.",
    },
    {
      q: "Is this a raffle or lottery?",
      a: "No. There is no draw and no prize. Applications are moderated; timeslots are allocated by schedule fit and category balance. Companies that publish an announcement receive priority consideration (Promo Boost).",
    },
    {
      q: "What do I bring?",
      a: "One person and one laptop. HDMI cable, TV, bar table and two stools are already on the spot.",
    },
    {
      q: "Can a trial become a full day?",
      a: "Yes — trial exhibitors can upgrade at the subsidized rate while spots remain, and your waitlist position carries over to the next Arena.",
    },
  ],
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function maskCompanyName(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Company";
  const suffixMatch = cleaned.match(/\b(FZ-LLC|FZCO|DMCC|FZE|LLC|LTD|INC)\b$/i);
  const suffix = suffixMatch?.[0] ?? "";
  const core = suffix ? cleaned.slice(0, -suffix.length).trim() : cleaned;
  let revealedLetters = 0;
  const masked = Array.from(core, (character) => {
    if (/\p{L}/u.test(character)) {
      if (revealedLetters < 2) {
        revealedLetters += 1;
        return character;
      }
      return "*";
    }
    if (/\p{N}/u.test(character)) return "*";
    return character;
  }).join("");
  return `${masked}${suffix ? ` ${suffix}` : ""}`;
}

function normalizeWaitlistEntry(value: unknown, index: number): WaitlistEntry | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const companyValue = record.maskedCompany ?? record.company ?? record.companyName;
  const industryValue = record.industry ?? record.sector ?? record.category;
  if (typeof companyValue !== "string" || typeof industryValue !== "string") return null;
  const status = String(record.status ?? record.moderationStatus ?? "approved").toLowerCase();
  if (status && !["approved", "public", "published"].includes(status)) return null;
  return {
    id: String(record.id ?? `live-${index}-${companyValue}`),
    company: maskCompanyName(companyValue),
    industry: industryValue,
    madePromo: Boolean(record.madePromo ?? record.promoApproved ?? record.isPromo),
  };
}

function CompanyLabel({ company }: { company: string }) {
  const protectedCompany = maskCompanyName(company);
  const match = protectedCompany.match(/^(.*?)(\s+(?:FZ-LLC|FZCO|DMCC|FZE|LLC|LTD|INC))$/i);
  return (
    <span className="company-label" title={protectedCompany}>
      <span className="company-core">{match?.[1] ?? protectedCompany}</span>
      {match?.[2] && <span className="company-suffix">{match[2]}</span>}
    </span>
  );
}

// (v5.3 · TASK 6) dubaiHourStamp() removed together with the hourly GST
// timestamp row — the pinned rail header now carries only the count informer
// and the join-waitlist button.

function WaitlistRows({
  entries,
  listClassName = "",
  ariaHidden = false,
}: {
  entries: WaitlistEntry[];
  listClassName?: string;
  ariaHidden?: boolean;
}) {
  return (
    <div
      className={`dynamic-waitlist-list ${listClassName}`.trim()}
      aria-hidden={ariaHidden || undefined}
    >
      {entries.map((entry, index) => (
        <article key={`${entry.id}-${index}`}>
          <span>{index + 1}</span>
          <p>
            <strong><CompanyLabel company={entry.company} /></strong>
            <small>{entry.industry}</small>
          </p>
          {entry.madePromo && (
            <em
              className="promo-tag promo-tag--rail"
              title="Second entry earned by publishing an announcement about The Arena"
            >
              <span className="promo-tag-link">MADE PROMO ↗</span><span className="promo-tag-entry"> · +1 ENTRY</span>
            </em>
          )}
        </article>
      ))}
    </div>
  );
}

// (I·v5.2, updated v5.4 · TASK 5) The waitlist lives ONLY in the LEFT sticky
// rail, at every width, as the tail of ONE vertical strip: [brand, speakers,
// informers…, waitlist-count informer, waitlist header, entries 1…N]. Page
// scroll after the 04→06 boundary (see TASK 7's renumbering) maps
// proportionally to a negative translateY of the strip (rAF-throttled scroll
// handler in StickyRail): brand, speakers and informers are simply carried
// out of the rail top by the strip's motion; the count informer pins at the
// rail top via a JS counter-transform and becomes the waitlist header while
// entries flow beneath it. Translation clamps at stripHeight − railHeight so
// the rail never shows void below the last entry. There is no separate
// mobile in-flow list any more (removed in v5.4 · TASK 5): the same rail
// choreography runs down to phone widths, just visually compacted (see the
// v5.4-claude CSS block — plain numbering below 900px, category hidden
// below 600px, promo badge shrinks to a dot).

function Typewriter({
  phrases,
}: {
  phrases: string[];
}) {
  const [text, setText] = useState("");
  const phraseIndex = useRef(0);
  const characterIndex = useRef(0);

  useEffect(() => {
    phraseIndex.current = 0;
    characterIndex.current = 0;

    let timeoutId = 0;
    const loop = () => {
      const phrase = phrases[phraseIndex.current] ?? "";
      setText(phrase.slice(0, characterIndex.current));

      if (characterIndex.current < phrase.length) {
        characterIndex.current += 1;
      } else {
        setText(phrase);
        return;
      }

      timeoutId = window.setTimeout(loop, 55);
    };

    timeoutId = window.setTimeout(loop, 0);
    return () => window.clearTimeout(timeoutId);
  }, [phrases]);

  return (
    <span className="rail-typewriter" aria-hidden="true">
      {text}<span className="typewriter-caret" />
    </span>
  );
}

function RailSpeakerFace({
  speaker,
}: {
  speaker: (typeof speakers)[number];
}) {
  const phrases = useMemo(
    () => [`${speaker.name} · ${speaker.company}`],
    [speaker.company, speaker.name],
  );

  return (
    <a
      className="rail-face"
      href="#talks"
      aria-label={`View ${speaker.name} from ${speaker.company} in On-site Talk Shows`}
    >
      <img src={speaker.image} alt="" />
      <div>
        <Typewriter phrases={phrases} />
        <span className="sr-only">{speaker.name}, {speaker.company}</span>
      </div>
    </a>
  );
}

function InterblockDetails({
  content,
  tone = "light",
  actions,
  open = false,
}: {
  content: InterblockContent;
  tone?: "light" | "yellow" | "neutral";
  actions?: ReactNode;
  open?: boolean;
}) {
  const details = (
    <details
      className={`interblock-details interblock-${tone}`}
      data-rail={actions ? undefined : content.rail}
      open={open}
    >
      <summary aria-label={`${content.summary}. More details`}>
        <span className="interblock-summary-copy">
          <strong>{content.summary}</strong>
        </span>
        <span className="interblock-disclosure">
          <strong className="fx-echo">
            <span className="fx-echo-ghosts" aria-hidden="true">
              <span>More Details</span>
              <span>More Details</span>
            </span>
            <span className="fx-echo-label">More Details</span>
          </strong>
          <span className="interblock-toggle" aria-hidden="true">+</span>
        </span>
      </summary>
      <div className="interblock-body">
        <div className="interblock-intro">
          <p className="eyebrow">HOW THE FORMAT WORKS</p>
          <h3>{content.title}</h3>
          <p>{content.intro}</p>
        </div>
        <div className="interblock-grid">
          {content.points.map(([label, text], index) => (
            <article key={label}>
              {content === interblockContent.talksToPartners && (
                <img
                  className="interblock-feature-image"
                  src={editorialImageSources.technology[index]}
                  alt={formatFeatureAlts[index]}
                  loading="lazy"
                />
              )}
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </details>
  );

  if (!actions) return details;

  return (
    <div className={`interblock-featured interblock-${tone}`} data-rail={content.rail}>
      <div className="interblock-featured-actions" aria-label="Event actions">
        {actions}
      </div>
      {details}
    </div>
  );
}

function MoleculeFace({ item }: { item: (typeof molecules)[number] }) {
  return (
    <article className="molecule-card">
      <div className="molecule-top">
        <div className="molecule-half">
          <span>Useful</span>
          <p>{item.useful}</p>
        </div>
        <div className="molecule-half molecule-half-right">
          <span>Offer</span>
          <p>{item.offer}</p>
        </div>
        <img src={item.image} alt="" className="molecule-avatar" />
      </div>
      <div className="molecule-footer">
        <p>
          <strong>{item.person}</strong> <span>•</span> {item.company}
          {SAMPLE_DATA && <em className="sample-chip">SAMPLE</em>}
        </p>
        <button type="button" onClick={() => alert("Offer inquiry — prototype")}>
          Get this offer
        </button>
      </div>
    </article>
  );
}

function MoleculeCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);

  const pauseAtVisibleFront = () => {
    setPaused(true);
    if (animating) {
      setActive((current) => (current + 1) % molecules.length);
    }
    setAnimating(false);
  };

  useEffect(() => {
    if (paused || animating) return;
    const timer = window.setTimeout(() => setAnimating(true), 1200);
    return () => window.clearTimeout(timer);
  }, [active, animating, paused]);

  useEffect(() => {
    if (!animating) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % molecules.length);
      setAnimating(false);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [animating]);

  const visible = [0, 1, 2].map(
    (offset) => molecules[(active + offset) % molecules.length],
  );

  return (
    <div className="molecule-carousel">
      <div
        className="molecule-stack"
        aria-live="polite"
        onMouseEnter={pauseAtVisibleFront}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={pauseAtVisibleFront}
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setPaused(false);
          }
        }}
      >
        {visible.map((item, index) => (
          <div
            className={`molecule-layer molecule-layer-${index + 1}${animating ? " is-animating" : ""}`}
            key={`${item.company}-${index}`}
          >
            <MoleculeFace item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div className="phone-statusbar" aria-hidden="true">
      <span className="phone-time">9:41</span>
      <span className="phone-island" />
      <span className="phone-status-icons">
        <i className="phone-signal" />
        <i className="phone-wifi" />
        <i className="phone-battery" />
      </span>
    </div>
  );
}

// (v5.3 · TASK 1) Two identical frames side by side (same .leadchat-phone
// component, same 9 : 19.5 proportion, 24px gap). Left = inbox of arranged
// introductions, right = the conversation that was already here. Neither
// screen scrolls: the seven inbox rows plus the "+43 more" caption row fit
// inside the frame, and the flexible remainder is plain screen background.
function LeadchatPhones({ badge, productName }: { badge: string; productName: string }) {
  return (
    <div className="leadchat-pair">
      <div
        className="leadchat-phone leadchat-phone-inbox"
        aria-label={`Inbox of arranged ${productName} introductions shown on a phone`}
      >
        <div className="phone-screen">
          <PhoneStatusBar />
          <div className="phone-inbox-header">
            <strong>{productName}</strong>
            <span className="phone-inbox-badge">{badge}</span>
          </div>
          <ul className="phone-inbox-list">
            {leadchatInbox.map((row) => (
              <li key={row.name}>
                <span className="phone-inbox-avatar" aria-hidden="true">{row.initials}</span>
                <span className="phone-inbox-copy">
                  <span className="phone-inbox-name">
                    {row.name} <em>· {row.tag}</em>
                  </span>
                  <span className="phone-inbox-preview">{row.preview}</span>
                </span>
                <span className="phone-inbox-meta">
                  <span className="phone-inbox-time">{row.time}</span>
                  {row.unread && <i className="phone-inbox-dot" aria-hidden="true" />}
                </span>
              </li>
            ))}
          </ul>
          <p className="phone-inbox-more">+43 more arranged introductions</p>
        </div>
      </div>

      <div className="leadchat-phone" aria-label={`Sample ${productName} conversation shown on a phone`}>
        <div className="phone-screen">
          <PhoneStatusBar />
          <div className="phone-chat-header">
            <span className="phone-avatar" aria-hidden="true" />
            <div>
              <strong>Arena Introductions</strong>
              <small>{productName === "LeadChats" ? "LeadChat" : "Introduction chat"}</small>
            </div>
          </div>
          <div className="leadchat-mock">
            <p className="leadchat-bubble is-arena">Arena · Yuri, meet Tamara (Sandstone People, HR services). She hires marketers for teams like yours — Spot 17, Attract day.</p>
            <p className="leadchat-bubble is-reply">Hi Tamara — I’ll come by before 14:00.</p>
            <p className="leadchat-bubble">Tamara · See you at the spot — I’ll show how we staff UAE launches.</p>
          </div>
          <div className="phone-inputbar" aria-hidden="true">
            <span>Message</span>
            <i className="phone-send">↑</i>
          </div>
        </div>
      </div>
    </div>
  );
}

// (v5.7 · T4) Shared joindubai carousel behavior adapted to the no-scroll
// invariant: one cloned set for the loop, one-card button steps, timed spin,
// hover/touch pause, viewport pause, and reduced-motion respect. Movement is
// transform-only; the window is a visual mask, never a scroll container.
function useSourceCarousel(itemCount: number, interval: number) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitioning, setTransitioning] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const pauseFor = useCallback((duration = 6000) => {
    clearResumeTimer();
    setPaused(true);
    resumeTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      resumeTimerRef.current = null;
    }, duration);
  }, [clearResumeTimer]);

  const resume = useCallback(() => {
    clearResumeTimer();
    setPaused(false);
  }, [clearResumeTimer]);

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1101px)");
    const medium = window.matchMedia("(min-width: 761px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPerView(wide.matches ? 3 : medium.matches ? 2 : 1);
      setReducedMotion(reduced.matches);
      setIndex(0);
    };
    update();
    wide.addEventListener("change", update);
    medium.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      medium.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.12 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const next = useCallback(() => {
    if (reducedMotion) {
      const last = Math.max(0, itemCount - perView);
      setIndex((current) => current >= last ? 0 : current + 1);
      return;
    }
    setTransitioning(true);
    setIndex((current) => current + 1);
  }, [itemCount, perView, reducedMotion]);

  const previous = useCallback(() => {
    if (reducedMotion) {
      const last = Math.max(0, itemCount - perView);
      setIndex((current) => current <= 0 ? last : current - 1);
      return;
    }
    if (index > 0) {
      setIndex(index - 1);
      return;
    }
    setTransitioning(false);
    setIndex(itemCount);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransitioning(true);
        setIndex(itemCount - 1);
      });
    });
  }, [index, itemCount, perView, reducedMotion]);

  useEffect(() => {
    if (paused || !inView || reducedMotion || itemCount <= perView) return;
    const timer = window.setInterval(next, interval);
    return () => window.clearInterval(timer);
  }, [inView, interval, itemCount, next, paused, perView, reducedMotion]);

  const onTransitionEnd = () => {
    if (!reducedMotion && index >= itemCount) {
      setTransitioning(false);
      setIndex(0);
      window.requestAnimationFrame(() => setTransitioning(true));
    }
  };

  return {
    index,
    next,
    onTransitionEnd,
    paused,
    perView,
    previous,
    reducedMotion,
    rootRef,
    pauseFor,
    resume,
    setPaused,
    transitioning,
  };
}

function CarouselArrow({ direction, label, onClick }: { direction: "previous" | "next"; label: string; onClick: () => void }) {
  return (
    <button className="source-carousel__btn" type="button" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={direction === "previous" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

function EconomyCarousel() {
  const carousel = useSourceCarousel(alignmentCards.length, 3000);
  const cards = carousel.reducedMotion ? alignmentCards : [...alignmentCards, ...alignmentCards];

  return (
    <div
      className="source-carousel economy-carousel"
      ref={carousel.rootRef}
      onMouseEnter={() => carousel.setPaused(true)}
      onMouseLeave={carousel.resume}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") carousel.setPaused(!carousel.paused);
      }}
    >
      <div className="source-carousel__nav">
        <CarouselArrow direction="previous" label="Previous economy dossier" onClick={() => { carousel.resume(); carousel.previous(); }} />
        <CarouselArrow direction="next" label="Next economy dossier" onClick={() => { carousel.resume(); carousel.next(); }} />
      </div>
      <div className="source-carousel__window">
        <div
          className={`source-carousel__track${carousel.transitioning ? " is-transitioning" : ""}`}
          style={{
            transform: `translate3d(${-carousel.index * (100 / carousel.perView)}%, 0, 0)`,
            "--source-per-view": String(carousel.perView),
          } as CSSProperties}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget) carousel.onTransitionEnd();
          }}
        >
          {cards.map((card, cardIndex) => (
            <div
              className="source-carousel__slide"
              aria-hidden={cardIndex >= alignmentCards.length ? true : undefined}
              key={`${card.kicker}-${cardIndex >= alignmentCards.length ? "clone" : "original"}`}
            >
              <figure className="eco-card">
                <div className="eco-card__doc">
                  <span className="eco-card__kicker">{card.kicker}</span>
                  <b className="eco-card__strategy">{card.strategy}</b>
                  <p className="eco-card__text">{card.body}</p>
                </div>
                <div className="eco-card__frame">
                  <img src={card.image} loading="lazy" width="600" height="800" alt={card.alt} />
                  <span className="eco-card__badge">#JoinDubai</span>
                </div>
                <figcaption className="eco-card__agency">{card.agency}</figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsCarousel({ onOpenArticle }: { onOpenArticle: (article: InsightArticle) => void }) {
  const carousel = useSourceCarousel(insightArticles.length, 3000);
  const articles = carousel.reducedMotion ? insightArticles : [...insightArticles, ...insightArticles];

  return (
    <div
      className="source-carousel insights-carousel"
      ref={carousel.rootRef}
      onMouseEnter={() => carousel.setPaused(true)}
      onMouseLeave={carousel.resume}
      onFocusCapture={() => carousel.setPaused(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) carousel.resume();
      }}
    >
      <div className="source-carousel__nav">
        <CarouselArrow direction="previous" label="Previous article" onClick={() => { carousel.resume(); carousel.previous(); }} />
        <CarouselArrow direction="next" label="Next article" onClick={() => { carousel.resume(); carousel.next(); }} />
      </div>
      <div className="source-carousel__window insights-window">
        <div
          className={`source-carousel__track insights-track${carousel.transitioning ? " is-transitioning" : ""}`}
          style={{
            transform: `translate3d(${-carousel.index * (100 / carousel.perView)}%, 0, 0)`,
            "--source-per-view": String(carousel.perView),
          } as CSSProperties}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget) carousel.onTransitionEnd();
          }}
        >
          {articles.map((article, articleIndex) => (
            <div
              className="source-carousel__slide insight-slide"
              aria-hidden={articleIndex >= insightArticles.length ? true : undefined}
              key={`${article.image}-${articleIndex >= insightArticles.length ? "clone" : "original"}`}
            >
              <button
                className="li-card"
                type="button"
                aria-label={`Read article: ${article.title}`}
                onClick={() => onOpenArticle(article)}
                tabIndex={articleIndex >= insightArticles.length ? -1 : undefined}
              >
                <span className="li-card__cover"><img src={article.image} loading="lazy" width="600" height="338" alt="" /></span>
                <span className="li-card__body">
                  <span className="li-card__author">
                    <span className="li-card__avatar" aria-hidden="true">SD</span>
                    <span className="li-card__who"><b>Stepan Danilov</b><i>Founder, The Arena</i></span>
                  </span>
                  <span className="li-card__kicker">{article.label}</span>
                  <span className="li-card__title">{article.title}</span>
                  <span className="li-card__hook">{article.teaser}</span>
                  <span className="li-card__cta">Read article →</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpotVisual({ audience }: { audience: Audience }) {
  return (
    <figure className="spot-visual">
      {audience === "visitor" ? (
        <video
          className="spot-visual-video"
          autoPlay
          loop
          controls
          muted
          playsInline
          preload="metadata"
          poster="/arena-spot.jpg"
          aria-label="The Arena event preview"
        >
          <source src="/reference/media/promo-pingpong.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          src="/arena-spot.jpg"
          alt="Arena spot with one TV, two bar stools and one round bar table"
        />
      )}
      <figcaption>
        1 TV · 2 BAR STOOLS · 1 ROUND BAR TABLE
      </figcaption>
    </figure>
  );
}

function HeroPreview({ audience }: { audience: Audience }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audience !== "exhibitor") return;
    const video = videoRef.current;
    if (!video) return;
    const syncPlayback = () => setPlaying(!video.paused && !video.ended);
    const startPlayback = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      void video.play().then(syncPlayback).catch(syncPlayback);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") startPlayback();
    };

    startPlayback();
    // Safari can defer the initial autoplay attempt until metadata is available.
    const retryId = window.setTimeout(startPlayback, 180);
    video.addEventListener("canplay", startPlayback);
    video.addEventListener("loadeddata", startPlayback);
    window.addEventListener("pageshow", startPlayback);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      video.removeEventListener("canplay", startPlayback);
      video.removeEventListener("loadeddata", startPlayback);
      window.removeEventListener("pageshow", startPlayback);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(retryId);
    };
  }, [audience]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }

  return (
    <div className="event-media">
      {audience === "visitor" ? (
        <img
          className="hero-static-image"
          src="/reference/media/arena-double-spot-people.webp"
          alt="Two people meeting at a double-sided Arena showcase spot"
          width="1920"
          height="1280"
          decoding="async"
          fetchPriority="high"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied === "true") {
              return;
            }
            image.dataset.fallbackApplied = "true";
            image.src = "/arena-spot.jpg";
          }}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="The Arena event preview"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src="/reference/media/promo-pingpong.mp4" type="video/mp4" />
          </video>
          <button
            type="button"
            className="video-control"
            aria-label={playing ? "Pause event preview" : "Play event preview"}
            onClick={togglePlayback}
          >
            <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          </button>
        </>
      )}
    </div>
  );
}

type ArenaMassStatus = "available" | "sold" | "sold-alternate";

function ArenaMassSideGeometry({
  status,
  label,
  position,
  transform,
}: {
  status: ArenaMassStatus;
  label: string;
  position: "front" | "rear";
  transform?: string;
}) {
  return (
    <g className={`arena-svg-side arena-svg-side--${status} arena-svg-side--${position}`} transform={transform}>
      <ellipse className="arena-svg-footprint" cx="196" cy="491" rx="174" ry="27" />
      <g className="arena-svg-tv-stand">
        <path d="M198 29 205 28 207 366 195 369Z" />
        <ellipse cx="201" cy="370" rx="31" ry="8" />
      </g>
      <g className="arena-svg-television">
        <rect x="75" y="74" width="250" height="151" rx="10" />
        <rect className="arena-svg-status-fill" x="89" y="88" width="222" height="123" rx="3" />
        <path className="arena-svg-screen-sheen" d="M95 94h118l-94 111H95Z" />
        <rect x="184" y="225" width="31" height="8" rx="2" />
      </g>
      <g className="arena-svg-table">
        <ellipse className="arena-svg-table-edge" cx="201" cy="323" rx="84" ry="24" />
        <ellipse className="arena-svg-status-fill" cx="201" cy="316" rx="84" ry="24" />
        <path className="arena-svg-metal" d="M197 337h9l5 112h-19Z" />
        <ellipse className="arena-svg-metal-dark" cx="201" cy="454" rx="56" ry="13" />
      </g>
      {["translate(24 359)", "translate(282 348)"].map((stoolTransform) => (
        <g className="arena-svg-stool" transform={stoolTransform} key={stoolTransform}>
          <ellipse className="arena-svg-seat-edge" cx="48" cy="19" rx="45" ry="15" />
          <ellipse className="arena-svg-status-fill" cx="48" cy="14" rx="45" ry="15" />
          <path className="arena-svg-frame" d="m18 27 7 105M78 27l-8 105M23 92h49M19 77l55 1" />
        </g>
      ))}
      <g className="arena-svg-side-marker" transform={position === "rear" ? "translate(402 0) scale(-1 1)" : undefined}>
        <circle cx="201" cy="52" r="17" />
        <text x="201" y="58" textAnchor="middle">{label}</text>
      </g>
    </g>
  );
}

function ArenaMassPair({ pairIndex, soldSpots }: { pairIndex: number; soldSpots: number }) {
  const firstIndex = pairIndex * 2;
  const secondIndex = firstIndex + 1;
  const firstSold = firstIndex < soldSpots;
  const secondSold = secondIndex < soldSpots;
  const fullySold = firstSold && secondSold;

  return (
    <svg
      className={`arena-mass-pair${fullySold ? " is-fully-sold" : firstSold || secondSold ? " is-mixed" : " is-available"}`}
      viewBox="0 0 760 560"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Back-to-back pair ${pairIndex + 1}: spots ${firstIndex + 1} and ${secondIndex + 1}`}
    >
      <ellipse className="arena-svg-pair-shadow" cx="380" cy="501" rx="276" ry="38" />
      <ArenaMassSideGeometry
        status={secondSold ? (fullySold ? "sold-alternate" : "sold") : "available"}
        label={`${secondIndex + 1}`}
        position="rear"
        transform="translate(592 28) scale(-0.84 0.84)"
      />
      <ArenaMassSideGeometry
        status={firstSold ? "sold" : "available"}
        label={`${firstIndex + 1}`}
        position="front"
        transform="translate(92 42)"
      />
    </svg>
  );
}

function ArenaMassScene({
  soldSpots,
  className = "",
  pairCount = 16,
}: {
  soldSpots: number;
  className?: string;
  pairCount?: number;
}) {
  return (
    <div className={`arena-mass-scene${className ? ` ${className}` : ""}`}>
      {Array.from({ length: pairCount }, (_, pairIndex) => (
        <ArenaMassPair key={pairIndex} pairIndex={pairIndex} soldSpots={soldSpots} />
      ))}
    </div>
  );
}

function ArenaSingleSpotSvg({ tone = "yellow" }: { tone?: "yellow" | "black" }) {
  const status = tone === "black" ? "sold" : "available";
  return (
    <svg
      className={`arena-decoder-svg arena-single-spot-svg arena-single-spot-svg--${tone}`}
      data-spot-status="available"
      data-spot-tone={tone}
      viewBox="0 0 400 520"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="One available showcase spot with a TV, a round table, two stools and a laptop connected by HDMI for a presentation"
    >
      <ArenaMassSideGeometry status={status} label="A" position="front" />
      <g className="arena-single-laptop" aria-hidden="true">
        <path className="arena-single-hdmi-cable-shadow" d="M220 310 C284 350 348 292 291 257 C255 235 265 210 301 208" fill="none" stroke="#171717" strokeWidth="15" strokeLinecap="round" opacity=".45" />
        <path className="arena-single-hdmi-cable" d="M220 310 C284 350 348 292 291 257 C255 235 265 210 301 208" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
        <rect x="288" y="230" width="62" height="24" rx="6" fill="#ffffff" stroke="#171717" strokeWidth="3" />
        <text x="319" y="246" textAnchor="middle" fill="#171717" fontSize="13" fontWeight="800">HDMI</text>
        <g className="arena-single-laptop-device arena-single-laptop-device--on-table" transform="translate(119 225)">
          <path d="M8 8 Q10 0 19 0 H112 Q121 0 122 8 V63 H8Z" fill="#ffffff" stroke="#171717" strokeWidth="5" />
          <rect x="17" y="10" width="96" height="44" rx="3" fill="#252525" />
          <text x="65" y="37" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">PPT · PDF · VIDEO</text>
          <path d="M0 66 H132 L116 85 H17Z" fill="#ffffff" stroke="#171717" strokeWidth="5" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

function HallPlan({
  simUnsold,
  onSimUnsoldChange,
}: {
  simUnsold: number;
  onSimUnsoldChange: (value: number) => void;
}) {
  const simSold = siteStats.totalSpots - simUnsold;
  const simWindows = simUnsold * siteStats.hoursPerTrialSpot;
  const soldStop = siteStats.paidSpots / siteStats.totalSpots;
  const sellableRange = siteStats.totalSpots - 1 - siteStats.paidSpots;
  const soldProgress = sellableRange > 0 ? (simSold - siteStats.paidSpots) / sellableRange : 0;
  const railCut = (soldStop + soldProgress * (1 - soldStop)) * 100;

  return (
    <div
      className="hall-plan"
      aria-label={`Interactive vertical venue plan for a 500 square metre hall with 16 double-sided units and ${siteStats.totalSpots} full-day spots: ${simSold} sold and ${simUnsold} unsold, creating ${simWindows} one-hour trial timeslots`}
    >
      <div className="hall-plan-title">
        <h3>Venue Plan</h3>
        <span>500 M² RECTANGULAR HALL</span>
      </div>
      <div className="venue-capacity-layout">
        <div className="capacity-slider-block capacity-slider-block--venue">
          <p className="capacity-slider-label">WHAT IF MORE FULL-DAY SPOTS SELL?</p>
          <div className="venue-slider-live">
            <div className="capacity-slider-informer capacity-slider-informer-sold">
              <strong>{simSold}</strong>
              <span>SOLD TO EXHIBITORS</span>
            </div>
            <div
              className="venue-range-shell"
              style={{ "--venue-sold-stop": `${soldStop * 100}%`, "--venue-rail-cut": `${railCut}%` } as CSSProperties}
            >
              <input
                type="range"
                className="capacity-slider-input capacity-slider-input--vertical"
                min={siteStats.paidSpots}
                max={siteStats.totalSpots - 1}
                step={1}
                value={simSold}
                onChange={(event) => onSimUnsoldChange(siteStats.totalSpots - Number(event.target.value))}
                aria-label="Simulate more full-day spots sold"
                aria-orientation="vertical"
                aria-valuetext={`${simUnsold} unsold spots, ${simSold} sold spots, ${simWindows} free trial timeslots`}
              />
            </div>
            <div className="capacity-slider-informer capacity-slider-informer-available">
              <strong>{simWindows}</strong>
              <span>AVAILABLE FOR WAITLIST</span>
              <small>{simUnsold}×{siteStats.hoursPerTrialSpot} timeslots</small>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">At {simSold} sold spots there are {simWindows} free trial timeslots left.</p>
        </div>

        <div className="hall-floor">
          <ArenaMassScene soldSpots={simSold} className="hall-grid" />
          <span className="hall-entrance">ENTRANCE</span>
        </div>
      </div>
      <div className="venue-hour-decoder v602-hour-decoder" aria-label="One unsold spot can host eight companies in eight trial timeslots">
        <h4>ONE UNSOLD SPOT → 8 COMPANIES</h4>
        <div className="v602-decoder-spot v602-decoder-spot--available v602-decoder-spot--yellow" data-spot-status="available" data-spot-tone="yellow">
          <ArenaSingleSpotSvg />
          <strong>ONE UNSOLD SPOT</strong>
          <p className="v602-decoder-callout">Bring only <mark className="decoder-callout-key">your</mark> laptop with a service presentation — slides, documents, video and more.</p>
        </div>
        <span className="v602-decoder-arrow" aria-hidden="true">→</span>
        <div className="venue-decoder-hours v602-decoder-hours">
          <strong>8 COMPANIES</strong>
          <p>One waitlist company per hour, with 5 arranged LeadChats each.</p>
          <ol className="v602-timeslot-list" aria-label="Eight one-hour trial timeslots">
            {trialHours.map((hour) => (
              <li key={hour}>
                <span>{hour}</span>
                <b>Company from waitlist</b>
                <small>5 LeadChats</small>
              </li>
            ))}
          </ol>
          <a className="button v602-decoder-cta" href="#waitlist">JOIN WAITLIST ↓</a>
        </div>
      </div>
    </div>
  );
}

// Pricing keeps the v5.6 cards, photo, prices, trial matrix and hour calendar.
// v5.7 relocates the only capacity control to HallPlan; this controlled value
// keeps the trial matrix in sync without ever mutating siteStats.
function PricingPlans({
  trialTariffRef,
  onOpenModal,
}: {
  trialTariffRef: RefObject<HTMLElement | null>;
  onOpenModal: (type: ModalType) => void;
}) {
  return (
    <div className="tariff-matrix" aria-label="Free trial, full-day and visitor plans">
      <article className="tariff-card trial-tariff" ref={trialTariffRef}>
        <strong className="tariff-heading tariff-heading--trial">Free Trial — 1-hour Timeslot</strong>
        <p>One hour at an unsold full-day spot. Application is free; allocation is not guaranteed.</p>
        <a className="button audience-pill exhibitor-pill button-wide trial-waitlist-link" href="#waitlist">
          <span>For exhibitors</span>
          <small>FREE TRIAL</small>
        </a>
      </article>

      <article className="tariff-card full-day-tariff tariff-card--inverted">
        <div className="full-day-tariff-main">
          <div className="full-day-spot-visual" aria-label="Guaranteed full-day spot with a TV, table, stools and laptop">
            <ArenaSingleSpotSvg tone="black" />
          </div>
          <div className="full-day-tariff-copy">
            <strong className="tariff-heading tariff-heading--full-day">Full-day Spot — Guaranteed</strong>
            <p>Dedicated physical showcase, LeadChats and media coverage after payment.</p>
          </div>
        </div>
        <div className="sponsor-subsidy-badge sponsor-subsidy-hint" role="note" id="full-day-subsidy-note">
          <span>SPONSOR SUBSIDY</span>
          <strong>AED 2,000 SAVED</strong>
          <small className="sponsor-subsidy-message">Early-bird rate · while subsidized spots remain</small>
          <span className="sponsor-subsidy-arrow-hook" aria-hidden="true" />
        </div>
        <button type="button" className="button dark button-wide full-day-cta full-day-cta--inline" aria-describedby="full-day-subsidy-note" onClick={() => onOpenModal("book")}>
          <span className="full-day-cta-text">Buy Full-day Spot</span>
          <span className="full-day-cta-price">
            <del className="full-day-standard-price" aria-label="AED 5,000 standard price">AED 5,000</del>
            <strong className="full-day-early-bird-price">AED 3,000</strong>
          </span>
          <span className="full-day-cta-arrow-target" aria-hidden="true" />
        </button>
      </article>

      <article className="tariff-card visitor-tariff">
        <strong className="tariff-heading tariff-heading--visitor">Visitor Registration — Free</strong>
        <ul><li>Free event access</li><li>Optional matching profile</li></ul>
        <button type="button" className="button audience-pill visitor-pill button-wide" onClick={() => onOpenModal("visitor")}>
          <span>For visitors</span>
          <small>FREE</small>
        </button>
      </article>
    </div>
  );
}

function Modal({
  type,
  onClose,
  onWaitlistSubmitted,
  article,
}: {
  type: ModalType;
  onClose: () => void;
  onWaitlistSubmitted?: () => void;
  article?: InsightArticle | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const config = {
    visitor: {
      eyebrow: "FREE VISITOR PASS",
      title: "Tell us who should meet you",
      note: "Zoho draft: VISITOR → pass + profile link + suggested matches.",
    },
    waitlist: {
      eyebrow: "FREE TRIAL · 1 HOUR",
      title: "Join the trial waitlist",
      note: "Zoho draft: TRIAL → application received + timeslot logic + preparation list.",
    },
    book: {
      eyebrow: "GUARANTEED FULL-DAY SPOT",
      title: "Request a full-day spot",
      note: "Zoho draft: EXHIBITOR → availability + subsidized invoice + booking deadline.",
    },
    offer: {
      eyebrow: "FREE COMPANY PROFILE",
      title: "Add your molecule",
      note: "Zoho draft: PROFILE → review status + edit link + event invitation.",
    },
    article: {
      eyebrow: article?.label ?? "ARTICLE",
      title: article?.title ?? "Article",
      note: "",
    },
  }[type];

  useEffect(() => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusTarget = dialog.querySelector<HTMLElement>(
        "[data-modal-focus], input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), a[href]",
      );
      focusTarget?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [submitted, type]);

  useEffect(() => {
    const getFocusableElements = () => {
      const dialog = dialogRef.current;
      if (!dialog) return [];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([type='hidden']):not([disabled]), textarea:not([disabled]), select:not([disabled]), details summary, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => {
        const style = window.getComputedStyle(element);
        return style.visibility !== "hidden" && style.display !== "none";
      });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        !(activeElement instanceof Node) ||
        !dialogRef.current?.contains(activeElement)
      ) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (type !== "waitlist") {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const payload = {
      company: value("company"),
      industry: value("industry"),
      email: value("email"),
      phone: value("phone"),
      comments: value("comments"),
      offer: value("ourOffer"),
      useful: value("usefulWith"),
      promoUrl: value("promoUrl"),
      eventEmailOptIn: data.get("eventEmailOptIn") === "on",
      introductionsOptIn: data.get("introductionsOptIn") === "on",
      whatsappOptIn: data.get("whatsappOptIn") === "on",
      consentAvailability: data.get("limitedCapacityConsent") === "on",
      consentContact: data.get("contactConsent") === "on",
      referrer: document.referrer,
      pageUrl: window.location.href,
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!response.ok || result.ok === false) {
        const message = result.error === "not_configured" || result.error === "upstream_unavailable"
          ? "The waitlist service is temporarily unavailable. Please try again shortly."
          : result.error === "consent_required"
            ? "Please accept both required confirmations."
            : result.error === "invalid_promo_url"
              ? "Please enter a complete http or https promo URL."
              : "We could not save your application. Please review the fields and try again.";
        throw new Error(message);
      }
      setSubmitted(true);
      onWaitlistSubmitted?.();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not save your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className={`modal-card${type === "article" ? " article-modal-card" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose}>
          <span className="sr-only">Close</span>×
        </button>
        <p className="eyebrow">{config.eyebrow}</p>
        {type === "book" && <div className="request-key">SPOT REQUEST</div>}
        <h2 id="modal-title">{config.title}</h2>

        {type === "article" && article ? (
          <article className="article-modal-content">
            <img src={article.image} width="600" height="338" alt="" />
            {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <button type="button" className="button primary" data-modal-focus onClick={onClose}>Close article</button>
          </article>
        ) : submitted ? (
          <div className="modal-success">
            <strong>✓</strong>
            {type === "waitlist" ? (
              <p>Your application is saved. The team will review it before it appears on the public waitlist.</p>
            ) : (
              <>
                <p>Prototype submission captured. Connect Zoho before launch to save the record and send the email sequence.</p>
                <div className="dev-hint">DEV · {config.note}</div>
              </>
            )}
            <button type="button" className="button primary" data-modal-focus onClick={onClose}>
              Done
            </button>
          </div>
        ) : type === "waitlist" ? (
          <form onSubmit={submit} className="modal-form waitlist-form">
            <label>
              <span className="field-label">Company Name <b className="required-mark" aria-hidden="true">*</b></span>
              <input name="company" required maxLength={100} data-modal-focus placeholder="Beauty Salon LLC" autoComplete="organization" />
              <small>Your company name is masked before it is shown publicly.</small>
            </label>
            <label>
              <span className="field-label">Industry / Sector <b className="required-mark" aria-hidden="true">*</b></span>
              <select name="industry" required defaultValue="">
                <option value="" disabled>Select your industry</option>
                {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Email <b className="required-mark" aria-hidden="true">*</b></span>
              <input name="email" type="email" required maxLength={120} placeholder="mail@company.com" autoComplete="email" />
            </label>
            <label>
              Whatsapp / Phone
              <input name="phone" type="tel" maxLength={40} placeholder="+971 00 000 0000" autoComplete="tel" />
            </label>
            <label>
              Referral Source &amp; Comments to Organizers
              <textarea name="comments" maxLength={600} rows={3} placeholder="How did you hear about us? Any additional comments…" />
            </label>
            <div className="form-row">
              <label>
                Our offer
                <textarea name="ourOffer" maxLength={300} rows={3} placeholder="What can visitors receive or try?" />
              </label>
              <label>
                We&apos;re useful with
                <textarea name="usefulWith" maxLength={300} rows={3} placeholder="What business problem can you help solve?" />
              </label>
            </div>
            <label className="promo-url-field">
              <span className="field-label promo-url-label">
                URL of your announcement post (optional)
                <span className="promo-url-help">
                  <button type="button" className="promo-url-help-trigger" aria-label="Announcement post conditions">?</button>
                  <span className="promo-url-popover" role="tooltip">
                    Publish an original post about your Arena participation or visit (LinkedIn, Instagram, X, blog or newsletter). Include: The Arena, the dates 21–22 Sep and thearena.show. Up to 5 boosts per company. Original beats template.
                  </span>
                </span>
              </span>
              <input name="promoUrl" type="url" maxLength={500} inputMode="url" placeholder="https://instagram.com/…" />
              <small>Recommended: apply a second time with a link to your public post about The Arena — a moderated post earns an extra entry in the allocation queue.</small>
            </label>
            <label className="consent-field">
              <input name="eventEmailOptIn" type="checkbox" required />
              <span><b aria-hidden="true">*</b> I agree to receive The Arena event emails (waitlist status, allocation, event logistics).</span>
            </label>
            <label className="consent-field">
              <input name="introductionsOptIn" type="checkbox" />
              <span>Enable Arena Introductions: let The Arena arrange relevant meetings for me and share my company one-liner with matched attendees.</span>
            </label>
            <label className="consent-field">
              <input name="whatsappOptIn" type="checkbox" />
              <span>Send me time-sensitive updates (timeslot allocation, schedule changes) on WhatsApp — I’ll add my number.</span>
            </label>
            <label className="consent-field">
              <input name="limitedCapacityConsent" type="checkbox" required />
              <span><b aria-hidden="true">*</b> I understand that free trial timeslots are limited and sponsor-subsidized. Joining the waitlist does not guarantee allocation.</span>
            </label>
            <label className="consent-field">
              <input name="contactConsent" type="checkbox" required />
              <span><b aria-hidden="true">*</b> I agree that The Arena team may use my contact details for waitlist updates and opportunities.</span>
            </label>
            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            <button className="button primary button-wide" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Join waitlist"} {!submitting && <Arrow />}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="modal-form">
            {(type === "visitor" || type === "book" || type === "offer") && (
              <label>
                Your name
                <input name="name" required maxLength={80} data-modal-focus />
              </label>
            )}
            <div className="form-row">
              <label>
                Company {type === "visitor" ? "+ country" : ""}
                <input name="company" required maxLength={100} />
              </label>
              <label>
                Contact email
                <input name="email" type="email" required maxLength={120} />
              </label>
            </div>

            {(type === "visitor" || type === "book" || type === "offer") && (
              <label className="file-field">
                Company logo
                <input name="logo" type="file" accept="image/*" required />
                <span>PNG, JPG or WEBP · select file</span>
              </label>
            )}

            {type === "visitor" && (
              <details className="optional-fields">
                <summary>Optional: improve your matches</summary>
                <div className="form-row">
                  <label>
                    We are useful with
                    <textarea name="useful" maxLength={150} rows={3} />
                    <small>Maximum 150 characters</small>
                  </label>
                  <label>
                    Our deal / offer
                    <textarea name="offer" maxLength={150} rows={3} />
                    <small>Maximum 150 characters</small>
                  </label>
                </div>
              </details>
            )}

            {(type === "book" || type === "offer") && (
              <div className="form-row">
                <label>
                  We are useful with
                  <textarea name="useful" required maxLength={150} rows={3} />
                  <small>Required · maximum 150 characters</small>
                </label>
                <label>
                  Our deal / offer
                  <textarea name="offer" required maxLength={150} rows={3} />
                  <small>Required · maximum 150 characters</small>
                </label>
              </div>
            )}

            {type === "book" && (
              <label>
                Preferred day
                <select name="day" defaultValue="21 Sep — Attract">
                  <option>21 Sep — Attract</option>
                  <option>22 Sep — Automate</option>
                  <option>Any day</option>
                </select>
              </label>
            )}

            {type === "visitor" && (
              <>
                <label className="consent-field">
                  <input name="eventEmailOptIn" type="checkbox" />
                  <span>I agree to receive The Arena event emails (waitlist status, allocation, logistics).</span>
                </label>
                <label className="consent-field">
                  <input name="whatsappOptIn" type="checkbox" />
                  <span>Send me time-sensitive updates (timeslot allocation, schedule changes) on WhatsApp — I’ll add my number.</span>
                </label>
              </>
            )}
            <button className="button primary button-wide" type="submit">
              {type === "visitor"
                ? "Get free pass"
                : type === "book"
                    ? "Request full-day spot"
                    : "Add my offer · Free"}
              <Arrow />
            </button>
            <div className="dev-hint">DEV · {config.note}</div>
          </form>
        )}
      </section>
    </div>
  );
}

function StickyRail({
  stage,
  showSpeakers,
  showOffers,
  showExhibitors,
  showWaitlist,
  identityInHeader,
  waitlistCount,
  waitlistEntries,
  onIdentityFitChange,
  onJoinWaitlist,
}: {
  stage: RailStage;
  showSpeakers: boolean;
  showOffers: boolean;
  showExhibitors: boolean;
  showWaitlist: boolean;
  identityInHeader: boolean;
  waitlistCount: number;
  waitlistEntries: WaitlistEntry[];
  onIdentityFitChange: (identityInHeader: boolean) => void;
  onJoinWaitlist: () => void;
}) {
  const [speakerPairStart, setSpeakerPairStart] = useState(0);
  const railSpeakers = useMemo(
    () => [
      speakers[speakerPairStart % speakers.length],
      speakers[(speakerPairStart + 1) % speakers.length],
    ],
    [speakerPairStart],
  );
  const exhibitors = siteStats.potentialTrialSlots + siteStats.paidSpots;
  const railRef = useRef<HTMLElement>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const progressiveRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const wlCardRef = useRef<HTMLDivElement>(null);
  const wlPartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The explicit Speakers On/Off control owns this content motion. When it
    // is On, pairs rotate and names type even if the system reduces decorative
    // motion; the Off control remains the immediate opt-out.
    if (!showSpeakers) return;
    const rotationId = window.setInterval(() => {
      setSpeakerPairStart((current) => (current + 2) % speakers.length);
    }, 4000);
    return () => window.clearInterval(rotationId);
  }, [showSpeakers]);

  useEffect(() => {
    const rail = railRef.current;
    const identity = identityRef.current;
    const progressive = progressiveRef.current;
    if (!rail || !identity || !progressive) return;

    let frame = 0;
    let active = true;

    const measure = () => {
      frame = 0;
      if (!active) return;

      // Measure intrinsic child geometry rather than the flex item's own
      // scrollHeight: `.rail-progressive` fills the remaining rail height, so
      // its box height is not the height required by its content. Flex-item
      // margins do not collapse, which makes their sum stable across states.
      const progressiveStyle = window.getComputedStyle(progressive);
      const children = Array.from(progressive.children) as HTMLElement[];
      const padding =
        (Number.parseFloat(progressiveStyle.paddingTop) || 0) +
        (Number.parseFloat(progressiveStyle.paddingBottom) || 0);
      const rowGap = Number.parseFloat(progressiveStyle.rowGap) || 0;
      const progressiveContentHeight = children.reduce((height, child) => {
        const childStyle = window.getComputedStyle(child);
        const childHeight = Math.max(
          child.offsetHeight,
          child.getBoundingClientRect().height,
        );
        const childMargins =
          (Number.parseFloat(childStyle.marginTop) || 0) +
          (Number.parseFloat(childStyle.marginBottom) || 0);
        return height + childHeight + childMargins;
      }, padding + rowGap * Math.max(0, children.length - 1));
      const identityHeight = Math.max(
        identity.scrollHeight,
        identity.getBoundingClientRect().height,
      );
      const requiredHeight = identityHeight + progressiveContentHeight;
      const availableHeight = rail.clientHeight;
      const shortRailEnterHeight = 660;
      const shortRailExitHeight = 700;
      const shortHeightRequiresHeader = identityInHeader
        ? window.innerHeight < shortRailExitHeight
        : window.innerHeight <= shortRailEnterHeight;
      const contentRequiresHeader = identityInHeader
        ? requiredHeight > availableHeight - 28
        : requiredHeight > availableHeight + 8;
      const shouldMoveIdentity = shortHeightRequiresHeader || contentRequiresHeader;

      // Separate enter/exit thresholds add headroom before the identity can
      // return from the header and prevent Chrome sub-pixel resize oscillation.
      if (shouldMoveIdentity !== identityInHeader) {
        onIdentityFitChange(shouldMoveIdentity);
      }
    };

    const scheduleMeasure = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
    resizeObserver?.observe(rail);
    resizeObserver?.observe(identity);
    resizeObserver?.observe(progressive);
    Array.from(progressive.children).forEach((child) => resizeObserver?.observe(child));
    window.addEventListener("resize", scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure);
    scheduleMeasure();

    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [identityInHeader, onIdentityFitChange, showExhibitors, showOffers, showSpeakers, showWaitlist, stage]);

  // (M·v5.2) Scroll-linked strip choreography.
  // Mapping: progress = clamp01((scrollY − startY) / (endY − startY));
  //          translate = progress × maxTranslate,
  //          maxTranslate = stripHeight − railViewportHeight (end clamp: the
  //          rail freezes exactly when the last entry is fully visible).
  // startY = the 04→05 boundary (top of section 05) entering the viewport
  //          bottom; endY = the bottom of the FAQ section (last content
  //          section) reaching the viewport bottom.
  // The waitlist-count informer pins at the rail top with a JS
  // counter-transform once translate ≥ its strip offset: CSS sticky cannot
  // engage here because sticky reacts to scrollport scroll positions, not to
  // ancestor transforms (tested — the rail's scrollTop never changes).
  // (v5.4 · TASK 5) This choreography now runs at EVERY width, including
  // phones — the rail is the ONLY place the waitlist list renders, so the
  // narrow mobile column needs the same pin/flow/clamp behaviour as desktop.
  useEffect(() => {
    const rail = railRef.current;
    const strip = stripRef.current;
    const wlPart = wlPartRef.current;
    if (!rail || !strip || !wlPart) return;
    const wlCard = wlCardRef.current;

    let frame = 0;
    let active = true;
    let startY = 0;
    let endY = 1;
    let maxTranslate = 0;

    const apply = () => {
      frame = 0;
      if (!active) return;
      const span = Math.max(1, endY - startY);
      const progress = Math.min(1, Math.max(0, (window.scrollY - startY) / span));
      const translate = progress * maxTranslate;
      strip.style.transform = `translate3d(0, ${-translate}px, 0)`;
      // (v5.6.1 · owner #6) Freeze the informer/JOIN pin at the rail top: while
      // the strip has not yet carried the pin above the top it rides along
      // (over = 0); once the strip translation passes the pin's natural offset
      // in the strip, counter-translate the pin DOWN by the excess so it holds
      // exactly at the rail top while entries keep scrolling underneath.
      if (wlCard) {
        const over = Math.max(0, translate - wlCard.offsetTop);
        wlCard.style.transform = `translate3d(0, ${over}px, 0)`;
        wlCard.classList.toggle("is-pinned", over > 0);
      }
    };

    const schedule = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    const measure = () => {
      if (!active) return;
      const railHeight = rail.clientHeight;
      // Keep the waitlist tail below the rail fold while the strip is
      // untranslated: its top must sit at ≥ railHeight in strip coordinates.
      const currentLead = Number.parseFloat(wlPart.style.marginTop) || 0;
      const naturalTop = wlPart.offsetTop - currentLead;
      const lead = Math.max(24, Math.round(railHeight - naturalTop));
      if (Math.abs(lead - currentLead) > 1) {
        wlPart.style.marginTop = `${lead}px`;
      }
      // (v5.4-claude · BUGFIX 1.1/1.3) `.rail-wl-pin` is no longer part of
      // the strip (see the JSX above) — it's an always-on overlay pinned to
      // the rail's own top edge (CSS, absolute + opaque) once the waitlist
      // is showing, painting above whatever scrolls underneath it. Because
      // it only ever covers the TOP `pinHeight` px of the rail viewport, it
      // has no effect on the bottom clamp below: the strip still needs to
      // stop translating exactly when its own bottom edge reaches the
      // rail's bottom edge (unchanged formula) so the last entry lands
      // flush with no void beneath it — pinHeight does not enter this
      // calculation. This is also what makes bug 1.3 (the gap that used to
      // open up above the informer once brand/speakers scrolled out) simply
      // impossible now: the pin is never part of the flow it used to gap
      // above, it is glued to the rail's physical top edge at all times.
      maxTranslate = Math.max(0, strip.offsetHeight - railHeight);
      // (v5.4 · TASK 7) Was '[data-section="05"]' — the waitlist section is
      // now data-section="06" after the venue-plan/pricing split (see the
      // renumbering note above the venue-plan section). Same physical
      // boundary, new number.
      const boundary = document.querySelector<HTMLElement>('[data-section="07"]');
      const lastSection = document.querySelector<HTMLElement>(".faq-section");
      const scrollY = window.scrollY;
      if (boundary) {
        startY = scrollY + boundary.getBoundingClientRect().top - window.innerHeight;
      }
      if (lastSection) {
        const rect = lastSection.getBoundingClientRect();
        endY = scrollY + rect.top + rect.height - window.innerHeight;
      }
      if (!(endY > startY + 200)) {
        endY = startY + Math.max(1200, maxTranslate);
      }
      schedule();
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(rail);
    resizeObserver?.observe(strip);
    resizeObserver?.observe(wlPart);
    // Page length changes (interblock <details> opening, live waitlist load)
    // shift the startY/endY anchors — re-measure on any body resize.
    resizeObserver?.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    measure();

    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, [showWaitlist, waitlistEntries.length, identityInHeader]);

  return (
    <aside
      ref={railRef}
      className="sticky-rail"
      data-rail-stage={stage}
      data-identity-in-header={identityInHeader}
      data-speakers-visible={showSpeakers}
      aria-label="Live event summary"
    >
      {/* (v5.4-claude · BUGFIX 1.1/1.3 — pin promoted OUT of the transformed
          strip) The previous attempt kept `.rail-wl-pin` as a sibling of
          `.rail-wl-part` but BOTH were still children of `.rail-strip` — the
          very element the scroll effect below applies `translate3d(...)` to.
          A `translate3d` creates a brand-new stacking context on `.rail-
          strip`, and a z-index set on a descendant of that context can only
          out-rank OTHER descendants of the same context — it can never let
          the descendant paint above content that lives outside the
          transformed subtree, and (independently) it kept the pin subject
          to the strip's own top-of-flow position, which is what left a gap
          above it once brand/speakers were scrolled out (bug 1.3).
          Fix: `.rail-wl-pin` now lives here, as a direct child of `.sticky-
          rail` itself (never transformed) BEFORE `.rail-strip` in the DOM,
          absolutely positioned flush to the rail's own top edge (CSS) with
          a z-index above the strip. It no longer moves with the strip at
          all — entries scroll underneath a header that never leaves the
          top, which is also what "pinned" is supposed to mean. The strip's
          max scroll distance is compensated by the pin's measured height
          (see the scroll effect below) so entry #1 ends up flush under the
          pin with no gap and no overlap once the list is fully scrolled. */}
      <div className="rail-strip" ref={stripRef}>
      <div ref={identityRef} className="rail-identity" aria-label="Arena"><strong>ARENA</strong></div>
      <div ref={progressiveRef} className="rail-progressive" aria-live="polite">
        {showSpeakers && (
          <div className="rail-talks rail-talks-highlights" data-stage="0">
            <div className="rail-day">
              <a href="#talks" aria-label="See all speakers in On-site Talk Shows">
                <strong>Speakers</strong>
              </a>
            </div>
            <div className="rail-faces" key={speakerPairStart}>
              {railSpeakers.map((speaker) => (
                <RailSpeakerFace
                  key={speaker.name}
                  speaker={speaker}
                />
              ))}
            </div>
          </div>
        )}
        <div className="rail-progress-card stat-visitors" data-stage="1">
          <strong>{siteStats.visitors}+</strong><span>EXPECTED B2B VISITORS</span>
        </div>
        {showOffers && (
          <div className="rail-progress-card stat-offers" data-stage="3">
            <strong>{siteStats.offers}</strong><span>DEALS &amp; OFFERS</span>
          </div>
        )}
        {showExhibitors && (
          <div className="rail-progress-card stat-exhibitors" data-stage="2">
            <strong>{exhibitors}</strong><span>EXHIBITORS</span>
          </div>
        )}
      </div>
      {/* (v5.6.1 · owner #6) The count informer + JOIN button live back INSIDE
          the strip, right after the stats (below "172 EXHIBITORS"): they flow
          up with the strip on scroll and the scroll effect counter-transforms
          them to freeze at the rail top once they reach it — becoming the
          waitlist header while entries flow beneath. Opaque bg + z-index (CSS)
          keep them painting above the entries (no bug 1.1). */}
      {showWaitlist && (
        <div className="rail-wl-pin" data-stage="4" ref={wlCardRef}>
          <div className="rail-progress-card stat-waitlist">
            <strong>
              {waitlistCount}
            </strong>
            <span>
              IN WAITLIST
            </span>
          </div>
          <button type="button" className="button dark rail-wl-join" onClick={onJoinWaitlist}>
            Join waitlist
          </button>
        </div>
      )}
      {/* (v5.4 · TASK 5) Waitlist tail of the strip — at EVERY width now,
          including phones. This is the ONLY place the waitlist list ever
          renders on the page (see the note in the waitlist section itself).
          Sits below the rail fold via a JS-measured lead margin until the
          strip slides. */}
      <div className="rail-wl-part" ref={wlPartRef}>
        {/* (v5.6.1 · owner) No "queue" and no "sample" words in the waitlist —
            it is a waitlist, not a queue, and the sample caption is dropped.
            Entries flow directly beneath the pinned informer/button. */}
        <WaitlistRows entries={waitlistEntries} listClassName="rail-wl-list" />
      </div>
      </div>
    </aside>
  );
}

export default function Home() {
  const [audience, setAudience] = useState<Audience>("visitor");
  const [showSpeakers, setShowSpeakers] = useState(true);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<InsightArticle | null>(null);
  const [activeDay, setActiveDay] = useState("day-1");
  const [railStage, setRailStage] = useState<RailStage>(1);
  const [railVisibility, setRailVisibility] = useState({
    offers: false,
    exhibitors: false,
    waitlist: false,
    waitlistMode: false,
  });
  const [railIdentityInHeader, setRailIdentityInHeader] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(demoWaitlistCompanies);
  const [simUnsold, setSimUnsold] = useState(siteStats.trialSpots);
  const [showDev, setShowDev] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);
  const trialTariffRef = useRef<HTMLElement>(null);
  const waitlistTargetRef = useRef<HTMLSpanElement>(null);

  // (A)+(B) Dev chrome only behind ?dev=1; ?for=exhibitors / ?for=visitors are
  // the two shareable audience deep links (the two landing versions).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") setShowDev(true);
    const forParam = params.get("for");
    if (forParam === "exhibitors") setAudience("exhibitor");
    else if (forParam === "visitors") setAudience("visitor");
  }, []);

  const selectAudience = useCallback((next: Audience) => {
    setAudience(next);
    const url = new URL(window.location.href);
    url.searchParams.set("for", next === "exhibitor" ? "exhibitors" : "visitors");
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  const loadWaitlist = useCallback(async () => {
    try {
      const response = await fetch("/api/waitlist", { headers: { accept: "application/json" } });
      if (!response.ok) return;
      const result = await response.json() as unknown;
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      const values = Array.isArray(result)
        ? result
        : Array.isArray(record.entries)
          ? record.entries
          : Array.isArray(record.applications)
            ? record.applications
            : [];
      const liveEntries = values
        .map(normalizeWaitlistEntry)
        .filter((entry): entry is WaitlistEntry => Boolean(entry));
      if (!liveEntries.length) return;
      setWaitlistEntries((current) => {
        const demo = current.filter((entry) => entry.id.startsWith("demo-"));
        const ids = new Set(demo.map((entry) => entry.id));
        return [...demo, ...liveEntries.filter((entry) => !ids.has(entry.id))];
      });
    } catch {
      // Static demo entries remain visible if the private moderation API is unavailable.
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void loadWaitlist());
    return () => window.cancelAnimationFrame(frame);
  }, [loadWaitlist]);

  useEffect(() => {
    const updateRail = () => {
      const cursor = window.innerHeight * 0.34;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(".main-flow [data-rail-stage]"),
      );
      const currentStage = sections.reduce((stage, section) => {
        const value = Number(section.dataset.railStage) as RailStage;
        return section.getBoundingClientRect().top <= cursor
          ? Math.max(stage, value) as RailStage
          : stage;
      }, 1 as RailStage);
      setRailStage(currentStage);
      const reached = (section: string) => {
        const element = document.querySelector<HTMLElement>(`[data-section="${section}"]`);
        return Boolean(element && element.getBoundingClientRect().top <= cursor);
      };
      const section07El = document.querySelector<HTMLElement>('[data-section="07"]');
      const waitlistEntering = Boolean(
        section07El && section07El.getBoundingClientRect().top <= window.innerHeight * 0.98,
      );
      setRailVisibility({
        offers: reached("04"),
        exhibitors: reached("05"),
        // (#6 · owner) The pin now FLOWS up inside the strip and freezes at the
        // rail top, so it must exist from the moment the waitlist section (06)
        // ENTERS the viewport — appearing below "172 EXHIBITORS" and rising
        // with the scroll. reached("06") (34% cursor) fired too late: by then
        // the strip had already carried the pin above the top, so it popped in
        // already frozen. Still never as early as section 04 (venue plan).
        waitlist: waitlistEntering,
        // (v5.4 · TASK 7) Rail widening stays on the deeper reached("06").
        waitlistMode: reached("07"),
      });
    };
    updateRail();
    window.addEventListener("scroll", updateRail, { passive: true });
    window.addEventListener("resize", updateRail);
    return () => {
      window.removeEventListener("scroll", updateRail);
      window.removeEventListener("resize", updateRail);
    };
  }, []);

  // On phones the rail keeps its normal behaviour and the full waitlist
  // renders as a plain in-flow list inside section 05 instead.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobileViewport(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // data-wl-rail only widens the rail column (the kept 1.5× allowance on
  // narrow desktops) once the scroll crosses the 04→05 boundary; the strip
  // translation itself is continuous and lives inside StickyRail.
  const wlMode = railVisibility.waitlistMode && !isMobileViewport;

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    const inventory = inventoryRef.current;
    const trialTariff = trialTariffRef.current;
    const waitlistTarget = waitlistTargetRef.current;
    if (!inventory || !trialTariff || !waitlistTarget) return;

    let frame = 0;
    let active = true;

    const measureRoute = () => {
      frame = 0;
      if (!active) return;

      const inventoryRect = inventory.getBoundingClientRect();
      const trialRect = trialTariff.getBoundingClientRect();
      const targetRect = waitlistTarget.getBoundingClientRect();
      const startX = trialRect.left - inventoryRect.left + Math.min(28, trialRect.width * 0.12);
      const startY = trialRect.bottom - inventoryRect.top + 8;
      const endX = targetRect.left - inventoryRect.left;
      const endY = targetRect.top + targetRect.height / 2 - inventoryRect.top;
      const midY = startY + 18;
      const leftX = inventoryRect.width * 0.03;
      const width = Math.max(0, endX - leftX);
      const crossWidth = Math.max(0, startX - leftX);

      inventory.style.setProperty("--route-start-x", `${startX}px`);
      inventory.style.setProperty("--route-start-y", `${startY}px`);
      inventory.style.setProperty("--route-end-x", `${endX}px`);
      inventory.style.setProperty("--route-end-y", `${endY}px`);
      inventory.style.setProperty("--route-mid-y", `${midY}px`);
      inventory.style.setProperty("--route-left-x", `${leftX}px`);
      inventory.style.setProperty("--route-width", `${width}px`);
      inventory.style.setProperty("--route-cross-width", `${crossWidth}px`);
      setRouteReady(true);
    };

    const scheduleRouteMeasure = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(measureRoute);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleRouteMeasure);
    resizeObserver?.observe(inventory);
    resizeObserver?.observe(trialTariff);
    resizeObserver?.observe(waitlistTarget);
    window.addEventListener("resize", scheduleRouteMeasure);
    document.fonts?.ready.then(scheduleRouteMeasure);
    scheduleRouteMeasure();

    return () => {
      active = false;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleRouteMeasure);
    };
  }, []);

  const activeSpeakers = useMemo(
    () => speakers
      .filter((speaker) => speaker.day === activeDay)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [activeDay],
  );
  const leadchats = leadchatsCopy[audience];

  return (
    <main
      className={`site audience-${audience}`}
      data-rail-identity-in-header={railIdentityInHeader}
      data-wl-rail={wlMode}
    >
      <header className="site-header">
        {showDev && (
          <div className="dev-strip">
            <span>WORKING VERSION {VERSION}</span>
            <div>
              <span>Speakers</span>
              <button type="button" className={showSpeakers ? "is-active" : ""} onClick={() => setShowSpeakers(true)}>On</button>
              <button type="button" className={!showSpeakers ? "is-active" : ""} onClick={() => setShowSpeakers(false)}>Off</button>
            </div>
          </div>
        )}
        <div className="header-main">
          <a
            className={`brand header-rail-brand${railIdentityInHeader ? " is-complete" : ""}`}
            href="#top"
            aria-label="The Arena home"
          >
            <span>THE</span>
            {/* (v5.4-claude · BUGFIX 1.2) "ARENA" is now always in the DOM —
                CSS decides when it's shown. Previously this only rendered
                when `railIdentityInHeader` (a height-only trigger) was true,
                so on narrow-but-tall viewports the header was permanently
                stuck reading just the article "THE". CSS below shows it
                whenever `.is-complete` is set (unchanged wide/tall
                behaviour) AND unconditionally under the narrow-width
                breakpoint, so the brand never reads as a bare "THE". */}
            <strong>ARENA</strong>
          </a>
          <div className="header-content">
            <div className="header-event">
              <strong>21–22 SEP 2026</strong>
              <span>DUBAI MEDIA CITY</span>
            </div>
            <nav className="desktop-nav" aria-label="Main navigation">
              <a href="#offers">Offers</a>
              <a href="#spots">Spots</a>
              <a href="#talks">Talk Shows</a>
            </nav>
            <div className="audience-links header-audience-links" aria-label="Audience view">
              <button type="button" aria-label="For visitors" className={audience === "visitor" ? "is-current" : ""} onClick={() => selectAudience("visitor")}>
                <span className="audience-label-full">For visitors</span>
                <span className="audience-label-short">Visit</span>
                <small className="audience-detail-full">FREE</small>
                <small className="audience-detail-short">FREE</small>
              </button>
              <button type="button" aria-label="For exhibitors" className={audience === "exhibitor" ? "is-current" : ""} onClick={() => selectAudience("exhibitor")}>
                <span className="audience-label-full">For exhibitors</span>
                <span className="audience-label-short">Exhibit</span>
                <small className="audience-detail-full">FREE TRIAL</small>
                <small className="audience-detail-short">TRIAL</small>
              </button>
            </div>
          </div>
          <div className="header-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
            <div className="mobile-menu" id="site-menu" hidden={!menuOpen}>
              <p className="mobile-menu-version">VERSION {VERSION}</p>
              <nav aria-label="Mobile navigation">
                <a href="#offers" onClick={() => setMenuOpen(false)}>Offers</a>
                <a href="#spots" onClick={() => setMenuOpen(false)}>Spots</a>
                <a href="#talks" onClick={() => setMenuOpen(false)}>Talk Shows</a>
              </nav>
              <div className="audience-links mobile-audience-links" aria-label="Mobile audience view">
                <button
                  type="button"
                  aria-label="For visitors"
                  className={audience === "visitor" ? "is-current" : ""}
                  onClick={() => {
                    selectAudience("visitor");
                    setMenuOpen(false);
                  }}
                >
                  <span>For visitors</span>
                  <small>FREE</small>
                </button>
                <button
                  type="button"
                  aria-label="For exhibitors"
                  className={audience === "exhibitor" ? "is-current" : ""}
                  onClick={() => {
                    selectAudience("exhibitor");
                    setMenuOpen(false);
                  }}
                >
                  <span>For exhibitors</span>
                  <small>FREE TRIAL</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="page-shell" id="top">
        <div className="main-flow">
          <section className="event-section section-card" data-section="01" data-rail-stage="1">
            <div className="event-copy">
              <p className="eyebrow">BUSINESS SERVICES TRADE SHOW</p>
              <h1><span className="key-word">Trade Show</span> for <span className="key-word">services</span>, not goods</h1>
              <p className="section-value">
                {audience === "visitor"
                  ? "Meet the companies whose services attract customers, expand markets and automate operations."
                  : "Showcase what your company does — on a ready spot, with visitors matched to you before doors open."}
              </p>
              <p className="section-value hero-microline">
                Visit free · Try a spot free for one hour · Full day AED 3,000
              </p>
            </div>
            <HeroPreview audience={audience} />
          </section>

          <section className="event-days-section section-card" data-section="02" data-rail-stage="1">
            <div className="section-heading">
              <p className="eyebrow">TWO FOCUSED DAYS</p>
              <h2>Two days of <span className="key-word">services</span> for B2B companies</h2>
              <p>Each day brings together companies and conversations around one practical business move.</p>
            </div>
            <div className="event-days">
              {eventDays.map((day) => (
                <article key={day.id}>
                  <span>{day.date}</span>
                  <strong>{day.title}</strong>
                  {day.intro && <p className="day-intro">{day.intro}</p>}
                  <ul className="service-list">
                    {day.services.map((service) => <li key={service}>{service}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="reportage-section section-card" data-section="03" data-rail-stage="1" aria-labelledby="reportage-title">
            <div className="reportage-heading">
              <p className="eyebrow">LIVE REPORTAGE · ROTATING PHOTO &amp; VIDEO</p>
              <h2 id="reportage-title">Inside the <span className="key-word">Trade Show</span></h2>
            </div>
            <div className="reportage-frame-wrap">
              <iframe
                src="https://meyou.ru/gitex22/live?UTM=smi&header&footer&adv&tag"
                title="Rotating event photo and video reportage"
                width="100%"
                height="420"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
                scrolling="no"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </section>

          <InterblockDetails content={interblockFor("eventToOffers", audience)} />

          <div className="offer-sequence">
            <section className="offers-section section-card" id="offers" data-section="04" data-rail-stage="3">
              <div className="section-heading">
                <p className="eyebrow">LIVE ROTATION · DISCOUNTS · AUDITS · DEALS</p>
                <h2 className="offers-heading">Live <span className="key-word">Offers</span> from Service <span className="offers-title-lock">Companies</span></h2>
                <p>See a useful capability and one concrete offer before you decide who to meet.</p>
              </div>
              <div className="offers-section-statistics" aria-label="Live offer statistics">
                <div className="offers-count-card offers-count-card--section-stat rail-progress-card stat-offers" aria-label={`${siteStats.offers} offers`}>
                  <strong>{siteStats.offers}</strong>
                  <span>OFFERS</span>
                </div>
              </div>
              <MoleculeCarousel />
              <button type="button" className="show-my-offer" onClick={() => setModal("offer")}>Add my offer — free <Arrow /></button>
            </section>
          </div>

          <section className="leadchats-section section-card" id="leadchats" data-rail="none">
            <div className="section-heading">
              <p className="eyebrow">{leadchats.kicker}</p>
              <h2>
                {leadchats.headingBefore}
                <span className="key-word">introduces</span>
                {leadchats.headingAfter}
              </h2>
              <p>{leadchats.intro}</p>
            </div>
            <div className="interblock-grid leadchats-grid">
              {leadchats.steps.map(([label, text], index) => (
                <article key={label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <LeadchatPhones badge={leadchats.inboxBadge} productName={leadchats.productName} />
            <p className="leadchat-caption">{leadchats.caption}</p>
          </section>

          <InterblockDetails content={interblockFor("profileToSpot", audience)} />

          <div
            className="inventory-sequence"
            id="spots"
            ref={inventoryRef}
            data-route-ready={routeReady}
          >
            {/* (v5.4 · TASK 7) Venue plan and Pricing are now two sibling
                numbered sections instead of one combined "Showcase Spots"
                section. data-section renumbers 04 → venue plan (keeps "04":
                this is the exact same position the old combined section
                occupied, so `reached("04")` in the rail-visibility effect
                keeps firing at the same scroll point) and 05 → pricing (new).
                Everything after this point shifts by one: waitlist 05 → 06,
                talks 06 → 07, partners 07 → 08, faq 08 → 09 (see the effect
                below and the boundary query inside StickyRail, both updated
                to "06"). Both new sections keep data-rail-stage="2" — the
                rail's EXHIBITORS stat and the waitlist-count informer key off
                reaching stage 2 / section "04", which venue plan still is. */}
            <section className="venue-section section-card" data-section="05" data-rail-stage="2">
              <div className="section-heading">
                <p className="eyebrow">FULL-DAY ACCESS · {siteStats.paidSpots} OF {siteStats.totalSpots} SPOTS SOLD</p>
                <h2><span className="key-word">Venue</span> Plan</h2>
                <p>A 500 m² hall, 16 double-sided units, {siteStats.totalSpots} full-day spots.</p>
              </div>
              <div className="venue-plan-wrap">
                <div className="venue-spot-photo">
                  <SpotVisual audience={audience} />
                </div>
                <HallPlan simUnsold={simUnsold} onSimUnsoldChange={setSimUnsold} />
              </div>
            </section>

            <details className="interblock-details interblock-neutral second-wave-details">
              <summary aria-label="Help us expand this Arena. More details">
                <span className="interblock-summary-copy"><strong>Help us expand this Arena</strong></span>
                <span className="interblock-disclosure">
                  <strong className="fx-echo">
                    <span className="fx-echo-ghosts" aria-hidden="true"><span>More Details</span><span>More Details</span></span>
                    <span className="fx-echo-label">More Details</span>
                  </strong>
                  <span className="interblock-toggle" aria-hidden="true">+</span>
                </span>
              </summary>
              <div className="interblock-body second-wave-body">
                <div className="second-wave-copy">
                  <p className="eyebrow">CONDITIONAL CAPACITY · SAME EVENT DAYS</p>
                  <h3 id="second-wave-title">Early-bird sales may unlock more stations</h3>
                  <p>The same event days start with a venue plan for 10 stations. If early-bird revenue covers production, we may build 2, 4 or 6 more stations for those same dates. Each station has two spots, with eight timeslots per spot.</p>
                  <p className="second-wave-formula"><strong>+2 stations = +32 timeslots · +4 = +64 · +6 = +96.</strong></p>
                  <p>This is a capacity plan, not a confirmed promise.</p>
                  <div className="second-wave-capacity-options" aria-label="Possible additional capacity funded by early-bird sales">
                    <article className="second-wave-capacity-option"><strong>+2</strong><span>STATIONS · +32 TIMESLOTS</span></article>
                    <article className="second-wave-capacity-option"><strong>+4</strong><span>STATIONS · +64 TIMESLOTS</span></article>
                    <article className="second-wave-capacity-option"><strong>+6</strong><span>STATIONS · +96 TIMESLOTS</span></article>
                  </div>
                </div>
                <div className="second-wave-mass" aria-label="Conditional same-event capacity plan: 10 base stations with optional additions of 2, 4 or 6 stations">
                  <ArenaMassScene soldSpots={0} pairCount={10} />
                </div>
              </div>
            </details>

            <section className="pricing-section section-card" data-section="06" data-rail-stage="2">
              <div className="section-heading">
                <p className="eyebrow">CHOOSE YOUR ACCESS</p>
                <h2><span className="key-word">Pricing</span></h2>
                <p>Register free as a visitor, apply for a free one-hour trial timeslot, or reserve a guaranteed full-day showcase spot.</p>
              </div>
              <PricingPlans trialTariffRef={trialTariffRef} onOpenModal={setModal} />
            </section>

            <InterblockDetails content={interblockFor("spotToWaitlist", audience)} tone="neutral" open />

            <div className="trial-to-waitlist-route" aria-hidden="true">
              <span className="route-segment route-segment-start" />
              <span className="route-segment route-segment-cross" />
              <span className="route-segment route-segment-end" />
              <span className="route-segment route-segment-final" />
            </div>

            <section className="waitlist-section section-card" id="waitlist" data-section="07" data-rail-stage="4">
              <div className="section-heading">
                <p className="eyebrow">FREE TRIAL ACCESS · ALLOCATION NOT GUARANTEED</p>
                <h2><span id="waitlist-route-target" className="waitlist-route-target"><span className="waitlist-route-endpoint" ref={waitlistTargetRef} aria-hidden="true" /><span className="waitlist-route-letter">W</span>aitlist</span> for Free 1-hour Timeslots</h2>
                <p>Apply free for a timed trial at an unsold showcase spot. A timeslot is not guaranteed, and available capacity decreases whenever another full-day spot is purchased.</p>
              </div>
              {/* (v5.4 · TASK 5) The full waitlist list renders ONLY in the
                  left rail — at every width, including phones (see
                  StickyRail). No in-flow duplicate list or duplicate
                  count/CTA informer lives here any more; this is moderation
                  microcopy only. Use the rail's "Join waitlist" button
                  (always visible, even in the narrow mobile rail column) to
                  apply. */}
              <p className="wl-header-note wl-join-note">
                Not a draw: applications are moderated; timeslots are assigned by schedule fit and
                category balance. MADE PROMO — a company published an announcement and earned a
                second entry.
              </p>
            </section>
          </div>

          <div className="post-waitlist-layout">
            <div className="post-waitlist-main">
              <section className="talks-section section-card" id="talks" data-section="08" data-rail-stage="5">
            <div className="section-heading">
              <p className="eyebrow">LIVE AT THE EVENT · HIGHLIGHTS, NOT THE FULL LINE-UP</p>
              <h2>On-site Talk Shows</h2>
              <p>Live in the hall across both event days. Switch the day to navigate the on-site conference track.</p>
            </div>
            <div className="day-tabs" role="tablist" aria-label="On-site Talk Show days">
              {talkDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  aria-selected={activeDay === day.id}
                  className={activeDay === day.id ? "is-active" : ""}
                  onClick={() => setActiveDay(day.id)}
                >
                  <span>{day.date}</span>
                  <strong>{day.theme}</strong>
                </button>
              ))}
            </div>
            {showSpeakers ? (
              <div className="speaker-grid">
                {activeSpeakers.map((speaker) => (
                  <article className="speaker-card" key={speaker.name}>
                    <div className="speaker-photo">
                      <img src={speaker.image} alt={`Fictional demo speaker ${speaker.name}`} loading="lazy" />
                      <span>{speaker.time}</span>
                    </div>
                    <div className="speaker-copy">
                      <span>{speaker.company}{SAMPLE_DATA && <em className="sample-chip">SAMPLE</em>}</span>
                      <h3>{speaker.name}</h3>
                      <small>{speaker.role}</small>
                      <p>{speaker.topic}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="speakers-off">On-site conference highlights are hidden in this technical preview.</div>
            )}
              </section>

              <InterblockDetails content={interblockFor("talksToPartners", audience)} open />

              <section className="partners-section section-card" data-section="09" data-rail="none">
            <div className="section-heading">
              <p className="eyebrow">FROM THE FIRST ARENA VERSION</p>
              <h2>Partners & Media</h2>
            </div>
            <div className="partner-grid">
              {partnerCards.map((card, index) => (
                <img src={card} alt={`Partner ${index + 1}`} key={card} loading="lazy" />
              ))}
            </div>
              </section>

              <InterblockDetails content={interblockFor("partnersToFaq", audience)} tone="neutral" />

              {/* (v5.7 · T4) Joindubai essays carousel — transform-looped,
                  auto-spinning, hover/touch-paused, never a scrollport. */}
              <section className="insights-section section-card" id="insights" data-rail="none">
                <div className="section-heading">
                  <p className="eyebrow">FROM OUR LINKEDIN</p>
                  <h2>Why a trade show for <span className="key-word">services</span> matters</h2>
                </div>
                <InsightsCarousel onOpenArticle={(article) => {
                  setSelectedArticle(article);
                  setModal("article");
                }} />
              </section>

              <section className="faq-section section-card" id="faq" data-section="10" data-rail="none">
            <div className="section-heading">
              <p className="eyebrow">SHORT ANSWERS</p>
              <h2>FAQ</h2>
            </div>
            <div className="faq-list">
              {faqByAudience[audience].map((item) => (
                <details key={item.q}>
                  <summary>{item.q}<span>+</span></summary>
                  <p>{item.a}</p>
                </details>
              ))}
              <details>
                <summary>Where is The Arena?<span>+</span></summary>
                <p>Dubai Media City. Final arrival details come with registration.</p>
              </details>
            </div>
              </section>

              {/* (v5.7 · T4) Joindubai economy dossiers — the transferred
                  9:16 story-card structure and transform-only carousel. */}
              <section className="alignment-section section-card" id="alignment" data-rail="none">
                <div className="section-heading">
                  <p className="eyebrow">INVESTING IN DUBAI</p>
                  <h2>How we invest in and support the economy of <span className="key-word">Dubai &amp; the UAE</span></h2>
                  <p>Ten ways The Arena aligns with the emirate&apos;s strategies.</p>
                  <p className="alignment-subeyebrow">
                    GOVERNMENTAL &amp; ECONOMIC ALIGNMENT · ALIGNED WITH DUBAI’S STRATEGIES
                  </p>
                </div>
                <EconomyCarousel />
              </section>

            </div>
          </div>
        </div>

        <StickyRail
          stage={railStage}
          showSpeakers={showSpeakers}
          showOffers={railVisibility.offers}
          showExhibitors={railVisibility.exhibitors}
          showWaitlist={railVisibility.waitlist}
          identityInHeader={railIdentityInHeader}
          waitlistCount={waitlistEntries.length}
          waitlistEntries={waitlistEntries}
          onIdentityFitChange={setRailIdentityInHeader}
          onJoinWaitlist={() => setModal("waitlist")}
        />

      </div>

      <section className="trust-block" aria-label="Who is behind The Arena">
        <span className="eyebrow">WHO’S BEHIND</span>
        <div className="trust-grid">
          <img
            className="trust-photo"
            src="/founder.jpg"
            alt="Stepan Danilov, founder of The Arena"
            onError={(e) => {
              // Collapse the photo column too: hiding only the <img> made the
              // text auto-place into the empty 148px grid track, which read as
              // "squeezed into the rail column".
              const image = e.currentTarget as HTMLImageElement;
              image.closest(".trust-grid")?.classList.add("trust-grid-no-photo");
              image.style.display = "none";
            }}
          />
          <div>
            <p className="trust-lead">
              The Arena is a real hall, a real team and a real company — here is who answers for it.
            </p>
            <p>
              Built by <strong>MeYou Arena Events LLC</strong> — the Dubai event-tech company behind
              10 years of live-event technology. The GITEX live reportage on this page is our own
              production. Founder: <strong>Stepan Danilov</strong>.
            </p>
            <ul className="trust-facts">
              <li><span>Company</span><strong>MeYou Arena Events LLC</strong></li>
              <li><span>Office</span><strong>Latifa Tower, office 1417, Dubai</strong></li>
              <li><span>Trade license</span><strong>{"{license no. — publishing soon}"}</strong></li>
              <li><span>Contact</span><strong>ask@thearena.show</strong></li>
            </ul>
            <p className="trust-promise">
              <strong>Our promises, in writing:</strong> full refund on full-day spots until 7 Sep ·
              any spot is transferable to the next Arena, anytime · 25+ arranged introductions on a
              full day — or half your money back · we never sell or share your contact data.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div><strong>THE ARENA</strong><span>BUSINESS SERVICES TRADE SHOW · DUBAI</span></div>
        <div><span>21–22 SEP 2026</span><span>DUBAI MEDIA CITY</span></div>
        <div><a href="mailto:ask@thearena.show">ask@thearena.show</a><span>{VERSION}</span></div>
        {/* (v5.3 · TASK 3) Our projects — three categories of real external
            links inside the footer's main content zone (never in the rail). */}
        <div className="footer-projects" aria-label="Our projects">
          {footerProjects.map((group) => (
            <div className="footer-project-col" key={group.label}>
              <span className="footer-project-label">{group.label}</span>
              <p className="footer-project-links">
                {group.links.map((link, index) => (
                  <span key={link.href}>
                    {index > 0 && <i aria-hidden="true"> · </i>}
                    <a href={link.href} target="_blank" rel="noopener">{link.name}</a>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </footer>

      {modal && <Modal type={modal} article={selectedArticle} onClose={() => {
        setModal(null);
        setSelectedArticle(null);
      }} onWaitlistSubmitted={loadWaitlist} />}
    </main>
  );
}
