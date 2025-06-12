"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Monitor, 
  HardHat, 
  GraduationCap, 
  Palette, 
  Stethoscope, 
  Scale, 
  ChefHat, 
  Building2,
  BookA,
  Calendar,
  MapPin,
  Building,
  Trash2,
  Briefcase,
  Wifi,
  Globe,
  Users2,
  PhilippinePeso,
  Clock,
  Clipboard
} from "lucide-react"
import ProfileButton from "@/components/student/profile-button"
import { useApplications } from "@/hooks/use-api"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../authctx"

export default function ApplicationsPage() {
  const { is_authenticated } = useAuthContext()
  const { applications, loading, error, refetch } = useApplications()
  
  // Debug logging
  useEffect(() => {
    console.log('Applications Debug:', {
      applications,
      applicationsType: typeof applications,
      applicationsIsArray: Array.isArray(applications),
      loading,
      error
    })
  }, [applications, loading, error])
  const router = useRouter()

  useEffect(() => {
    if (!is_authenticated()) {
      router.push('/login')
    }
  }, [is_authenticated(), router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper function to get mode icon
  const getModeIcon = (mode: string) => {
    if (!mode) return <Briefcase className="w-3 h-3 mr-1" />
    
    const modeStr = mode.toLowerCase()
    if (modeStr.includes('remote')) {
      return <Wifi className="w-3 h-3 mr-1" />
    } else if (modeStr.includes('hybrid')) {
      return <Globe className="w-3 h-3 mr-1" />
    } else if (modeStr.includes('in-person') || modeStr.includes('face to face') || modeStr.includes('onsite')) {
      return <Users2 className="w-3 h-3 mr-1" />
    }
    
    return <Briefcase className="w-3 h-3 mr-1" />
  }

  // Helper function to get employment type icon
  const getEmploymentTypeIcon = (type: string) => {
    if (!type) return <Clipboard className="w-3 h-3 mr-1" />
    
    const typeStr = type.toLowerCase()
    if (typeStr.includes('intern')) {
      return <GraduationCap className="w-3 h-3 mr-1" />
    } else if (typeStr.includes('full')) {
      return <Briefcase className="w-3 h-3 mr-1" />
    } else if (typeStr.includes('part')) {
      return <Clock className="w-3 h-3 mr-1" />
    }
    
    return <Clipboard className="w-3 h-3 mr-1" />
  }

  // Helper function to get allowance/salary icon
  const getSalaryIcon = () => {
    return <PhilippinePeso className="w-3 h-3 mr-1" />
  }

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'default'
      case 'reviewed':
        return 'secondary'
      case 'shortlisted':
        return 'default'
      case 'accepted':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Helper function to get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '⏳ Pending'
      case 'reviewed':
        return '👀 Reviewed'
      case 'shortlisted':
        return '⭐ Shortlisted'
      case 'accepted':
        return '✅ Accepted'
      case 'rejected':
        return '❌ Rejected'
      default:
        return status || 'Unknown'
    }
  }

  if (!is_authenticated()) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <h1 className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
                BetterInternship
              </h1>
            </Link>

            <Link href="/search?category=all" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100 transition-colors">
              <Home className="h-5 w-5" />
              <span>Browse All</span>
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
          
          {/* Applications Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <BookA className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                {!loading && applications && (
                  <Badge variant="outline" className="ml-2">
                    {applications.length} applications
                  </Badge>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Failed to load applications: {error}</p>
                  <Button onClick={refetch}>Try Again</Button>
                </div>
              ) : !applications || applications.length === 0 ? (
                <div className="text-center py-12">
                  <BookA className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg mb-4">No applications yet</div>
                  <div className="text-gray-400 text-sm mb-6">
                    Click on the apply button on any open job to start an application.
                  </div>
                  <Link href="/search">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications && applications.map((application) => (
                    <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {application.job?.title}
                                </h3>
                                <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                                  {getStatusDisplayText(application.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Building className="w-4 h-4" />
                                <span className="font-medium">{application.job?.employer.name}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{application.job?.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Sent {formatDate(application.appliedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {application.job?.type && (
                              <Badge variant="outline" className="text-xs flex items-center">
                                {getEmploymentTypeIcon(application.job.type)}
                                {application.job.type}
                              </Badge>
                            )}
                            {application.job?.mode && (
                              <Badge variant="outline" className="text-xs flex items-center">
                                {getModeIcon(application.job.mode)}
                                {application.job.mode}
                              </Badge>
                            )}
                            {application.job?.allowance && application.job.allowance.trim() !== '' && (
                              <Badge variant="outline" className="text-xs flex items-center">
                                <Clipboard className="w-3 h-3 mr-1" />
                                {application.job.allowance}
                              </Badge>
                            )}
                            {application.job?.salary && (
                              <Badge variant="outline" className="text-xs flex items-center">
                                {getSalaryIcon()}
                                {application.job.salary}
                              </Badge>
                            )}
                            {application.job?.duration && (
                              <Badge variant="outline" className="text-xs flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {application.job.duration}
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                            {application.job?.description}
                          </p>

                          <div className="flex gap-3">
                            <Link href={`/search?jobId=${application.job?.id}`}>
                              <Button size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
      <span className="text-sm truncate">{label}</span>
    </Link>
  )
}
