import { cookies } from "next/headers";
import LoginForm from "@/components/auth/LoginForm";
import HomeEntrance from "@/components/entrance/HomeEntrance";
import { AUTH_COOKIE_NAME, isProdSite, isValidAuthToken } from "@/lib/siteAuth";

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
  if (!isProdSite()) {
    return <HomeEntrance />;
  }

  const params = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const shouldShowLogin = params.login === "1" && !isValidAuthToken(authToken);

  return (
    <>
      <HomeEntrance />
      {shouldShowLogin ? <LoginForm nextPath={getSafeNextPath(params.next)} /> : null}
    </>
  );
}
