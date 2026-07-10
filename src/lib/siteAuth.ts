export const AUTH_COOKIE_NAME = "leekcup_auth";

export function isAdminSiteHost(host?: string | null) {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase();

  return hostname === "admin.leekcup.com" || hostname.startsWith("admin.");
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

function getLocalSiteMode() {
  const siteMode =
    process.env.SITE_MODE ?? process.env.NEXT_PUBLIC_SITE_MODE ?? "";

  return siteMode.trim().toLowerCase();
}

export function isPublicSiteHost(host?: string | null) {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase();

  return hostname === "leekcup.com" || hostname === "www.leekcup.com";
}

export function isAdminSite(host?: string | null) {
  if (isVercelRuntime()) {
    return isAdminSiteHost(host);
  }

  return getLocalSiteMode() === "admin";
}

export function canUseAdminFeatures(host?: string | null) {
  return isAdminSite(host);
}

export function getSiteUsername() {
  return process.env.SITE_USERNAME ?? process.env.SITE_USER ?? "";
}

export function getSitePassword() {
  return process.env.SITE_PASSWORD ?? "";
}

export function getAuthSecret() {
  return process.env.SITE_AUTH_SECRET ?? process.env.SITE_AUTH_TOKEN ?? "";
}

export function hasAuthConfig() {
  return Boolean(getSiteUsername() && getSitePassword() && getAuthSecret());
}

export function isValidAuthToken(token?: string | null) {
  const authSecret = getAuthSecret();

  return Boolean(authSecret && token && token === authSecret);
}

export function isAuthorizedSiteAdmin(
  host?: string | null,
  token?: string | null,
) {
  return isAdminSite(host) && isValidAuthToken(token);
}
