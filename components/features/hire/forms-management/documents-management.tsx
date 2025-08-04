"use client";
import React, { useState } from "react";
import { Zap, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TrustModeTable from "@/components/features/hire/forms-management/trust-mode-table";
import JSZip from "jszip";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  src: string;
}

interface InternshipDataForm {
  prefix: string;
  baseName: string;
  pdfURL: string;
  interns: Student[];
}

interface InternshipCategory {
  id: string;
  title: string;
  forms: InternshipDataForm[];
}

const mockStudents = [
  {
    id: "bowei-gai",
    name: "Bowei Gai",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  },
  {
    id: "elara-vance",
    name: "Elara Vance",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    id: "liam-chen",
    name: "Liam Chen",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
  {
    id: "aria-kim",
    name: "Aria Kim",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
  },
  {
    id: "javier-rodriguez",
    name: "Javier Rodriguez",
    src: "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
  },
  {
    id: "sofia-petrov",
    name: "Sofia Petrov",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    id: "caleb-jones",
    name: "Caleb Jones",
    src: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
  },
  { id: "nora-patel", name: "Nora Patel", src: "" },
  {
    id: "owen-miller",
    name: "Owen Miller",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
];

const COMMON_PREFIX = "[DLSU-CCS-DIT] ";

const internshipData: InternshipCategory[] = [
  {
    id: "pre-deployment",
    title: "Pre-Deployment",
    forms: [
      {
        prefix: COMMON_PREFIX,
        baseName: "OJT Student MOA",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents.slice(0, 5), // 5 interns
      },
      {
        prefix: COMMON_PREFIX,
        baseName: "Internship Plan",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents.slice(2, 6), // 4 interns
      },
      {
        prefix: COMMON_PREFIX,
        baseName: "Training Plan",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents.slice(0, 3), // 3 interns
      },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    forms: [
      {
        prefix: COMMON_PREFIX,
        baseName: "Weekly/Monthly Status Report",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents.slice(1, 8),
      },
      {
        prefix: COMMON_PREFIX,
        baseName: "Weekly/Monthly Attendance Sheet",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents.slice(1, 8),
      },
    ],
  },
  {
    id: "post-deployment",
    title: "Post-Deployment",
    forms: [
      {
        prefix: COMMON_PREFIX,
        baseName: "Certificate of Completion",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents,
      },
      {
        prefix: COMMON_PREFIX,
        baseName: "Certificate of Attendance",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents,
      },
      {
        prefix: COMMON_PREFIX,
        baseName: "Student Evaluation",
        pdfURL: "/Company_Information_Project_Details_Form.pdf",
        interns: mockStudents,
      },
    ],
  },
];

const DocumentsManagement = () => {
  const [isTrustMode, setIsTrustMode] = useState(false);
  const router = useRouter();

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.substring(url.lastIndexOf("/") + 1); // Extract filename from URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAutomateAndDownloadZip = async (form: InternshipDataForm) => {
    const zip = new JSZip();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    for (const intern of form.interns) {
      try {
        const response = await fetch(form.pdfURL);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${form.pdfURL}: ${response.statusText}`
          );
        }
        const pdfBlob = await response.blob();

        // Format intern name for filename: FirstLast
        const internNameFormatted = intern.name.replace(/\s/g, "");

        // Construct filename: PREFIX, DocumentName(FirstLast_Date).pdf
        const filename = `${form.prefix}${form.baseName}(${internNameFormatted}_${today}).pdf`;
        zip.file(filename, pdfBlob);
      } catch (error) {
        console.error(`Error processing document for ${intern.name}:`, error);
        // Optionally, add a placeholder or log an error in the UI
      }
    }

    if (form.interns.length > 0) {
      zip
        .generateAsync({ type: "blob" })
        .then((content) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = `${form.prefix}${form.baseName}_Automated_Forms.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("Error generating zip file:", error);
        });
    } else {
      console.warn("No interns found for this form to automate.");
    }
  };

  router.push("/dashboard");
  return <></>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Internship Forms Automation
      </h1>

      {/*       <div className="relative flex flex-row justify-center w-full py-8">
        <Image
          className="invisible relative"
          src={hire_coming_soon}
          alt={"Forms Automation Preview"}
        ></Image>
        <Image
          className="absolute mt-4"
          src={hire_coming_soon}
          alt={"Forms Automation Preview"}
        ></Image>
        <div className="absolute p-4 w-full h-[100%] rounded-md border border-gray-300 ">
          <div className="relative flex flex-row items-center justify-center w-full h-[100%] backdrop-blur-[3px] bg-opacity-25 bg-gray-300 rounded-md">
            <div className="relative w-full text-8xl font-bold text-center bg-white bg-opacity-70 p-12 px-12 rounded-sm text-gray-600 top-[-100]">
              Coming soon!
            </div>
          </div>
        </div>
      </div> */}
      {/* Hidden for now, remove hidden class to show trust mode table */}
      {/* <ModeToggle
        isTrustMode={isTrustMode}
        onToggle={setIsTrustMode}
        className="hidden"
      /> */}

      {isTrustMode ? (
        <TrustModeTable
          students={mockStudents}
          internshipData={internshipData}
        />
      ) : (
        // <></> // ! to remove line
        // <></> // ! to remove line
        <Accordion
          type="multiple"
          defaultValue={internshipData.map((category) => category.id)}
          className="w-full"
        >
          {internshipData.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="mb-4 border rounded-lg shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 text-lg sm:text-xl font-semibold hover:no-underline">
                {category.title}
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <Card className="border-none shadow-none rounded-t-none p-3">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%] sm:w-[50%]">
                            Form Name
                          </TableHead>
                          <TableHead className="w-[30%] sm:w-[30%]">
                            Forms Needed By
                          </TableHead>
                          <TableHead className="w-[30%] sm:w-[20%] text-center">
                            Automate
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.forms.map((form, formIndex) => (
                          <TableRow key={formIndex}>
                            <TableCell className="font-medium py-3">
                              <a
                                href={form.pdfURL}
                                download
                                className="text-blue-600 hover:underline flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="break-words">
                                  {form.prefix}
                                  {form.baseName}
                                </span>
                              </a>
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center -space-x-2">
                                {form.interns
                                  .slice(0, 3)
                                  .map((intern, internIndex) => (
                                    <Tooltip key={internIndex}>
                                      <TooltipTrigger asChild>
                                        <Avatar className="h-7 w-7 border-2 border-background">
                                          <AvatarImage
                                            src={intern.src}
                                            alt={intern.name}
                                          />
                                          <AvatarFallback className="text-xs">
                                            {intern.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{intern.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                {form.interns.length > 3 && (
                                  <span className="ml-3 text-sm text-gray-500">
                                    ..... and {form.interns.length - 3} others
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleAutomateAndDownloadZip(form)
                                    }
                                    className="h-8 w-8"
                                  >
                                    <Zap className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Automate & Download All Pre-filled Forms
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default DocumentsManagement;
