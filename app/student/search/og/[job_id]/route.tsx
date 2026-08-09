import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { fetchJobPreview, JobPreviewData } from "@/lib/api/job-preview.server";
import { getRefsData } from "@/lib/db/use-refs-backend";
import { createRefHelpers } from "@/lib/db/ref-lookup";
import { JobAllowance, JobMode, JobPayFreq, JobType } from "@/lib/db/db.types";

export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

const betterInternshipLogo = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/BetterInternshipLogo.png"))
  .toString("base64")}`;
const backgroundImage = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/bg.png"))
  .toString("base64")}`;
const spaceGroteskMediumUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf";
const spaceGroteskBoldUrl =
  "https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf";

/**
 * Compensation tag text (D2): the exact figure when the job is salaried,
 * the allowance-category label otherwise. Mirrors the allowance === 0
 * sentinel + pay-freq branching already established in JobDetailsSummary
 * (components/shared/jobs.tsx). Returns null when nothing meaningful
 * resolves, so the caller can drop the tag instead of showing a blank pill.
 */
function formatCompensation(
  job: JobPreviewData,
  jobAllowanceHelpers: ReturnType<
    typeof createRefHelpers<number, JobAllowance>
  >,
  jobPayFreqHelpers: ReturnType<typeof createRefHelpers<number, JobPayFreq>>,
): string | null {
  if (job.allowance === 0) {
    const salaryNum = job.salary ? Number(job.salary) : null;
    if (!salaryNum) return "With pay";

    const freqName = jobPayFreqHelpers.toName(job.salary_freq);
    const amount = `₱${salaryNum.toLocaleString("en-PH")}`;
    return freqName !== "Not specified" ? `${amount}/${freqName}` : amount;
  }

  return jobAllowanceHelpers.toName(job.allowance, null) || null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ job_id: string }> },
) {
  const { job_id } = await context.params;
  const fallback = () =>
    Response.redirect(new URL("/og.png", request.url).toString(), 307);

  try {
    const [job, refs, spaceGroteskMedium, spaceGroteskBold] = await Promise.all(
      [
        fetchJobPreview(job_id),
        getRefsData(),
        fetch(spaceGroteskMediumUrl).then((response) => response.arrayBuffer()),
        fetch(spaceGroteskBoldUrl).then((response) => response.arrayBuffer()),
      ],
    );

    // Not found, deleted, deactivated, or an unverified employer — same
    // "hidden job" contract fetchJobPreview shares with generateMetadata
    // (D5/D8).
    if (!job) return fallback();

    const jobModeHelpers = createRefHelpers<number, JobMode>(refs.job_modes);
    const jobTypeHelpers = createRefHelpers<number, JobType>(refs.job_types);
    const jobAllowanceHelpers = createRefHelpers<number, JobAllowance>(
      refs.job_allowances,
    );
    const jobPayFreqHelpers = createRefHelpers<number, JobPayFreq>(
      refs.job_pay_freq,
    );

    const modeTags = (job.internship_preferences?.job_setup_ids ?? [])
      .map((id) => jobModeHelpers.toName(id, null))
      .filter((name): name is string => !!name);
    const typeTags = (job.internship_preferences?.job_commitment_ids ?? [])
      .map((id) => jobTypeHelpers.toName(id, null))
      .filter((name): name is string => !!name);
    const compensationTag = formatCompensation(
      job,
      jobAllowanceHelpers,
      jobPayFreqHelpers,
    );

    const tags = [
      ...modeTags,
      ...typeTags,
      ...(compensationTag ? [compensationTag] : []),
    ];
    const employerName = job.employer?.name ?? "BetterInternship";

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#061633",
          fontFamily: "Space Grotesk",
        }}
      >
        <img
          src={backgroundImage}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#061633",
            gap: 20,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={betterInternshipLogo}
              alt="BetterInternship logo"
              width={92}
              height={92}
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
              }}
            />
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 0 }}>
              BetterInternship
            </span>
          </div>

          <div
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              maxWidth: 980,
              color: "#061633",
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: 0,
              textAlign: "center",
            }}
          >
            {job.title}
          </div>

          <div
            style={{
              color: "#345064",
              fontSize: 30,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {employerName}
          </div>

          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                maxWidth: 980,
              }}
            >
              {tags.map((tag, i) => (
                <div
                  key={`${tag}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 999,
                    backgroundColor: "rgba(6, 22, 51, 0.08)",
                    border: "2px solid rgba(6, 22, 51, 0.16)",
                    color: "#061633",
                    fontSize: 24,
                    fontWeight: 600,
                    padding: "10px 22px",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>,
      {
        ...size,
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
        fonts: [
          {
            name: "Space Grotesk",
            data: spaceGroteskMedium,
            weight: 500,
            style: "normal",
          },
          {
            name: "Space Grotesk",
            data: spaceGroteskBold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );
  } catch {
    return fallback();
  }
}
