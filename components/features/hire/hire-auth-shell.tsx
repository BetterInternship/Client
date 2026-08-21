import Image from "next/image";
import type { ReactNode } from "react";
import { Clock3, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function HireAuthShell({
  children,
  className,
  description,
  footer,
  headerBefore,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footer?: ReactNode;
  headerBefore?: ReactNode;
  title: string;
}) {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-white">
      <div className="grid h-full min-h-0 w-full grid-cols-1 lg:grid-cols-5">
        <aside className="relative hidden min-h-0 overflow-x-hidden overflow-y-auto bg-gray-900 lg:col-span-3 lg:block">
          <Image src="/bg2.png" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-white/10" />
          <div className="relative flex h-full flex-col justify-between p-8 xl:p-12">
            <div className="flex items-center gap-2 text-gray-900">
              <div className="rounded-full shadow-md">
                <Image
                  src="/BetterInternshipLogo.png"
                  alt="BetterInternship"
                  width={28}
                  height={28}
                />
              </div>
              <span className="text-lg font-bold">BetterInternship</span>
            </div>

            <div className="mx-auto w-full max-w-2xl">
              <div className="rotate-[-1.25deg] rounded-[0.33em] border border-white/70 bg-white/95 p-9 shadow-2xl shadow-black/30 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-5 border-b border-gray-200 pb-5">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">
                      Marketing Intern
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Makati City
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" /> Internship
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-supportive px-2.5 py-1 text-xs font-semibold text-white">
                    Active
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    12 applicants this week
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Users className="h-4 w-4" /> 12
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    ["New", "7", "bg-primary"],
                    ["Review", "3", "bg-warning"],
                    ["Shortlist", "2", "bg-supportive"],
                  ].map(([label, count, color]) => (
                    <div
                      key={label}
                      className="rounded-[0.33em] border border-gray-200 bg-gray-50/80 p-4"
                    >
                      <div className={`mb-3 h-1 rounded-full ${color}`} />
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl leading-tight font-semibold tracking-tight text-gray-800 xl:text-4xl">
                Turn promising potential into your next great hire.
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Post opportunities, review applicants, and connect with students
                ready to contribute from day one.
              </p>
            </div>
          </div>
        </aside>

        <main className="relative flex h-full min-h-0 w-full items-center overflow-y-auto border-gray-300 bg-white px-5 py-10 lg:col-span-2 lg:overflow-hidden lg:border-l lg:px-8 xl:px-12">
          <div
            className={cn("relative z-10 mx-auto w-full max-w-md", className)}
          >
            <div className="mb-8 flex items-center gap-2">
              <Image
                src="/BetterInternshipLogo.png"
                alt="BetterInternship"
                width={26}
                height={26}
              />
              <span className="font-bold text-gray-900">BetterInternship</span>
            </div>
            <div className="mb-7 space-y-2">
              {headerBefore}
              <h1 className="text-3xl font-bold tracking-tight text-gray-700">
                {title}
              </h1>
              {description && (
                <div className="text-sm leading-6 text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
            {children}
            {footer && (
              <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
