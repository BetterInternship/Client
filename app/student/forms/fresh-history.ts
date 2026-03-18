export const FRESH_FORMS_QUERY_PARAM = "freshForms";
export const FRESH_FORMS_STORAGE_KEY = "formsFreshHistoryCutoffMs";

export const getFreshHistoryCutoffMsFromStorage = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(FRESH_FORMS_STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const setFreshHistoryCutoffMsInStorage = (cutoffMs: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FRESH_FORMS_STORAGE_KEY, String(cutoffMs));
};

export const clearFreshHistoryCutoffMsInStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FRESH_FORMS_STORAGE_KEY);
};
