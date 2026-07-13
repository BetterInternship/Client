"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { DiscordService } from "@/lib/api/discord.api";
import { JobService, UserService } from "@/lib/api/services";
import { useAuthContext } from "@/lib/ctx-auth";

type SetupState = "idle" | "applying" | "success" | "error";

function DiscordSetupContent() {
  const params = useSearchParams();
  const jobId = params.get("job_id") || "";
  const { redirectIfNotLoggedIn } = useAuthContext();
  const queryClient = useQueryClient();
  const attemptedRef = useRef(false);
  const applyingRef = useRef(false);
  const settingDefaultRef = useRef(false);
  const [setupState, setSetupState] = useState<SetupState>("idle");
  const [message, setMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  redirectIfNotLoggedIn();

  const status = useQuery({
    queryKey: ["discord-link"],
    queryFn: () => DiscordService.getLinkStatus(),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const resumes = useQuery({
    queryKey: ["my-resumes"],
    queryFn: () => UserService.getMyResumes(),
  });
  const job = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => JobService.getJobById(jobId),
    enabled: Boolean(jobId),
  });

  const apply = async () => {
    if (applyingRef.current) return;

    if (!jobId) {
      setSetupState("error");
      setMessage("This Discord application link is missing a listing.");
      return;
    }

    applyingRef.current = true;
    setCanRetry(false);
    setSetupState("applying");

    try {
      const result = await DiscordService.completeSetup(jobId);
      if (!result.success) {
        setSetupState("error");
        setMessage(result.message || "Could not submit this application.");
        return;
      }

      setSetupState("success");
      setMessage("Your application was submitted successfully.");
      void queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    } catch {
      setSetupState("error");
      setMessage("Could not reach BetterInternship. Please try again.");
      setCanRetry(true);
    } finally {
      applyingRef.current = false;
    }
  };

  useEffect(() => {
    if (!status.data?.linked || attemptedRef.current) return;
    attemptedRef.current = true;
    void apply();
  }, [status.data?.linked]);

  const connect = () => {
    window.location.assign(DiscordService.authorizationUrl(jobId));
  };

  const setDefaultAndRetry = async (resumeId: string) => {
    if (settingDefaultRef.current || applyingRef.current) return;

    settingDefaultRef.current = true;
    setIsSettingDefault(true);
    try {
      const result = await UserService.setDefaultResume(resumeId);
      if (!result.success) {
        setMessage(result.message || "Could not select that resume.");
        return;
      }
      await resumes.refetch();
      attemptedRef.current = true;
      await apply();
    } catch {
      setSetupState("error");
      setMessage("Could not update your default resume. Please try again.");
    } finally {
      settingDefaultRef.current = false;
      setIsSettingDefault(false);
    }
  };

  if (status.isPending || resumes.isPending) {
    return <Loader>Preparing Discord Apply...</Loader>;
  }

  const listing = job.data?.job;
  const resumeList = resumes.data?.resumes ?? [];
  const needsDefault =
    status.data?.linked &&
    resumeList.length > 1 &&
    !resumes.data?.default_resume &&
    setupState === "error";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-12">
      <Card className="w-full space-y-6 border-blue-100 p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5865F2]/10 text-[#5865F2]">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#061858]">
            Apply through Discord
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {listing?.title
              ? `Complete setup to apply for ${listing.title}.`
              : "Complete setup to submit this application."}
          </p>
        </div>

        {!status.data?.linked && (
          <Button className="w-full" onClick={connect}>
            Connect Discord and Apply
          </Button>
        )}

        {setupState === "applying" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting your application...
          </div>
        )}

        {setupState === "success" && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            {message}
          </div>
        )}

        {setupState === "error" && (
          <div className="space-y-4">
            <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-900">
              {message}
            </p>
            {needsDefault && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#061858]">
                  Choose the resume to use by default:
                </p>
                {resumeList.map((resume) => (
                  <Button
                    key={resume.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => void setDefaultAndRetry(resume.id)}
                    disabled={isSettingDefault || setupState === "applying"}
                  >
                    {isSettingDefault && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {resume.label || resume.filename}
                  </Button>
                ))}
              </div>
            )}
            {resumeList.length === 0 && (
              <Button asChild variant="outline" className="w-full">
                <a href="/profile">
                  <Upload className="h-4 w-4" />
                  Upload a resume
                </a>
              </Button>
            )}
            {canRetry && (
              <Button
                type="button"
                className="w-full"
                onClick={() => void apply()}
              >
                Try again
              </Button>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}

export default function DiscordSetupPage() {
  return (
    <Suspense fallback={<Loader>Preparing Discord Apply...</Loader>}>
      <DiscordSetupContent />
    </Suspense>
  );
}
