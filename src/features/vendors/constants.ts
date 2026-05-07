export const VENDOR_CATEGORIES = [
  "board_material",
  "lighting",
  "hardware",
  "stone",
  "laminate",
  "fabric",
  "paint",
  "accessories",
  "furniture",
  "other",
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const vendorCategoryLabels: Record<VendorCategory, string> = {
  board_material: "Board Material",
  lighting: "Lighting",
  hardware: "Hardware",
  stone: "Stone",
  laminate: "Laminate",
  fabric: "Fabric",
  paint: "Paint",
  accessories: "Accessories",
  furniture: "Furniture",
  other: "Other",
};
