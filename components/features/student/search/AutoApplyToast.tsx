"use client";

import { Toast } from "@/components/ui/toast";

export function AutoApplyToast({
  enabled,
  dismissed,
  onDismissForever,
}: {
  enabled: boolean; // profile.data?.auto_apply
  dismissed: boolean; // profile.data?.acknowledged_auto_apply
  onDismissForever: () => Promise<void>; // profile.update({ acknowledged_auto_apply: true })
}) {
  return (
    <Toast
      visible={enabled && !dismissed}
      title="Apply for Me is ON"
      description={
        <>
          We’ll automatically send your resume to matching companies. Only
          companies that fit your profile will see your resume. Manage it in{" "}
          <span className="font-medium">Profile</span>.
        </>
      }
      position="bottom-right"
      indicator="ping-dot"
      actions={[
        { type: "link", label: "Open Profile", href: "/profile" },
        {
          type: "button",
          label: "Don’t show again",
          onClick: onDismissForever,
        },
      ]}
    />
  );
}
