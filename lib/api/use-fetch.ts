/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-06-17 18:04:08
 * @ Modified time: 2025-07-05 09:15:32
 * @ Description:
 *
 * Feature for abstracting fetches on component mount.
 */

// All responses from the BetterInternship API server will extend this interface
export interface FetchResponse {
  success?: boolean;
  message?: string;
  // Present on some failure responses so the client can distinguish a specific,
  // known failure reason from a generic one without string-matching `message`
  // (e.g. "notifications_required" — see jobs.controller.ts).
  code?: string;
}
