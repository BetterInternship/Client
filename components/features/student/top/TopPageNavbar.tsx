"use client";

import {
  StudentNavigation,
  studentPublicLinks,
} from "../navigation/student-navigation";

/** Editorial adapter; desktop/mobile share the same prepared account controls. */
export function TopPageNavbar({ disabled = false }: { disabled?: boolean }) {
  return (
    <StudentNavigation
      preset="editorial"
      disabled={disabled}
      links={disabled ? [] : studentPublicLinks()}
    />
  );
}
