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
  Heart,
  Calendar,
  MapPin,
  Building,
  Trash2,
  Briefcase,
  PhilippinePeso
} from "lucide-react"
import ProfileButton from "@/components/student/profile-button"
import { useSavedJobs  } from "@/hooks/use-api"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../authctx"

export default function SavedJobsPage() {
  const { is_authenticated, recheck_authentication } = useAuthContext()
  const { save_job, savedJobs, saving, loading, error, refetch } = useSavedJobs()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen width is <= 1024px
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    recheck_authentication().then(r => !r && router.push('/login'))
  }, [is_authenticated(), router])

  const handleUnsaveJob = async (job_id: string) => {
    try {
      await save_job(job_id) // This will toggle the saved status
      refetch() // Refresh the saved jobs list
    } catch (error) {
      console.error('Failed to unsave job:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
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
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex justify-between items-center p-4 border-b bg-white">
              <Link href="/" className="block">
                <h1 className="text-xl font-bold text-gray-800">BetterInternship</h1>
              </Link>
              <ProfileButton />
            </div>
          )}

          {/* Desktop Profile button */}
          {!isMobile && (
            <div className="flex justify-end p-4">
              <ProfileButton />
            </div>
          )}
          
          {/* Saved Jobs Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-6 pb-24' : 'p-8'}`}>
            <div className={`${isMobile ? 'max-w-none' : 'max-w-6xl mx-auto'}`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'mb-8' : 'mb-8'}`}>
                <Heart className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} text-red-500 fill-current`} />
                <h1 className={`${isMobile ? 'text-3xl' : 'text-3xl'} font-bold text-gray-900`}>Saved Jobs</h1>
                {!loading && (
                  <Badge variant="outline" className={`ml-2 ${isMobile ? 'text-sm px-3 py-1' : ''}`}>
                    {savedJobs.length} saved
                  </Badge>
                )}
              </div>
              
              {loading ? (
                <div className={`text-center ${isMobile ? 'py-16' : 'py-12'}`}>
                  <div className={`animate-spin rounded-full ${isMobile ? 'h-10 w-10' : 'h-8 w-8'} border-b-2 border-gray-900 mx-auto mb-4`}></div>
                  <p className={`text-gray-600 ${isMobile ? 'text-lg' : ''}`}>Loading saved jobs...</p>
                </div>
              ) : error ? (
                <div className={`text-center ${isMobile ? 'py-16' : 'py-12'}`}>
                  <p className={`text-red-600 mb-4 ${isMobile ? 'text-lg' : ''}`}>Failed to load saved jobs: {error}</p>
                  <Button onClick={refetch} size={isMobile ? "lg" : "default"}>Try Again</Button>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className={`text-center ${isMobile ? 'py-20' : 'py-12'}`}>
                  <Heart className={`${isMobile ? 'w-20 h-20' : 'w-16 h-16'} text-gray-300 mx-auto mb-6`} />
                  <div className={`text-gray-500 ${isMobile ? 'text-xl mb-6' : 'text-lg mb-4'} font-medium`}>No saved jobs yet</div>
                  <div className={`text-gray-400 ${isMobile ? 'text-base mb-8 px-4 leading-relaxed' : 'text-sm mb-6'}`}>
                    Save jobs by clicking the heart icon on job listings to see them here.
                  </div>
                  <Link href="/search">
                    <Button size={isMobile ? "lg" : "default"} className={isMobile ? 'px-8 py-3 text-lg font-medium' : ''}>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className={`space-y-${isMobile ? '4' : '4'}`}>
                  {savedJobs.map((savedJob) => (
                    <div key={savedJob.id} className={`bg-white border border-gray-200 rounded-xl ${isMobile ? 'p-5 shadow-sm' : 'p-6'} hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className={`flex items-start justify-between ${isMobile ? 'mb-3' : 'mb-3'}`}>
                            <div className="flex-1">
                              <h3 className={`${isMobile ? 'text-xl' : 'text-xl'} font-semibold text-gray-900 mb-2 leading-tight`}>
                                {savedJob.title}
                              </h3>
                              <div className={`flex items-center gap-2 text-gray-600 ${isMobile ? 'mb-3' : 'mb-2'}`}>
                                <Building className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                <span className={`font-medium ${isMobile ? 'text-base' : ''}`}>{savedJob.employer?.name}</span>
                              </div>
                              <div className={`flex items-center gap-4 text-sm text-gray-500 ${isMobile ? 'mb-4' : 'mb-3'}`}>
                                <div className="flex items-center gap-1">
                                  <MapPin className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                                  <span className={isMobile ? 'text-sm' : ''}>{savedJob.employer?.location}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size={isMobile ? "default" : "sm"}
                              disabled={saving}
                              onClick={() => handleUnsaveJob(savedJob.id ?? '')}
                              className={`text-red-600 border-red-200 hover:bg-red-50 ${isMobile ? 'px-4 py-2 ml-3' : ''}`}
                            >
                              <Trash2 className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-4 h-4 mr-2'}`} />
                              {isMobile ? 'Remove' : 'Remove'}
                            </Button>
                          </div>

                          <div className={`flex flex-wrap gap-2 ${isMobile ? 'mb-4' : 'mb-4'}`}>
                            {savedJob.mode && (
                              <Badge variant="outline" className={isMobile ? 'px-3 py-1' : ''}>
                                <Briefcase className="w-3 h-3 mr-1" />
                                {savedJob.mode}
                              </Badge>
                            )}
                            {savedJob.salary && (
                              <Badge variant="outline" className={isMobile ? 'px-3 py-1' : ''}>
                                <PhilippinePeso className="w-3 h-3 mr-1" />
                                {savedJob.salary}
                              </Badge>
                            )}
                          </div>

                          <p className={`text-gray-700 ${isMobile ? 'text-sm mb-5 leading-relaxed' : 'text-sm mb-4'} line-clamp-2`}>
                            {savedJob.description}
                          </p>

                          <div className={`flex gap-3 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
                            <Link href={`/search?jobId=${savedJob.id}`}>
                              <Button size={isMobile ? "default" : "sm"} className={`${isMobile ? 'w-full sm:w-auto px-6 py-2 font-medium' : ''}`}>
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/search?q=${encodeURIComponent(savedJob.job?.title ?? '')}`}>
                              <Button variant="outline" size={isMobile ? "default" : "sm"} className={`${isMobile ? 'w-full sm:w-auto px-6 py-2 font-medium' : ''}`}>
                                Find Similar
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
