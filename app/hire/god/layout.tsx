"use client";

import TabsNav from "@/components/features/hire/god/TabsNav";
import { Loader } from "@/components/ui/loader";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthContext } from "../authctx";

export default function GodLayout({ children }: { children: ReactNode }) {
  const { god, godLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // The god pages are only for a signed-in god; everyone else goes to the
  // god login and comes back here afterwards.
  useEffect(() => {
    if (!godLoading && !god)
      router.replace(`/god-login?next=${encodeURIComponent(pathname)}`);
  }, [god, godLoading, pathname, router]);

  if (godLoading || !god) return <Loader>Checking your access...</Loader>;

  return (
    <div className="min-h-screen bg-slate-50">
      <TabsNav />
      {children}
    </div>
  );
}
