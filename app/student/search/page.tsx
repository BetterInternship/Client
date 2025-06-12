"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  MapPin,
  Clock,
  PhilippinePeso,
  Briefcase,
  ChevronDown,
  X,
  Building,
  Calendar,
  Users,
  Heart,
  Send,
  CheckCircle,
  Clipboard,
  Wifi,
  Globe,
  Users2,
  AlertTriangle,
  User,
  Filter
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ProfileButton from "@/components/student/profile-button"
import { useJobs, useJobActions, useSavedJobs, useProfile } from "@/hooks/use-api"
import { useAuthContext } from "../authctx"
import { Application, Job } from "@/lib/db/db.types"
import Markdown from 'react-markdown'
import { Paginator } from "@/components/ui/paginator"
import { useRefs, RefsAPI } from "@/lib/db/use-refs"

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const refs = useRefs();
  const { is_authenticated } = useAuthContext()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [jobTypeFilter, setJobTypeFilter] = useState("All types")
  const [locationFilter, setLocationFilter] = useState("Any location")
  const [industryFilter, setIndustryFilter] = useState("All industries")
  const [tempJobTypeFilter, setTempJobTypeFilter] = useState("All types")
  const [tempLocationFilter, setTempLocationFilter] = useState("Any location")
  const [tempIndustryFilter, setTempIndustryFilter] = useState("All industries")
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [lastApplication, setLastApplication] = useState<Partial<Application>>({})
  const [applying, setApplying] = useState(false)
  const [autoCloseProgress, setAutoCloseProgress] = useState(100)
  const { profile } = useProfile();

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false
    return !!(profile.fullName && profile.phoneNumber && profile.currentProgram && profile.idNumber)
  }

  const getMissingFields = () => {
    if (!profile) return []
    const missing = []
    if (!profile.fullName) missing.push('Full Name')
    if (!profile.phoneNumber) missing.push('Phone Number')
    if (!profile.currentProgram) missing.push('Current Program')
    if (!profile.idNumber) missing.push('ID Number')
    return missing
  }

  // Check if job-specific requirements are met
  const areJobRequirementsMet = () => {
    if (!selectedJob || !profile) return false
    
    let requirementsMet = true
    if (selectedJob.requiresGithub && (!profile.githubLink || profile.githubLink.trim() === '')) requirementsMet = false
    if (selectedJob.requiresPortfolio && (!profile.portfolioLink || profile.portfolioLink.trim() === '')) requirementsMet = false
    
    return requirementsMet
  }

  const getMissingJobRequirements = () => {
    if (!selectedJob || !profile) return []
    const missing = []
    if (selectedJob.requiresGithub && (!profile.githubLink || profile.githubLink.trim() === '')) missing.push('GitHub Link')
    if (selectedJob.requiresPortfolio && (!profile.portfolioLink || profile.portfolioLink.trim() === '')) missing.push('Portfolio Link')
    return missing
  }

  const isFullyReadyToApply = () => {
    return isProfileComplete() && areJobRequirementsMet()
  }

  // API hooks
  const jobs_page_size = 10;
  const [jobs_page, setJobsPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const { getJobsPage, jobs: allJobs, loading: jobs_loading, error: jobs_error, refetch } = useJobs({
    search: searchTerm.trim() || undefined,
    category: selectedCategory || undefined,
    type: jobTypeFilter !== "All types" ? jobTypeFilter : undefined,
    mode: locationFilter !== "Any location" ? locationFilter : undefined,
    industry: industryFilter !== "All industries" ? industryFilter : undefined,
    limit: jobs_page_size,
    page: jobs_page,
  })

  useEffect(() => {
    setJobs(getJobsPage({ page: jobs_page, limit: jobs_page_size }))
  }, [ jobs_page, jobs_loading ])

  const { is_saved, saving, save_job } = useSavedJobs();
  const { 
    applyToJob,  
    getApplicationStatus 
  } = useJobActions()

  useEffect(() => {
    const query = searchParams.get('q') || ""
    setSearchTerm(query)
  }, [searchParams])

  useEffect(() => {
    const jobId = searchParams.get('jobId')
    if (jobId && jobs.length > 0) {
      const targetJob = jobs.find(job => job.id === jobId)
      if (targetJob) {
        setSelectedJob(targetJob)
      }
    } else if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0])
    }
  }, [])

  useEffect(() => {
    const jobId = searchParams.get('jobId')
    const category = searchParams.get('category')
    const jobType = searchParams.get('jobType')
    const location = searchParams.get('location')
    setSelectedCategory(category)
    
    // Set filters from URL params only if not already set
    if (jobType && jobTypeFilter === "All types") {
      setJobTypeFilter(jobType)
    }
    if (location && locationFilter === "Any location") {
      setLocationFilter(location)
    }
  }, [searchParams, jobs])

  // Set first job as selected when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0])
    }
  }, [jobs, selectedJob])

  // Initialize temp filters when modal opens
  useEffect(() => {
    if (showFilterModal) {
      setTempJobTypeFilter(jobTypeFilter)
      setTempLocationFilter(locationFilter)
      setTempIndustryFilter(industryFilter)
    }
  }, [showFilterModal, jobTypeFilter, locationFilter, industryFilter])

  // Reset progress when modal closes
  useEffect(() => {
    if (!showSuccessModal) {
      setAutoCloseProgress(100)
    }
  }, [showSuccessModal])

  const handleSearch = () => {
    // Apply temp filters to actual filters
    setJobTypeFilter(tempJobTypeFilter)
    setLocationFilter(tempLocationFilter)
    setIndustryFilter(tempIndustryFilter)
    
    // No need to refetch - filtering happens automatically via useJobs hook
  }

  const handleSave = async (job: Job) => {
    if (!is_authenticated()) {
      window.location.href = '/login'
      return
    }

    try {
      await save_job(job.id ?? "")
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  const handleApply = () => {

    if (!is_authenticated()) {
      window.location.href = '/login'
      return
    }

    // Check if already applied
    const applicationStatus = getApplicationStatus(selectedJob?.id || '')
    if (applicationStatus) {
      alert('You have already applied to this job!')
      return
    }

    // Check if profile is complete
    if (!isProfileComplete()) {
      alert('Please complete your profile before applying.')
      router.push('/profile')
      return
    }

    // Check if job requirements are met
    if (!areJobRequirementsMet()) {
      setShowApplicationModal(true)
      return
    }

    // If everything is complete, apply directly
    handleDirectApplication()
  }

  const handleDirectApplication = async () => {
    if (!selectedJob) return

    try {
      setApplying(true)
      const application = await applyToJob(selectedJob.id, {
        coverLetter: undefined,
        githubLink: profile?.githubLink || undefined,
        portfolioLink: profile?.portfolioLink || undefined,
      })
      
      // Store application details and show success modal
      setLastApplication(application.application || {})
      setShowSuccessModal(true)
      setAutoCloseProgress(100)
      
      // Progress countdown animation
      const interval = setInterval(() => {
        setAutoCloseProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval)
            setShowSuccessModal(false)
            return 0
          }
          return prev - 2 // Decrease by 2% every 100ms (5 seconds total)
        })
      }, 100)
      
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Apply current search term along with active filters
      // The useJobs hook will automatically filter based on both search and filters
      e.currentTarget.blur()
      setJobsPage(1);
      setJobs(getJobsPage({ page: 1, limit: jobs_page_size }))
    }
  }

  if (jobs_error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load jobs: {jobs_error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <Link href="/" className="block">
              <h1 className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">BetterInternship</h1>
            </Link>

            <Link
              href="/search?category=all&jobType=All types&location=Any location"
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
                <CategoryLink icon={<GraduationCap className="h-5 w-5" />} label="Education & Psychology" category="Education & Psychology" />
                <CategoryLink icon={<Palette className="h-5 w-5" />} label="Design & Arts" category="Design & Arts" />
                <CategoryLink icon={<Stethoscope className="h-5 w-5" />} label="Medical" category="Medical" />
                <CategoryLink icon={<Scale className="h-5 w-5" />} label="Law" category="Law" />
                <CategoryLink icon={<ChefHat className="h-5 w-5" />} label="Culinary Arts" category="Culinary Arts" />
                <CategoryLink icon={<Building2 className="h-5 w-5" />} label="Banking & Finance" category="Banking & Finance" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar with Profile button */}
          <div className="flex justify-end p-4 bg-white border-b">
            <ProfileButton />
          </div>

          {/* Search Results */}
          <div className="flex-1 flex overflow-hidden">
            {jobs_loading ? (
              /* Loading State */
              <div className="w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Job List */}
                <div className="w-1/3 border-r overflow-y-auto p-4">
                  {/* Compact Search Bar */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          // No need for setTimeout anymore - filtering is instant
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Search listings..."
                        className="pl-10 w-full h-10 bg-white border border-gray-300 rounded-lg"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFilterModal(true)}
                      className="h-10 px-3 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  { jobs.length ?
                    (<div className="space-y-4">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSelected={selectedJob?.id === job.id}
                          onClick={() => setSelectedJob(job)}
                          refs={refs}
                        />
                      ))}
                    </div>) : (<div>
                      <p className="p-4">No jobs found.</p>  
                    </div>)
                  }

                  {/* Paginator */}
                  <Paginator totalItems={allJobs.length} itemsPerPage={jobs_page_size} onPageChange={(page) => setJobsPage(page)}></Paginator>
                </div>

                {/* Job Details */}
                <div className="w-2/3 flex flex-col overflow-hidden">
                  {selectedJob && (
                    <JobDetails 
                      job={selectedJob} 
                      saving={saving}
                      onApply={handleApply} 
                      onSave={handleSave}
                      isSaved={is_saved(selectedJob.id ?? '')}
                      applicationStatus={getApplicationStatus(selectedJob.id ?? '')}
                      refs={refs}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal - Only for Missing Job Requirements */}
      <AnimatePresence>
        {showApplicationModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg w-11/12 max-w-md p-6"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Apply to {selectedJob?.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApplicationModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Missing Job Requirements Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-800 mb-2">Missing Job Requirements</h3>
                    <p className="text-sm text-orange-700 mb-3">
                      This job requires additional profile information:
                    </p>
                    <ul className="text-sm text-orange-700 list-disc list-inside mb-4">
                      {getMissingJobRequirements().map((field, index) => (
                        <li key={index}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Update Profile Button */}
              <Button
                onClick={() => {
                  setShowApplicationModal(false)
                  router.push('/profile')
                }}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-2xl w-11/12 max-w-md mx-4 shadow-2xl overflow-hidden"
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div className="flex justify-between items-center p-6 pb-0">
                <div></div>
                <motion.button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowSuccessModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 text-center">
                {/* Success Animation */}
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, type: "spring", bounce: 0.5 }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                  </motion.div>

                  <motion.h2 
                    className="text-2xl font-bold text-gray-800 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    Application Sent!
                  </motion.h2>
                  
                  <motion.p 
                    className="text-gray-600 mb-6 leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    Your application for <span className="font-semibold text-gray-800">{selectedJob?.title}</span> has been successfully submitted.
                  </motion.p>

                  <motion.div 
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <p className="text-sm text-blue-800">
                      💼 Check <span className="font-semibold">My Applications</span> to keep track of all your submissions and updates.
                    </p>
                  </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                    onClick={() => {
                      setShowSuccessModal(false)
                      router.push('/applications')
                    }}
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    View My Applications
                  </Button>
                </motion.div>

                {/* Auto-dismiss indicator with progress bar */}
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                >
                  <div className="text-xs text-gray-400 mb-2">
                    Auto-closing in {Math.ceil(autoCloseProgress / 20)} seconds
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${autoCloseProgress}%` }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveFilter("")}
          >
            <motion.div 
              className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Filter Jobs</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilterModal(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Job Type</label>
                  <div className="relative">
                    <button
                      onClick={() => setActiveFilter(activeFilter === "jobType" ? "" : "jobType")}
                      className="w-full h-14 px-4 pr-10 border-2 border-gray-200 rounded-xl bg-white text-left text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-300"
                    >
                      {tempJobTypeFilter}
                    </button>
                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${activeFilter === "jobType" ? "rotate-180" : ""}`} />
                    
                    {activeFilter === "jobType" && (
                      <div className="absolute top-full mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {["All types", "Internships", "Full-time", "Part-time"].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setTempJobTypeFilter(option)
                              setActiveFilter("")
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                              tempJobTypeFilter === option ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Work Mode</label>
                  <div className="relative">
                    <button
                      onClick={() => setActiveFilter(activeFilter === "workMode" ? "" : "workMode")}
                      className="w-full h-14 px-4 pr-10 border-2 border-gray-200 rounded-xl bg-white text-left text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-300"
                    >
                      {tempLocationFilter}
                    </button>
                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${activeFilter === "workMode" ? "rotate-180" : ""}`} />
                    
                    {activeFilter === "workMode" && (
                      <div className="absolute top-full mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {["Any location", "In-Person", "Remote", "Hybrid"].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setTempLocationFilter(option)
                              setActiveFilter("")
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                              tempLocationFilter === option ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Industry</label>
                  <div className="relative">
                    <button
                      onClick={() => setActiveFilter(activeFilter === "industry" ? "" : "industry")}
                      className="w-full h-14 px-4 pr-10 border-2 border-gray-200 rounded-xl bg-white text-left text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-300"
                    >
                      {tempIndustryFilter}
                    </button>
                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${activeFilter === "industry" ? "rotate-180" : ""}`} />
                    
                    {activeFilter === "industry" && (
                      <div className="absolute top-full mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                        {["All industries", "Technology", "Creative Services", "Consumer Goods"].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setTempIndustryFilter(option)
                              setActiveFilter("")
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                              tempIndustryFilter === option ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Clear temp filters but keep search term
                      setTempJobTypeFilter("All types")
                      setTempLocationFilter("Any location")
                      setTempIndustryFilter("All industries")
                    }}
                    className="flex-1 h-12 border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200"
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    onClick={() => {
                      // Apply filters along with current search term
                      setJobTypeFilter(tempJobTypeFilter)
                      setLocationFilter(tempLocationFilter)
                      setIndustryFilter(tempIndustryFilter)
                      setShowFilterModal(false)
                      // Search term is already active in the useJobs hook
                    }}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterDropdown({ name, options, value, onChange, activeFilter, onClick }: { name: string; options: string[]; value: string; onChange: (value: string) => void, activeFilter: string, onClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (name != activeFilter)
      setIsOpen(false);
  }, [name, activeFilter])
  
  return (
    <div className="relative">
      <Button
        variant="outline" 
        onClick={() => (setIsOpen(!isOpen), onClick())}
        className="h-12 px-4 flex items-center gap-2"
      >
        {value}
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

function CategoryLink({ icon, label, category }: { icon: React.ReactNode; label: string; category: string }) {
  return (
    <Link
      href={`/search?category=${encodeURIComponent(category)}`}
      className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      <div className="border rounded-full p-2 bg-white flex-shrink-0">{icon}</div>
      <span className="truncate">{label}</span>
    </Link>
  )
}

function getModeIcon(mode: number | null | undefined) {
  if (!mode && mode !== 0) return <Briefcase className="w-3 h-3 mr-1" />
  
  switch (mode) {
    case 0:
      return <Users2 className="w-3 h-3 mr-1" />
    case 1:
      return <Globe className="w-3 h-3 mr-1" />
    case 2:
      return <Wifi className="w-3 h-3 mr-1" />
  }
  
  return <Briefcase className="w-3 h-3 mr-1" />
}

function JobCard({ job, isSelected, onClick, refs }: { job: Job; isSelected: boolean; onClick: () => void, refs: RefsAPI }) {
  const { ref_loading, get_job_mode, get_job_type } = refs;
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <h3 className="font-semibold text-gray-800 mb-1">{job.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{job.employer?.name}</p>

      <div className="flex flex-wrap gap-2 mb-2">
        {!ref_loading ? job.type && (<Badge variant="outline" className="text-xs">
          {get_job_type(job.type)?.name}
        </Badge>) : <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {!ref_loading && job.salary && (
          <Badge variant="outline" className="text-xs">
            <PhilippinePeso className="w-3 h-3 mr-1" />
            {job.salary}
          </Badge>
        )}
        {!ref_loading && (job.mode !== null && job.mode !== undefined) && (
          <Badge variant="outline" className="text-xs">
            {getModeIcon(job.mode)}
            {get_job_mode(job.mode)?.name}
          </Badge>
         )}
      </div>
    </div>
  )
}

function getModeIconForDetails(mode: number | null | undefined) {
  if (!mode && mode !== 0) return <Briefcase className="w-4 h-4 text-gray-500" />
  
  switch (mode) {
    case 0:
      return <Users2 className="w-3 h-3 mr-1" />
    case 1:
      return <Globe className="w-3 h-3 mr-1" />
    case 2:
      return <Wifi className="w-3 h-3 mr-1" />
  }
  
  return <Briefcase className="w-4 h-4 text-gray-500" />
}

function JobDetails({ 
  job, 
  onApply, 
  onSave, 
  isSaved, 
  saving,
  applicationStatus,
  refs
}: { 
  job: Job
  onApply: () => void
  onSave: (job: Job) => void
  saving: boolean,
  isSaved: boolean
  applicationStatus?: any,
  refs: RefsAPI,
}) {
  const { get_job_type } = refs;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h1>
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-4 h-4 text-gray-500" />
          <p className="text-gray-600">{job.employer?.name}</p>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-500">Listed on {formatDate(job.created_at ?? "")}</p>
        </div>

        <div className="flex gap-3">
          {applicationStatus ? (
            <Button disabled className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Applied ({applicationStatus.status})
            </Button>
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onApply}>
              Apply
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onSave(job)}
            className={isSaved ? "bg-red-50 border-red-200 text-red-600" : ""}
          >
            { isSaved ? (
                <>
                  <Heart></Heart>
                  <span>Saved</span>
                </>) : saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold mb-4">Job Details</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <div>
              <p className="font-medium text-sm">Location: {job.location}</p>
              <p className="text-sm text-gray-600">{job.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getModeIconForDetails(job.mode)}
            <div>
              <p className="text-sm">
                <span className="font-medium">Mode: </span>
                <span className="opacity-80">{job.mode || "Not specified"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PhilippinePeso className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm">
                <span className="font-medium">Salary: </span>
                <span className="opacity-80">{job.salary || "Not specified"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm">
                <span className="font-medium">Employment Type: </span>
                <span className="opacity-80">{get_job_type(job.type)?.name ?? "Not specified"}</span>
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-3">Job Description</h3>
        <Markdown>{job.description}</Markdown>

        {(job.requirements?.length ?? 0) > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              {job.requirements?.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </>
        )}

        {(job.responsibilities?.length ?? 0) > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {job.responsibilities?.map((resp: string, index: number) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </>
        )}

        {job.employer?.description && (
          <>
            <h3 className="text-lg font-semibold mb-3 mt-6">About the Company</h3>
            <p className="text-gray-700 leading-relaxed">{job.employer.description}</p>
          </>
        )}
      </div>
    </div>
  )
}
