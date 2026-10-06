const IS_MAINTENANCE_MODE =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE?.toLowerCase() === "true";

const redirectToMaintenance = () => {
  if (
    typeof window === "undefined" ||
    window.location.pathname.startsWith("/maintenance")
  ) {
    return;
  }

  const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.sessionStorage.setItem("maintenanceReturnPath", returnPath);
  window.location.assign(`/maintenance?from=${encodeURIComponent(returnPath)}`);
};

export const redirectIfMaintenanceMode = () => {
  if (!IS_MAINTENANCE_MODE) return false;

  redirectToMaintenance();
  return true;
};
