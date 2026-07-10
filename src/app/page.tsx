import { cookies, headers } from "next/headers";
import LoginForm from "@/components/auth/LoginForm";
import HomeEntrance from "@/components/entrance/HomeEntrance";
import {
  AUTH_COOKIE_NAME,
  isAdminSite,
  isValidAuthToken,
} from "@/lib/siteAuth";

type HomeProps = {
  searchParams: Promise<{
    login?: string;
    next?: string;
  }>;
};

function getSafeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/entrance";
  }

  return nextPath;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const headerStore = await headers();

  if (!isAdminSite(headerStore.get("host"))) {
    return <HomeEntrance />;
  }

  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const shouldShowLogin = !isValidAuthToken(authToken);

  return (
    <>
      <HomeEntrance />
      {shouldShowLogin ? (
        <LoginForm nextPath={getSafeNextPath(params.next)} />
      ) : null}
    </>
  );
}
