"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import {
  Search,
  Home,
  Monitor,
  HardHat,
  GraduationCap,
  Palette,
  Stethoscope,
  Scale,
  ChefHat,
  Building2,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/components/ui/use-mobile"
import JobScroller from "@/components/student/job-scroller"
import ProfileButton from "@/components/student/profile-button"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("All Job Types")
  const [locationFilter, setLocationFilter] = useState("Any location")
  const [activeFilter, setActiveFilter] = useState("");
  const router = useRouter()
  const justBetterRef = useRef<HTMLSpanElement>(null);
  const isMobile = useIsMobile();

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.set('q', searchTerm)
    }
    if (jobTypeFilter !== "All Job Types") {
      params.set('jobType', jobTypeFilter)
    }
    if (locationFilter !== "Any location") {
      params.set('location', locationFilter)
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white pb-20 flex flex-col">
        {/* Clean Apple-style header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white">
          <h1 className="text-lg font-semibold text-black">BetterInternship</h1>
          <ProfileButton />
        </header>

        {/* Main content - centered and balanced */}
        <div className="flex-1 flex flex-col justify-center px-6">
          {/* Balanced Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-black leading-tight mb-4">
              Better Internships
            </h1>
            <h1 className="text-5xl font-black text-black leading-tight mb-8">
              Start Here.
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              By students, for students. Not official. Just better.
            </p>
          </div>

          {/* Enhanced search with filters */}
          <div className="w-full max-w-lg mx-auto">
            {/* Main search */}
            <div className="relative mb-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What's your dream internship?"
                className="w-full h-16 text-xl bg-white border-2 border-gray-200 rounded-2xl px-6 pr-16 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400 shadow-sm focus:shadow-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer" onClick={handleSearch}>
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            {/* Compact filter row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <FilterDropdown
                  name="jobType"
                  options={["Internships", "Full-time", "Part-time", "All Job Types"]}
                  value={jobTypeFilter}
                  activeFilter={activeFilter}
                  onChange={setJobTypeFilter}
                  onClick={() => setActiveFilter("jobType")}
                />
              </div>
              <div className="flex-1">
                <FilterDropdown
                  name="location"
                  options={["Remote", "On-site", "Hybrid", "Any location"]}
                  value={locationFilter}
                  activeFilter={activeFilter}
                  onChange={setLocationFilter}
                  onClick={() => setActiveFilter("location")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="flex h-full">
        {/* Left Sidebar - Full height */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <Link href="/" className="block">
              <h1 className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">BetterInternship</h1>
            </Link>

            <Link
              href="/search?category=all&jobType=All Job Types&location=Any location"
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Browse All</span>
            </Link>

            <div className="pt-4 border-t border-gray-200">
              <h2 className="font-semibold mb-4 text-gray-800">All Categories</h2>
              <div className="space-y-2">
                <CategoryLink icon={<Monitor className="h-5 w-5" />} label="Technology & Dev." category="Technology & Development" />
                <CategoryLink icon={<HardHat className="h-5 w-5" />} label="Engineering" category="Engineering" />
                <CategoryLink icon={<GraduationCap className="h-5 w-5" />} label="Education and Psychology" category="Education & Psychology" />
                <CategoryLink icon={<Palette className="h-5 w-5" />} label="Design and Arts" category="Design & Arts" />
                <CategoryLink icon={<Stethoscope className="h-5 w-5" />} label="Medical" category="Medical" />
                <CategoryLink icon={<Scale className="h-5 w-5" />} label="Law" category="Law" />
                <CategoryLink icon={<ChefHat className="h-5 w-5" />} label="Culinary Arts" category="Culinary Arts" />
                <CategoryLink icon={<Building2 className="h-5 w-5" />} label="Banking and Finance" category="Banking & Finance" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar with Profile button */}
          <div className="flex justify-end p-4">
            <ProfileButton />
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center px-12">
            {/* Hero Text - Centered vertically */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
                Better Internships Start Here.
              </h1>
              <div onMouseOver={() => {
                console.log(justBetterRef.current?.style.scale)
                if (justBetterRef.current) {
                  justBetterRef.current.style.transform = 'scale(1, 1)';
                  justBetterRef.current.style.width = '100px';
                }
              }} onMouseLeave={() => {
                if (justBetterRef.current) {
                  justBetterRef.current.style.transform = 'scale(0, 1)';
                  justBetterRef.current.style.width = '0px';
                }
              }}>
                <div className="group flex flex-row justify-center">
                  <div className="inline-block relative text-xl text-gray-600 m-0 translate-x-[10%] group-hover:translate-x-0 transition-transform duration-300 ease-in-out">
                    By DLSU students, for DLSU students. Not official. 
                  </div>
                  <div className="inline-block relative text-xl text-gray-600 overflow-hidden ">
                    <span className="invisible m-0">Just Better...</span>
                    <div className="absolute top-0 left-0 text-xl h-full w-full flex items-center justify-center opacity-0
                                    transform -translate-x-full transition-all duration-300 ease-in-out
                                    group-hover:translate-x-0 group-hover:opacity-100">
                      Just better.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mb-8">
              <div className="flex items-stretch gap-3 p-3 border rounded-lg bg-white shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Job Title, keywords, Company"
                    className="pl-10 w-full h-12 bg-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <FilterDropdown
                  name="jobType"
                  options={["Internships", "Full-time", "Part-time", "All Job Types"]}
                  value={jobTypeFilter}
                  activeFilter={activeFilter}
                  onChange={setJobTypeFilter}
                  onClick={() => { setActiveFilter("jobType") }}
                />
                <span className="text-gray-300">|</span>
                <FilterDropdown
                  name="location"
                  options={["Face to Face", "Remote", "Hybrid", "Any location"]}
                  value={locationFilter}
                  activeFilter={activeFilter}
                  onChange={setLocationFilter}
                  onClick={() => { setActiveFilter("location") }}
                />
                  <Button onClick={handleSearch} className="h-12 px-6">
                    Find Jobs
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Suggestions */}
            <div className="w-full max-w-4xl">
              <JobScroller />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 text-center text-sm text-gray-500 border-t">
            Are you an Employer? Send us an Email:{" "}
            <a href="mailto:hello@betterinternship.com" className="text-blue-600 hover:underline">
              hello@betterinternship.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterDropdown({ name, options, value, onChange, activeFilter, onClick }: { name: string; options: string[]; value: string; onChange: (value: string) => void, activeFilter: string, onClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile();

  useEffect(() => {
    if (name != activeFilter)
      setIsOpen(false);
  }, [name, activeFilter])
  
  if (isMobile) {
    // Mobile-optimized version
    return (
      <div className="relative">
        <Button
          variant="outline" 
          onClick={() => (setIsOpen(!isOpen), onClick())}
          className="w-full h-12 px-4 justify-between bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 font-medium rounded-xl"
        >
          <span className="truncate text-sm">{value}</span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isOpen && (
          <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Desktop version
  return (
    <div className="relative">
      <Button
        variant="outline" 
        onClick={() => (setIsOpen(!isOpen), onClick())}
        className="h-12 px-4 flex items-center gap-2"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-full">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AppleCategoryCard({ icon, label, category }: { icon: string; label: string; category: string }) {
  return (
    <Link href={`/search?category=${encodeURIComponent(category)}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
        <div className="flex items-center gap-4">
          {/* Simple emoji icon */}
          <div className="w-10 h-10 flex items-center justify-center text-2xl">
            {icon}
          </div>
          
          {/* Text content - Apple style */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-black">
              {label}
            </h3>
          </div>
          
          {/* Simple arrow */}
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Keep the old CategoryCard for any remaining references
function CategoryCard({ icon, label, category, color }: { icon: string; label: string; category: string; color: string }) {
  return (
    <Link href={`/search?category=${encodeURIComponent(category)}`}>
      <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        <div className="relative p-6 flex items-center gap-4">
          {/* Icon container with gradient background */}
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
            {icon}
          </div>
          
          {/* Text content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Explore opportunities</p>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryLink({ icon, label, category }: { icon: React.ReactNode | null; label: string; category: string }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    // This won't be used anymore - CategoryCard handles mobile
    return null;
  }
  
  // Desktop version with icons
  return (
    <Link
      href={`/search?category=${encodeURIComponent(category)}`}
      className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-3 rounded-md hover:bg-gray-100 transition-colors"
    >
      <div className="border rounded-full bg-white flex-shrink-0 p-2">{icon}</div>
      <span className="truncate">{label}</span>
    </Link>
  )
}
