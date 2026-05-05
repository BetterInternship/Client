"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "white",
      }}
    >
      <img
        src="/not-found.png"
        alt="Page not found"
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          objectFit: "contain",
        }}
      />
    </main>
  );
}
