import React from "react";

interface BannerProps {
  children: React.ReactNode;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md ${className}`}
    >
      {children}
    </div>
  );
};
