import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";

const REPORT_FILES = {
  sample:
    "tiktok_hook_analysis_jazmin.chualife__r=1&_t=ZS-95pLZslyNsH-2.pdf",
  output: "Copy of hook_analysis_report (4)-1.pdf",
} as const;

type ReportKey = keyof typeof REPORT_FILES;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ report: string }> },
) {
  const { report } = await params;

  if (!(report in REPORT_FILES)) {
    notFound();
  }

  const fileName = REPORT_FILES[report as ReportKey];
  const filePath = path.join(
    process.cwd(),
    "app",
    "student",
    "super-listing",
    "sofi-ai",
    "assets",
    fileName,
  );
  const file = await readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
