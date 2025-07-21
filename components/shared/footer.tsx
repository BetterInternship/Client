"use client";

import { useRoute } from "@/hooks/use-route";
import { useAppContext } from "@/lib/ctx-app";

/**
 * Footer
 *
 * @component
 */
export const Footer = ({ content }: { content?: string }) => {
  const { isMobile: is_mobile } = useAppContext();
  const footer_routes = ["/login", "/register", "/otp", "/"];
  const { route_excluded } = useRoute();

  // If on mobile or on a page with no footer
  if (is_mobile || route_excluded(footer_routes)) {
    return <></>;
  }

  return (
    <div className="bg-transparent dark:bg-black px-8 py-8 opacity-70 dark:opacity-100 dark:border-t dark:border-gray-900/50">
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {content ?? (
            <>
              © 2025 BetterInternship. All rights reserved.{" "}
              <a
                href="/TermsConditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors duration-200"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/PrivacyPolicy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors duration-200"
              >
                Privacy Policy
              </a>
              .
            </>
          )}
        </p>
      </div>
    </div>
  );
};
