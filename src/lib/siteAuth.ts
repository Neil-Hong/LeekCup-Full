export const AUTH_COOKIE_NAME = "leekcup_auth";

export function isAdminSiteHost(host?: string | null) {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase();

  return hostname === "admin.leekcup.com" || hostname.startsWith("admin.");
}

export function isPublicSiteHost(host?: string | null) {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase();

  return hostname === "leekcup.com" || hostname === "www.leekcup.com";
}

function getConfiguredSiteMode() {
  const siteMode =
    process.env.SITE_MODE ??
    process.env.NEXT_PUBLIC_SITE_MODE ??
    process.env.ENV ??
    process.env.SITE_ENV ??
    "";

  return siteMode.trim().toLowerCase();
}

function isAdminModeFromEnv() {
  return getConfiguredSiteMode() === "admin";
}

export function isAdminSite(host?: string | null) {
  if (isPublicSiteHost(host)) {
    return false;
  }

  return isAdminSiteHost(host) || isAdminModeFromEnv();
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
