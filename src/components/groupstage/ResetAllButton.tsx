"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetAllButton({
  className = "groupstage-actionButton",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const resetAll = async () => {
    if (isResetting) return;

    const confirmed = window.confirm(
      "此操作会重置分组，清空球队球员数据，并重置竞拍状态和过程，确认重置？",
    );

    if (!confirmed) {
      return;
    }

    setIsResetting(true);

    const responses = await Promise.all([
      fetch("/api/reset-all", {
        method: "POST",
      }),
      fetch("/api/auction/reset", {
        method: "POST",
      }),
    ]);
    const failedResponse = responses.find((response) => !response.ok);

    if (failedResponse) {
      const data = (await failedResponse.json().catch(() => null)) as {
        error?: string;
      } | null;
      window.alert(data?.error ?? "Failed to reset all data.");
      setIsResetting(false);
      return;
    }

    router.refresh();
    setIsResetting(false);
  };

  return (
    <button
      className={className}
      disabled={isResetting}
      onClick={resetAll}
      type="button"
    >
      <span>一键重置</span>
      <span>{isResetting ? "Resetting..." : "Reset All"}</span>
    </button>
  );
}
