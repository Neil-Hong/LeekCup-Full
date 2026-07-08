export const AUTH_COOKIE_NAME = "leekcup_auth";

export function getSiteEnv() {
  const explicitEnv = process.env.ENV ?? process.env.SITE_ENV;

  if (explicitEnv) {
    return explicitEnv.trim().toUpperCase();
  }

  if (process.env.VERCEL_ENV === "production") {
    return "PROD";
  }

  return "DEV";
}

export function isProdSite() {
  return getSiteEnv() === "PROD";
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
