type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const LEAD_STATUSES = [
  "new",
  "hot",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "negotiation",
  "converted",
  "lost",
  "cold",
] as const;

export const OPEN_FOLLOW_UP_LEAD_STATUSES = [
  "new",
  "hot",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "negotiation",
] as const satisfies readonly LeadStatus[];

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const leadStatusLabels = {
  new: "New",
  hot: "Hot",
  contacted: "Contacted",
  consultation_scheduled: "Consultation Scheduled",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
  cold: "Cold",
} satisfies Record<LeadStatus, string>;

export const leadStatusBadgeVariants = {
  new: "secondary",
  hot: "default",
  contacted: "outline",
  consultation_scheduled: "secondary",
  proposal_sent: "secondary",
  negotiation: "default",
  converted: "secondary",
  lost: "destructive",
  cold: "outline",
} satisfies Record<LeadStatus, BadgeVariant>;
