"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Calendar, 
  FileText, 
  User, 
  BarChart3, 
  ChevronDown,
  Building2,
  UserPlus,
  LogOut,
  FileEdit,
  Search,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import ApplicantModal from "@/components/hire/applicant-modal"
import CalendarModal from "@/components/hire/calendar-modal"
import ProductTour from "@/components/ProductTour"
import TourButton from "@/components/TourButton"
import { useTourIntegration } from "@/components/useTourIntegration"

// Fake applicants data for Google
const applicantsData = [
  { id: 1, name: "John Chen", school: "Stanford University", program: "Computer Science", job: "Software Engineering Intern", mode: "Full-Time", status: "New" },
  { id: 2, name: "Sarah Johnson", school: "MIT", program: "Computer Science", job: "Data Science Intern", mode: "Full-Time", status: "Interviewing" },
  { id: 3, name: "Mike Rodriguez", school: "UC Berkeley", program: "EECS", job: "Software Engineering Intern", mode: "Full-Time", status: "To Interview" },
  { id: 4, name: "Emily Wang", school: "Carnegie Mellon", program: "Computer Science", job: "Product Management Intern", mode: "Full-Time", status: "Offer Sent" },
  { id: 5, name: "David Park", school: "Harvard University", program: "Computer Science", job: "UX Design Intern", mode: "Full-Time", status: "Shortlisted" },
  { id: 6, name: "Lisa Zhang", school: "Cornell University", program: "Information Science", job: "Marketing Analyst Intern", mode: "Full-Time", status: "Hired" },
  { id: 7, name: "Alex Thompson", school: "University of Washington", program: "Computer Science", job: "Software Engineering Intern", mode: "Full-Time", status: "Interviewing" },
  { id: 8, name: "Maria Garcia", school: "Georgia Tech", program: "Computer Science", job: "Data Science Intern", mode: "Full-Time", status: "Offer Declined" },
  { id: 9, name: "James Kim", school: "UCSD", program: "Computer Engineering", job: "Software Engineering Intern", mode: "Full-Time", status: "Shortlisted" },
  { id: 10, name: "Anna Patel", school: "UT Austin", program: "Computer Science", job: "Product Management Intern", mode: "Full-Time", status: "Hired" },
  { id: 11, name: "Kevin Liu", school: "Northwestern", program: "Computer Science", job: "UX Design Intern", mode: "Full-Time", status: "Interviewing" },
  { id: 12, name: "Rachel Brown", school: "Duke University", program: "Computer Science", job: "Marketing Analyst Intern", mode: "Full-Time", status: "Offer Declined" },
]

