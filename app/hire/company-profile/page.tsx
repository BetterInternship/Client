"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * /company-profile is now the Company tab of /account (Docs/plans/
 * EMPLOYER_TEAM_ACCOUNTS_IMPLEMENTATION_PLAN.md D16). Kept as a redirect,
 * not deleted outright — the IOM link card deep-links here with ?linked=1
 * and ?iom_link_error=, so those params must survive the move.
 */
function CompanyProfileRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "company");
    router.replace(`/account?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function CompanyProfileRedirect() {
  return (
    <Suspense>
      <CompanyProfileRedirectContent />
    </Suspense>
  );
}
