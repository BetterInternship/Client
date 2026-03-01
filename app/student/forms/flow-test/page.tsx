"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";

type Template = {
  id: string;
  title: string;
  tags: string[];
};

type Recipient = {
  title: string;
  value: string;
};

const templates: Template[] = [
  {
    id: "student-moa",
    title: "Student MOA (CS-ST)",
    tags: ["Deployment", "Required"],
  },
  {
    id: "annex-a",
    title: "Internship Annex A (CS-ST)",
    tags: ["Deployment", "Compliance"],
  },
  {
    id: "company-info",
    title: "Company Info Sheet (CS-ST)",
    tags: ["Pre-deployment", "Information"],
  },
  {
    id: "student-moa2",
    title: "Student MOA (CS-ST)",
    tags: ["Deployment", "Required"],
  },
  {
    id: "annex-a2",
    title: "Internship Annex A (CS-ST)",
    tags: ["Deployment", "Compliance"],
  },
  {
    id: "company-info2",
    title: "Company Info Sheet (CS-ST)",
    tags: ["Pre-deployment", "Information"],
  },
];

const recipientsByTemplate: Record<string, Recipient[]> = {
  "student-moa": [
    { title: "Student", value: "You" },
    {
      title: "Company/Organization Internship Point Person",
      value: "pointperson@company.com",
    },
    {
      title: "Company/Organization Representative",
      value: "mo*************p@gmail.com",
    },
    {
      title: "Company/Organization Internship Supervisor",
      value: "mo*************p@gmail.com",
    },
    {
      title: "Student Guardian",
      value: "mo**************d@gmail.com",
    },
    {
      title: "Department Internship Coordinator",
      value: "ja***********o@dlsu.edu.ph",
    },
  ],
  "annex-a": [
    { title: "Student", value: "You" },
    {
      title: "Company/Organization Internship Supervisor",
      value: "mo*************p@gmail.com",
    },
    {
      title: "Department Internship Coordinator",
      value: "ja***********o@dlsu.edu.ph",
    },
    {
      title: "College Internship Coordinator",
      value: "co***********r@dlsu.edu.ph",
    },
  ],
  "company-info": [
    {
      title: "Student",
      value: "No signatures required for this template.",
    },
  ],
};

export default function FlowTestPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId],
  );
  const recipients = recipientsByTemplate[selectedTemplateId] ?? [];

  return (
    <div className="h-full min-h-0 w-full bg-gray-50">
      <div className="h-[2px] w-full bg-gray/60" />

      <div className="grid h-[calc(100%-2px)] min-h-0 grid-cols-[480px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-gray-300 bg-white md:border-b-0 md:border-r">
          <div className="flex h-20 items-center bg-gray-50 border-b border-gray-200 px-10">
            <h1 className="text-2xl tracking-tight text-gray-700 sm:text-2xl font-bold">
              Form Templates
            </h1>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {templates.map((template) => {
                const isActive = template.id === selectedTemplateId;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className="w-full text-left"
                  >
                    <Card
                      className={cn(
                        "border transition",
                        isActive
                          ? "border-primary/40 ring-1 ring-primary/30 bg-primary/15"
                          : "border-gray-200 hover:bg-primary/5",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl">
                            {template.title}
                          </h2>
                        </div>
                        <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge
                            key={tag}
                            type="accent"
                            className="border-gray-400 opacity-75"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 bg-gray-100">
            <div className="mx-auto flex max-w-4xl flex-col gap-4 bg-white h-full px-12 py-20">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {selectedTemplate?.title}
                </h3>
                <Divider />
              </div>
              <div className="text-xl mt-4">
                These people will receive a copy of this form, in this order:
              </div>
              <Timeline>
                {recipients.map((recipient, index) => (
                  <TimelineItem
                    key={recipient.title}
                    number={index + 1}
                    title={
                      <span className="text-base text-gray-700 sm:text-lg">
                        {recipient.title}
                      </span>
                    }
                    subtitle={
                      (index === 1 || index === 4) && (
                        <span className="text-warning font-bold text-sm">
                          {"you will specify this email"}
                        </span>
                      )
                    }
                    isLast={index === recipients.length - 1}
                  />
                ))}
              </Timeline>
              <div className="flex flex-col items-start gap-3 border-t border-gray-200 pt-4 mt-8">
                <div className="flex flex-row gap-2">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-black opacity-80 hover:bg-black/70 text-lg"
                  >
                    Preview PDF
                  </Button>
                  <Button size="lg" className="w-full sm:w-auto text-lg">
                    Sign via BetterInternship
                  </Button>
                </div>
                <Button variant="link" className="h-auto p-0 sm:text-base">
                  or print for wet signature instead
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
