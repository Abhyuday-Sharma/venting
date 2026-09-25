export const AUTHORIZED_ADMIN_EMAILS = [
  'mrsharmaabhyuday@gmail.com',
  'ventingmoderation@gmail.com',
  'ventingmoderagtion@gmail.com',
  'support@venting.in',
] as const;

export type AuthorizedAdminEmail = (typeof AUTHORIZED_ADMIN_EMAILS)[number];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return (AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase().trim());
}
