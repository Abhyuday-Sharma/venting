/**
 * Public, non-secret site constants shared by pages, legal text and the footer.
 * Keep contact details and outbound links here so they are changed in one place.
 */

export const SITE_URL = "https://venting.in";

/**
 * Public contact address. This is the address already published on the
 * account-deletion page; confirm it is monitored before applying for AdSense.
 */
export const CONTACT_EMAIL = "support@venting.in";

export const SOCIAL_LINKS = {
  x: "https://x.com/ventingsupport?s=21",
  instagram: "https://www.instagram.com/venting.in?igsh=MWh2ZDljOGFzem96Ng%3D%3D&utm_source=qr",
} as const;

/** Links every public page footer offers, in display order. */
export const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/updates", label: "Updates" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/terms-of-service", label: "Terms" },
  { href: "/legal/notes", label: "Legal Notes" },
  { href: "/account-deletion", label: "Account Deletion" },
] as const;
