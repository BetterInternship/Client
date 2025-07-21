"use client"


export function Footer() {
  return (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">© 2025 BetterInternship Inc. All rights reserved.</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Help Center
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
