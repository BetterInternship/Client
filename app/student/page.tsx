"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobScroller from "@/app/student/landing/job-scroller";
import MobileJobScroller from "@/app/student/landing/mobile-job-scroller";
import {
  DropdownGroup,
  GroupableRadioDropdown,
} from "@/components/ui/dropdown";
import { useFilter } from "@/lib/filter";
import { useAppContext } from "@/lib/ctx-app";
import { industriesOptions, allCategories, categoryGroups } from "@/lib/utils/job-options";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { filters, set_filter, filter_setter } = useFilter<{
    industry: string;
    category: string;
  }>();

  // Set default values on mount if not already set
  useEffect(() => {
    if (!filters.industry) {
      set_filter("industry", "All Industries");
    }
    if (!filters.category) {
      set_filter("category", "All categories");
    }
  }, [filters.industry, filters.category, set_filter]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const { is_mobile } = useAppContext();
  const router = useRouter();
  const justBetterRef = useRef<HTMLSpanElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const { industry, category } = filters;

    if (searchTerm.trim()) {
      params.set("q", searchTerm);
    }
    if (industry && industry !== "All Industries") {
      params.set("industry", industry);
    }
    if (category && category !== "All categories") {
      params.set("category", category);
    }
    router.push(`/search?${params.toString()}`);
  };

  // Helper to apply filter and go to job listings
  const applyFilterAndGo = (type: "industry" | "category", value: string) => {
    set_filter(type, value);
    setTimeout(() => {
      const params = new URLSearchParams();
      const newFilters = { ...filters, [type]: value };
      if (searchTerm.trim()) {
        params.set("q", searchTerm);
      }
      if (newFilters.industry && newFilters.industry !== "All Industries") {
        params.set("industry", newFilters.industry);
      }
      if (newFilters.category && newFilters.category !== "All categories") {
        params.set("category", newFilters.category);
      }
      router.push(`/search?${params.toString()}`);
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div
        className={`flex-1 flex flex-col justify-center items-center ${
          is_mobile ? "px-6 py-8 pb-32" : "px-6 lg:px-12 py-8"
        }`}
      >
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1
            className={`font-display font-bold text-gray-900 leading-tight mb-3 ${
              is_mobile
                ? "text-4xl tracking-tight"
                : "text-3xl sm:text-4xl lg:text-6xl"
            }`}
          >
            Better Internships Start Here.
          </h1>
          {!is_mobile && (
            <div
              onMouseOver={() => {
                console.log(justBetterRef.current?.style.scale);
                if (justBetterRef.current) {
                  justBetterRef.current.style.transform = "scale(1, 1)";
                  justBetterRef.current.style.width = "100px";
                }
              }}
              onMouseLeave={() => {
                if (justBetterRef.current) {
                  justBetterRef.current.style.transform = "scale(0, 1)";
                  justBetterRef.current.style.width = "0px";
                }
              }}
            >
              <div className="group flex flex-row justify-center">
                <div className="inline-block relative text-base sm:text-lg lg:text-xl text-gray-600 m-0 translate-x-[10%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out">
                  By DLSU students, for DLSU students. Not official.
                </div>
                <div className="inline-block relative text-base sm:text-lg lg:text-xl text-gray-600 overflow-hidden ">
                  <span className="invisible m-0">Just Better...</span>
                  <div
                    className="absolute top-0 left-0 text-base sm:text-lg lg:text-xl h-full w-full flex items-center justify-center opacity-0
                                    transform -translate-x-full transition-all duration-300 ease-in-out
                                    group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    Just Better.
                  </div>
                </div>
              </div>
            </div>
          )}
          {is_mobile && (
            <p className="text-lg text-gray-500 font-medium">
              By DLSU students, for DLSU students. Not official. Just Better.
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-5xl">
          {is_mobile ? (
            /* Mobile Search Layout - Clean Apple Style */
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Job Title, keywords, Company"
                  className="pl-12 pr-4 w-full h-14 bg-white border-0 rounded-2xl shadow-sm text-gray-900 placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-200"
                />
              </div>

              {/* Filter Row */}
              <DropdownGroup>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Button
                      onClick={() => setShowIndustryModal(true)}
                      className="h-12 px-4 flex items-center gap-2 w-full justify-between text-left bg-transparent border-none shadow-none rounded-none font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <span className="truncate">{filters.industry || "All Industries"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Button
                      onClick={() => setShowCategoryModal(true)}
                      className="h-12 px-4 flex items-center gap-2 w-full justify-between text-left bg-transparent border-none shadow-none rounded-none font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <span className="truncate">{filters.category || "All categories"}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </DropdownGroup>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl font-semibold text-base shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Find Jobs
              </Button>
            </div>
          ) : (
            /* Desktop Search Layout - Clean Single Line */
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-2 py-2">
                <div className="flex items-center h-14">
                  {/* Search Input */}
                  <div className="flex items-center flex-1 pl-4 pr-2">
                    <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Job title, keywords, or company"
                      className="w-full py-3 bg-transparent border-0 outline-none text-gray-900 placeholder:text-gray-500 text-base"
                    />
                  </div>

                  {/* Filter Dropdowns with Dividers */}
                  <div className="flex items-center">
                    <div className="h-8 w-px bg-gray-300 mx-1" />
                    <DropdownGroup>
                      <div className="w-36">
                        <Button
                          onClick={() => setShowIndustryModal(true)}
                          className="h-14 px-4 flex items-center gap-2 w-full justify-between text-left bg-transparent border-none shadow-none rounded-none font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                        >
                          <span className="truncate text-sm">{filters.industry || "All Industries"}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                      <div className="h-8 w-px bg-gray-300 mx-1" />
                      <div className="w-40">
                        <Button
                          onClick={() => setShowCategoryModal(true)}
                          className="h-14 px-4 flex items-center gap-2 w-full justify-between text-left bg-transparent border-none shadow-none rounded-none font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                        >
                          <span className="truncate text-sm">{filters.category || "All categories"}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </DropdownGroup>
                  </div>

                  {/* Search Button */}
                  <div className="pl-4 pr-2">
                    <Button
                      onClick={handleSearch}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 whitespace-nowrap text-base shadow-none border-0"
                    >
                      Find jobs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Job Suggestions - Mobile specific layout */}
        {is_mobile && (
          <div className="w-full mt-8 px-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                Popular Jobs
              </h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Tap to search
              </p>
            </div>
            <MobileJobScroller />
          </div>
        )}

        {/* Desktop Job Suggestions - Only show on desktop */}
        {!is_mobile && (
          <div className="w-full max-w-4xl mt-8">
            <JobScroller />
          </div>
        )}
      </div>

      {/* Category Modal - Both Mobile and Desktop */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm mx-auto p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-x-hidden overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Category
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="overflow-y-auto overflow-x-hidden flex-1 space-y-4">
              {/* All Categories Option */}
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  applyFilterAndGo("category", "All categories");
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-150 text-sm font-medium ${
                  filters.category === "All categories"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                All categories
              </button>

              {/* Tech Category Group */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tech
                  </h4>
                </div>
                {categoryGroups.Tech.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setShowCategoryModal(false);
                      applyFilterAndGo("category", option);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ml-2 break-words ${
                      filters.category === option
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="block truncate">{option}</span>
                  </button>
                ))}
              </div>

              {/* Non-Tech Category Group */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Non-Tech
                  </h4>
                </div>
                {categoryGroups["Non-Tech"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setShowCategoryModal(false);
                      applyFilterAndGo("category", option);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ml-2 break-words ${
                      filters.category === option
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="block truncate">{option}</span>
                  </button>
                ))}
              </div>

              {/* Specialized Category Group */}
              <div className="space-y-2">
                <div className="px-2 py-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Specialized
                  </h4>
                </div>
                {categoryGroups.Specialized.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setShowCategoryModal(false);
                      applyFilterAndGo("category", option);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ml-2 break-words ${
                      filters.category === option
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span className="block truncate">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Industry Modal - Both Mobile and Desktop */}
      {showIndustryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowIndustryModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm mx-auto p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-gray-900">
                Select Industry
              </h3>
              <button
                onClick={() => setShowIndustryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1">
              {industriesOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setShowIndustryModal(false);
                    applyFilterAndGo("industry", option);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors duration-150 text-sm font-medium ${
                    filters.industry === option
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
