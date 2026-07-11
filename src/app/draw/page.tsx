import { headers } from "next/headers";
import DrawClient from "./DrawClient";
import { canUseAdminFeatures } from "@/lib/siteAuth";

export default async function DrawPage() {
  const headerStore = await headers();

  return (
    <DrawClient canConfirmGroups={canUseAdminFeatures(headerStore.get("host"))} />
  );
}
