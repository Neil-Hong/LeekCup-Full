import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isAdminSite,
  isValidAuthToken,
} from "@/lib/siteAuth";

const PUBLIC_PATH_PREFIXES = [
  "/_next",
  "/api/auction",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/player-search",
  "/audio",
  "/fonts",
  "/images",
  "/video",
];

const PUBLIC_PATHS = new Set(["/", "/auction", "/favicon.ico"]);
const PUBLIC_ASSET_PATTERN =
  /\.(?:bin|gif|glb|gltf|ico|jpeg|jpg|json|mp3|mp4|ogg|otf|png|svg|ttf|webm|webp|woff|woff2)$/i;

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_ASSET_PATTERN.test(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function proxy(request: NextRequest) {
  if (!isAdminSite(request.headers.get("host"))) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isValidAuthToken(authToken)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("login", "1");
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
