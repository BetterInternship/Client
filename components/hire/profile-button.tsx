"use client"

import { useState, useRef, useEffect } from "react"
import { User, ChevronDown, LogOut, Settings, BookA, Heart, Building2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/app/hire/authctx"

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, recheck_authentication, is_authenticated, logout } = useAuthContext()

  useEffect(() => {
    // Check if authed
    if (!is_authenticated())
      recheck_authentication()
        .then(r => !r && router.push("/login"))

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout().then(() => {
      setIsOpen(false)
      router.push('/login')
    })
  }

  const getUserDisplayName = () => {
    if (user?.first_name) {
      // Show first name and last initial if last name exists
      if (user.last_name) {
        return `${user.first_name} ${user.last_name.charAt(0)}.`
      }
      return user.first_name
    }
    return 'User'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-10 px-4 bg-white border-gray-300 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 rounded-lg border-2 border-gray-400 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-gray-700 font-medium">
          {is_authenticated() ? getUserDisplayName() : "Account"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {is_authenticated() ? (
            <div className="py-1">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/company-profile')
                }}
              >
                <Building2 className="w-4 h-4" />
                Edit Company Profile
              </button>
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/add-users')
                }}
              >
                <UserPlus className="w-4 h-4" />
                Add Users
              </button>

              <hr className="my-1 border-gray-200" />
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="py-1">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Please sign in to access your profile.</p>
              </div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                onClick={() => {
                  setIsOpen(false)
                  router.push('/login')
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}