const statusOptions = [
  "New",
  "Interviewing", 
  "Shortlisted",
  "Offer Sent",
  "Offer Accepted",
  "Offer Declined",
  "Hired",
  "Rejected"
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "New": return "bg-blue-100 text-blue-800"
    case "Interviewing": return "bg-yellow-100 text-yellow-800" 
    case "Shortlisted": return "bg-purple-100 text-purple-800"
    case "Offer Sent": return "bg-orange-100 text-orange-800"
    case "Offer Accepted": return "bg-green-100 text-green-800"
    case "Offer Declined": return "bg-red-100 text-red-800"
    case "Hired": return "bg-emerald-100 text-emerald-800"
    case "Rejected": return "bg-gray-100 text-gray-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export default function Dashboard() {
  const [applicants, setApplicants] = useState(applicantsData)
  const [selectedApplicant, setSelectedApplicant] = useState<typeof applicantsData[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const router = useRouter()

  // Tour integration
  const { showTour, startTour, closeTour } = useTourIntegration('dashboard')

  // Sorting and filtering states
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [jobSearch, setJobSearch] = useState("")
  const [statusSearch, setStatusSearch] = useState("")

  // Get unique values for filters
  const uniqueJobs = useMemo(() => [...new Set(applicantsData.map(a => a.job))].sort(), [])
  const uniqueStatuses = useMemo(() => [...new Set(applicantsData.map(a => a.status))].sort(), [])

  // Filter and sort applicants
  const filteredAndSortedApplicants = useMemo(() => {
    let filtered = applicantsData.filter(applicant => {
      const jobMatch = selectedJobs.length === 0 || selectedJobs.includes(applicant.job)
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(applicant.status)
      return jobMatch && statusMatch
    })

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [selectedJobs, selectedStatuses, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleJobToggle = (job: string) => {
    setSelectedJobs(prev => 
      prev.includes(job) 
        ? prev.filter(j => j !== job)
        : [...prev, job]
    )
  }

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const updateStatus = (id: number, newStatus: string) => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === id ? { ...applicant, status: newStatus } : applicant
    ))
    // Also update the main data source if needed
    const applicantIndex = applicantsData.findIndex(a => a.id === id)
    if (applicantIndex !== -1) {
      applicantsData[applicantIndex].status = newStatus
    }
  }

  const openApplicantModal = (applicant: typeof applicantsData[0]) => {
    setSelectedApplicant(applicant)
    setIsModalOpen(true)
  }

  // Filter components
  const MultiSelectFilter = ({ 
    title, 
    options, 
    selected, 
    onToggle, 
    searchValue, 
    onSearchChange,
    fieldName 
  }: {
    title: string
    options: string[]
    selected: string[]
    onToggle: (value: string) => void
    searchValue: string
    onSearchChange: (value: string) => void
    fieldName: string
  }) => {
    const filteredOptions = options.filter(option => 
      option.toLowerCase().includes(searchValue.toLowerCase())
    )

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 font-semibold">
            <div className="flex items-center gap-2">
              {title} <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort(fieldName)}
                className="text-xs"
              >
                A-Z {sortField === fieldName && sortDirection === "asc" && "↑"}
                {sortField === fieldName && sortDirection === "desc" && "↓"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select all filtered options
                  filteredOptions.forEach(option => {
                    if (!selected.includes(option)) {
                      onToggle(option)
                    }
                  })
                }}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all selections
                  selected.forEach(option => onToggle(option))
                }}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selected.includes(option)}
                    onCheckedChange={() => onToggle(option)}
                  />
                  <label
                    htmlFor={`${title}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            
            {selected.length > 0 && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                {selected.length} selected
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const SortableFilter = ({ field, title }: { field: string; title: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 font-semibold">
          <div className="flex items-center gap-2">
            {title} <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort(field)}
            className="w-full justify-start"
          >
            Sort A-Z {sortField === field && sortDirection === "asc" && "↑"}
            {sortField === field && sortDirection === "desc" && "↓"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  const handleLogout = () => {
    // Clear any stored authentication data (if you add localStorage/sessionStorage later)
    // localStorage.removeItem('authToken') // Future implementation
    
    // Redirect to login page
    router.push('/login')
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col" data-tour="sidebar">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">BetterInternship</h1>
        </div>
        
        <div className="px-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Pages</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-900 bg-white p-3 rounded-lg font-medium cursor-default">
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </div>
            <Link href="/listings" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-3 rounded-lg hover:bg-white transition-colors">
              <FileText className="h-5 w-5" />
              My Listings
            </Link>
            <Link href="/forms-automation" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-3 rounded-lg hover:bg-white transition-colors">
              <FileEdit className="h-5 w-5" />
              Forms Automation
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Application Dashboard</h1>
          <div className="flex items-center gap-3">
            <TourButton
              onClick={startTour}
              pageName="dashboard"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" data-tour="user-menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/company-profile">
                    <Building2 className="mr-2 h-4 w-4" />
                    <span>Edit Company Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/add-users">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Add Users</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Dashboard */}
        <div className="p-6 flex flex-col h-0 flex-1 space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-4 gap-4" data-tour="dashboard-cards">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-900">{applicantsData.length}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <User className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Hired</p>
                  <p className="text-2xl font-bold text-green-900">
                    {applicantsData.filter(a => a.status === "Hired").length}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Interviewing</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {applicantsData.filter(a => a.status === "Interviewing").length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">New Applications</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {applicantsData.filter(a => a.status === "New").length}
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
            {/* Table Header with Filters */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Applicants</h3>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    Showing {filteredAndSortedApplicants.length} of {applicantsData.length} applicants
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700 w-[300px]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <SortableFilter field="name" title="Candidate" />
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700 w-[250px]">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <MultiSelectFilter
                          title="Position"
                          options={uniqueJobs}
                          selected={selectedJobs}
                          onToggle={handleJobToggle}
                          searchValue={jobSearch}
                          onSearchChange={setJobSearch}
                          fieldName="job"
                        />
                      </div>
                    </th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-700 w-[120px]">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Resume</span>
                      </div>
                    </th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-700 w-[120px]">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Schedule</span>
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700 w-[200px]">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <MultiSelectFilter
                          title="Status"
                          options={uniqueStatuses}
                          selected={selectedStatuses}
                          onToggle={handleStatusToggle}
                          searchValue={statusSearch}
                          onSearchChange={setStatusSearch}
                          fieldName="status"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedApplicants.map((applicant, index) => (
                    <tr 
                      key={applicant.id} 
                      className={`border-b border-gray-50 hover:bg-gray-25 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <td className="px-6 py-4 w-[300px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {applicant.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{applicant.name}</p>
                            <p className="text-sm text-gray-500">{applicant.school} • {applicant.program}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[250px]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="font-medium text-gray-900">{applicant.job}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{applicant.mode}</p>
                      </td>
                      <td className="px-6 py-4 w-[120px] text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => openApplicantModal(applicant)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-6 py-4 w-[120px] text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-10 h-10 p-0 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
                          onClick={() => setIsCalendarOpen(true)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-6 py-4 w-[200px]">
                        <Select 
                          value={applicant.status} 
                          onValueChange={(value) => updateStatus(applicant.id, value)}
                        >
                          <SelectTrigger className={`w-full h-9 ${getStatusColor(applicant.status)} border-0 rounded-full font-medium text-sm`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Applicant Modal */}
      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        applicantName={selectedApplicant?.name}
      />

      {/* Product Tour */}
      <ProductTour
        isOpen={showTour}
        onClose={closeTour}
        pageName="dashboard"
      />
    </div>
  )
}
