// "use client";

// import { useRouter, useSearchParams } from "next/navigation";

// export default function LandingPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   return <div className=""></div>;
// }

"use client";

import { useState } from "react";

export default function Home() {
  const [tin, setTin] = useState("");

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg shadow-lg">
        <div className="bg-blue-600 text-white text-xl font-semibold p-4 rounded-t-lg">
          Welcome to DLSU MOA Portal{" "}
        </div>
        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-500 mt-2">
              Start or manage your Memorandum of Agreement with De La Salle
              University
            </p>
          </div>
          <form className="space-y-4">
            <label className="block text-gray-700 font-medium">
              Company Tax Identification Number (TIN)
              <input
                type="text"
                placeholder="e.g., 123-456-789-000"
                className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 outline-none"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
