import { Skeleton, SkeletonRegion } from "@/components/ui/skeleton";
import bg2 from "@/public/bg2.png";
import {
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  Edit2,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

export function ResumeSkeleton() {
  return (
    <SkeletonRegion label="Loading resumes" className="space-y-3">
      <div className="flex flex-col gap-3 rounded-[0.33em] border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex justify-end gap-2">
          {[Eye, Pencil, Trash2].map((Icon, item) => (
            <span
              key={item}
              className="grid h-9 w-9 place-items-center rounded-[0.33em] border text-gray-300"
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

/** Same Profile outline during session verification and initial profile loading. */
export function ProfileSkeleton() {
  return (
    <div className="relative isolate min-h-0 flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: `url(${bg2.src})` }}
      />
      <SkeletonRegion
        label="Loading profile"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="rounded-[0.33em] border border-gray-300 bg-white px-5 py-6 sm:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              <div className="relative shrink-0">
                <span className="grid h-28 w-28 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-300">
                  <UserRound className="h-12 w-12" strokeWidth={1.2} />
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border bg-white text-gray-300">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
              <div className="flex w-full flex-col items-center gap-3 sm:items-start">
                <Skeleton className="h-7 w-52 max-w-full" />
                <div className="w-full space-y-2 text-sm text-gray-400">
                  {["Email:", "School email:"].map((label) => (
                    <div
                      key={label}
                      className="flex flex-wrap items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>{label}</span>
                      <Skeleton className="h-3 w-32 max-w-full" />
                    </div>
                  ))}
                </div>
                <span className="inline-flex h-10 items-center gap-2 rounded-[0.33em] border px-4 text-sm font-medium text-gray-400">
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y rounded-[0.33em] border border-gray-300 bg-white">
            {[
              { title: "Resume", icon: FileText },
              { title: "Internship Details", icon: BriefcaseBusiness },
              { title: "Personal Information", icon: UserRound },
              { title: "Connected Accounts", icon: MessageCircle },
            ].map(({ title, icon: Icon }, section) => (
              <div key={title} className="px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3 text-base font-semibold text-gray-900">
                  <Icon className="h-5 w-5 text-primary" />
                  <span>{title}</span>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
                </div>
                {section === 0 && (
                  <div className="mt-5 space-y-4 pb-1">
                    <ResumeSkeleton />
                    <div className="flex justify-end">
                      <span className="inline-flex h-10 items-center gap-2 rounded-[0.33em] border px-4 text-sm font-medium text-gray-400">
                        <Upload className="h-4 w-4" />
                        Add resume
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SkeletonRegion>
    </div>
  );
}
