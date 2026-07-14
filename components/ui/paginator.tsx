import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./button";

interface PaginatorProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const Paginator: React.FC<PaginatorProps> = ({
  totalItems,
  itemsPerPage,
  currentPage: controlledPage,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    if (!isControlled) setInternalPage(clamped);
    if (onPageChange) onPageChange(clamped);
  };

  const getDisplayedPages = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) {
      pages.push("ellipsis-left");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    // Always show last page if more than one
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant={"ghost"}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft></ChevronLeft>
      </Button>

      {getDisplayedPages().map((page, idx) =>
        typeof page === "number" ? (
          <Button
            key={idx}
            variant={currentPage === page ? "default" : "ghost"}
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            &hellip;
          </span>
        )
      )}

      <Button
        variant={"ghost"}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight></ChevronRight>
      </Button>
    </div>
  );
};
