export interface TopCategoryArtworkAssets {
  primary: string;
  secondary: string;
}

/** Category-specific transparent illustrations, keyed by the public page slug. */
export const topCategoryArtworkBySlug: Record<
  string,
  TopCategoryArtworkAssets
> = {
  "accounting-finance": {
    primary: "/top/category-artwork/accounting.png",
    secondary: "/top/category-artwork/accounting2.png",
  },
  "creative-multimedia": {
    primary: "/top/category-artwork/creatives.png",
    secondary: "/top/category-artwork/creatives2.png",
  },
  "data-analytics": {
    primary: "/top/category-artwork/data.png",
    secondary: "/top/category-artwork/data2.png",
  },
  "engineering-architecture": {
    primary: "/top/category-artwork/archi.png",
    secondary: "/top/category-artwork/archi2.png",
  },
  it: {
    primary: "/top/category-artwork/it.png",
    secondary: "/top/category-artwork/it2.png",
  },
  legal: {
    primary: "/top/category-artwork/legal.png",
    secondary: "/top/category-artwork/legal2.png",
  },
  marketing: {
    primary: "/top/category-artwork/marketing.png",
    secondary: "/top/category-artwork/marketing2.png",
  },
  "operations-human-resources": {
    primary: "/top/category-artwork/hr.png",
    secondary: "/top/category-artwork/hr2.png",
  },
  software: {
    primary: "/top/category-artwork/software2.png",
    secondary: "/top/category-artwork/software.png",
  },
};
