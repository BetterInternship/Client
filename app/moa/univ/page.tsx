"use client";

import { useRouter } from "next/navigation";
import { Card } from "../components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { useState } from "react";
import { Download, Search, SendHorizonal } from "lucide-react";
import { APIClient, APIRoute } from "@/lib/api/api-client";
import { FormInput } from "@/components/EditForm";

export default function DashboardPage() {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [denying, setDenying] = useState(false);
  const [sending, setSending] = useState(false);
  const [company, setCompany] = useState<{
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    tin: string;
  }>();
  const requests = [
    {
      id: "VXZb0VYY2JqPC2ZKyEQHr",
      name: "Aurora Systems",
      contactPerson: "Isabel Reyes",
      email: "isabel.reyes@aurorasystems.ph",
      tin: "453-219-874-000",
      industry: "IT Services",
      reason:
        "We're looking to cultivate a strong local talent pipeline and offer students exposure to enterprise-scale IT systems early in their careers.",
      date: "12/02/2024",
    },
    {
      id: "Y6aENQxhBNE5s5JjKwqZw",
      name: "Nimbus Dynamics",
      contactPerson: "Carlos Santos",
      email: "carlos.santos@nimbusdynamics.ph",
      tin: "824-153-697-000",
      industry: "Cloud Computing",
      reason:
        "We want to work with students who are passionate about cloud technologies and help them build the skills needed in modern DevOps environments.",
      date: "28/07/2023",
    },
    {
      id: "bdtVgOAxXDPRKc1vSPWJU",
      name: "Zenith Labs",
      contactPerson: "Lara Mendoza",
      email: "lara.mendoza@zenithlabs.ph",
      tin: "201-745-963-000",
      industry: "Biotechnology",
      reason:
        "Partnering with universities helps us support scientific research while giving students firsthand experience in a commercial biotech setting.",
      date: "05/10/2022",
    },
    {
      id: "4CDYbdGk2Rcv6i0jUwPfM",
      name: "Silverline Innovations",
      contactPerson: "Miguel Fernandez",
      email: "miguel.fernandez@silverline.ph",
      tin: "398-120-587-000",
      industry: "Electronics Manufacturing",
      reason:
        "We believe internships can ignite interest in hardware engineering, and we're eager to mentor the next generation of electronics innovators.",
      date: "17/06/2023",
    },
    {
      id: "zHFpqkEC68oHlFuGs9joY",
      name: "BrightForge Technologies",
      contactPerson: "Andrea Cruz",
      email: "andrea.cruz@brightforge.ph",
      tin: "526-884-172-000",
      industry: "Software Development",
      reason:
        "We aim to bridge the gap between classroom theory and production-grade software development by involving students in real product work.",
      date: "09/03/2024",
    },
    {
      id: "TTdBAodB2ukr1Ih3a5rJx",
      name: "BluePeak Ventures",
      contactPerson: "Nathaniel Tan",
      email: "nathaniel.tan@bluepeak.ph",
      tin: "130-759-218-000",
      industry: "Venture Capital",
      reason:
        "We want to introduce students to the startup ecosystem and help them gain exposure to business development, fundraising, and innovation strategy.",
      date: "23/08/2022",
    },
    {
      id: "JQOG5vbrBvUpEvUcc6Im5",
      name: "Evercrest Solutions",
      contactPerson: "Monica dela Cruz",
      email: "monica.delacruz@evercrest.ph",
      tin: "915-632-471-000",
      industry: "Business Consulting",
      reason:
        "We’re seeking to involve students in strategic consulting projects to give them real-world problem-solving experience across industries.",
      date: "15/04/2023",
    },
    {
      id: "PZbbVhffokMD5bIPCVhHb",
      name: "Quantix Group",
      contactPerson: "Joshua Villanueva",
      email: "joshua.villanueva@quantix.ph",
      tin: "304-847-926-000",
      industry: "Data Analytics",
      reason:
        "We want to empower students with practical data analysis projects and give them experience working with real datasets and business challenges.",
      date: "04/01/2024",
    },
    {
      id: "J9cQAGMuPMrHbZReLZXyo",
      name: "Cloudharbor Inc.",
      contactPerson: "Samantha Ong",
      email: "samantha.ong@cloudharbor.ph",
      tin: "768-904-352-000",
      industry: "Web Hosting",
      reason:
        "We're excited to give students a deeper understanding of server infrastructure, domain management, and site reliability engineering.",
      date: "27/11/2022",
    },
    {
      id: "YwwiKj8pb5dsOCClBNktg",
      name: "Vertex Edge",
      contactPerson: "Daniel Soriano",
      email: "daniel.soriano@vertexedge.ph",
      tin: "143-620-790-000",
      industry: "AI & Machine Learning",
      reason:
        "We’re hoping to collaborate with students on machine learning research and provide them access to real use cases involving NLP and computer vision.",
      date: "31/05/2024",
    },
    {
      id: "NMG94cR3wYdVvkhP6I6z1",
      name: "Oakridge Analytics",
      contactPerson: "Julia Ramos",
      email: "julia.ramos@oakridgeanalytics.ph",
      tin: "272-508-194-000",
      industry: "Market Research",
      reason:
        "Interns can contribute to our ongoing market studies and gain hands-on exposure to survey design, fieldwork coordination, and data synthesis.",
      date: "13/09/2023",
    },
    {
      id: "i1HMFgMrFJ6D4cRRkWep1",
      name: "Stratus One",
      contactPerson: "Christian Lim",
      email: "christian.lim@stratusone.ph",
      tin: "369-281-604-000",
      industry: "Telecommunications",
      reason:
        "We want to offer students real-world exposure to network operations, customer service strategies, and telecom infrastructure development.",
      date: "07/12/2022",
    },
    {
      id: "u9Au4xGjj8K34aYfUI8wu",
      name: "NeoFusion Enterprises",
      contactPerson: "Patricia Navarro",
      email: "patricia.navarro@neofusion.ph",
      tin: "657-742-318-000",
      industry: "Renewable Energy",
      reason:
        "We’re passionate about sustainability and eager to involve students in clean energy initiatives that impact local communities.",
      date: "19/01/2024",
    },
  ];

  return (
    <TabGroup>
      <Tab name="Dashboard">
        <div className="w-[100vw] h-[100vh] overflow-auto">
          <div className="w-[100vw] min-h-screen flex flex-col justify-left items-center">
            <div className="w-fit min-h-screen flex flex-col justify-left items-start p-20 py-28 gap-8">
              <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
                DLSU MOA Management Dashboard
              </div>
              <div className="text-gray-700 text-xl">
                Overview of MOA requests, company registrations, and activity
                logs.
              </div>
              <div className="flex flex-row items-start gap-2">
                <Button variant="outline" className="w-fit h-fit p-0">
                  <Card className="p-8 w-prose max-w-prose w-64">
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="text-7xl font-bold tracking-tighter text-gray-500 text-left">
                        21
                      </div>
                      <Badge type="supportive" className="w-fit">
                        New Companies
                      </Badge>
                    </div>
                  </Card>
                </Button>
                <Button variant="outline" className="w-fit h-fit p-0">
                  <Card className="p-8 w-prose max-w-prose w-64">
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="text-7xl font-bold tracking-tighter text-gray-500 text-left">
                        12
                      </div>
                      <Badge type="warning" className="w-fit">
                        MOA Requests
                      </Badge>
                    </div>
                  </Card>
                </Button>
                <Button variant="outline" className="w-fit h-fit p-0">
                  <Card className="p-8 w-prose max-w-prose w-64">
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="text-7xl font-bold tracking-tighter text-gray-500 text-left">
                        1249
                      </div>
                      <Badge type="accent" className="w-fit">
                        Total Companies
                      </Badge>
                    </div>
                  </Card>
                </Button>
                <Button variant="outline" className="w-fit h-fit p-0">
                  <Card className="p-8 w-prose max-w-prose w-64">
                    <div className="flex flex-col gap-4 justify-start">
                      <div className="text-7xl font-bold tracking-tighter text-gray-500 text-left">
                        1023
                      </div>
                      <Badge type="primary" className="w-fit">
                        Active MOAs
                      </Badge>
                    </div>
                  </Card>
                </Button>
              </div>
              <Card>
                <table className="table-fixed w-full text-sm font-mono border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="w-36 px-4 py-2 text-left border-b border-gray-300">
                        Date
                      </th>
                      <th className="w-56 px-4 py-2 text-left border-b border-gray-300">
                        Company
                      </th>
                      <th className="w-64 px-4 py-2 text-left border-b border-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-30</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Orion Technologies</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA approved</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-29</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>QuantumWare Ltd</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA requested</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-28</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>NovaEdge Corp</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Company blacklisted</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-27</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Horizon Systems</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA renewed</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-26</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Nexa Solutions</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA approved</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-25</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>TerraTech Inc</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA requested</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-24</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Fusion Dynamics</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>New Company Registration</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-23</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Zenith Innovations</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA renewed</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-22</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Stratos Labs</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA approved</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-21</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Apex Global</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA requested</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-20</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Skyline Ventures</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Company blacklisted</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-19</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Voltura Analytics</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA renewed</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-18</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Arcadia Robotics</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA approved</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-17</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Nimbus AI</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA requested</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-16</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Helixon Group</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>New Company Registration</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-15</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Polaris Technologies</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA renewed</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-14</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Synerbyte Corp</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA approved</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-13</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Equinox Systems</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>MOA requested</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-12</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Lumenix Inc</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>Company blacklisted</pre>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-1 border-b">
                        <pre>2025-07-11</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>BlueNova Solutions</pre>
                      </td>
                      <td className="px-4 py-1 border-b">
                        <pre>New Company Registration</pre>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </div>
      </Tab>
      <Tab name="Companies">
        <div className="w-[100vw] h-[100vh] flex flex-row">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2 p-2 px-8">
              <Search />
              <FormInput placeholder="Search company..." />
            </div>
            <div className="flex flex-col items-start justify-start">
              {requests.map((request) => {
                return (
                  <Button
                    scheme="default"
                    variant="outline"
                    className="overflow-hidden w-full text-left justify-start h-12"
                    onClick={() => setCompany(request)}
                  >
                    <div className="flex flex-col text-left justify-left p-4">
                      <span className="text-lg tracking-tighter">
                        {request.name}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="p-8">
            {company && (
              <div className="flex flex-col gap-2">
                <Card>
                  <div className="font-bold text-2xl mb-4">MOA Details</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">MOA Status:</div>
                      <div className="w-64 max-w-64">Active</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">Valid Until:</div>
                      <div className="w-64 max-w-64">02/15/26</div>
                    </div>
                  </div>
                  <a
                    href="https://api.dev.betterinternship.com/api/services/sample-signed"
                    className="underline"
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      scheme="primary"
                      className="w-fit mt-4"
                    >
                      Download MOA
                      <Download />
                    </Button>
                  </a>
                </Card>
                <Card>
                  <div className="font-bold text-2xl mb-4">Company Details</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">Company Name:</div>
                      <div className="w-64 max-w-64">{company.name}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">TIN:</div>
                      <div className="w-64 max-w-64">{company.tin}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">Contact Person:</div>
                      <div className="w-64 max-w-64">
                        {company.contactPerson}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">Email Address:</div>
                      <div className="w-64 max-w-64">{company.email}</div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="w-64 max-w-64">Industry:</div>
                      <div className="w-64 max-w-64">{company.industry}</div>
                    </div>
                  </div>
                  <br />

                  <div className="font-bold text-2xl mb-2">
                    Company Documents
                  </div>
                  <div className="flex flex-row gap-1">
                    <a
                      href="https://api.dev.betterinternship.com/api/services/sample-signed"
                      className="underline"
                      target="_blank"
                    >
                      <Button
                        variant="outline"
                        scheme="primary"
                        className="w-full"
                      >
                        Business Permit
                        <Download />
                      </Button>
                    </a>
                    <a
                      href="https://api.dev.betterinternship.com/api/services/sample-signed"
                      className="underline"
                      target="_blank"
                    >
                      <Button
                        variant="outline"
                        scheme="primary"
                        className="w-full"
                      >
                        Company Incorporation
                        <Download />
                      </Button>
                    </a>
                    <a
                      href="https://api.dev.betterinternship.com/api/services/sample-signed"
                      className="underline"
                      target="_blank"
                    >
                      <Button
                        variant="outline"
                        scheme="primary"
                        className="w-full"
                      >
                        BIR Permit
                        <Download />
                      </Button>
                    </a>
                  </div>
                </Card>
                <Card>
                  <pre>
                    [08/21/2024] MOA Renewed <br />
                    [01/20/2023] MOA Renewed <br />
                    [12/10/2022] MOA Requested <br />
                    [12/01/2022] Company Registered <br />
                  </pre>
                </Card>
                <Button scheme="destructive" variant="outline">
                  Blacklist Company
                </Button>
              </div>
            )}
          </div>
        </div>
      </Tab>
      <Tab name="Company Verification">
        <div className="relative flex flex-row">
          <div className="w-80 border-r h-[85vh] overflow-auto max-h-[85vh]">
            <div className="flex flex-col items-start justify-start">
              {requests.map((request) => {
                return (
                  <Button
                    scheme="default"
                    variant="outline"
                    className="overflow-hidden w-full text-left justify-start h-20"
                    onClick={() => setCompany(request)}
                  >
                    <div className="flex flex-col text-left justify-left p-4">
                      <span className="text-lg tracking-tighter">
                        {request.name}
                      </span>
                      <span className="text-gray-500 italic">
                        {request.date}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-16 gap-8">
            {company && (
              <Card>
                <div className="font-bold text-2xl mb-4">Company Details</div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <div className="w-64 max-w-64">Company Name:</div>
                    <div className="w-64 max-w-64">{company.name}</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="w-64 max-w-64">TIN:</div>
                    <div className="w-64 max-w-64">{company.tin}</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="w-64 max-w-64">Contact Person:</div>
                    <div className="w-64 max-w-64">{company.contactPerson}</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="w-64 max-w-64">Email Address:</div>
                    <div className="w-64 max-w-64">{company.email}</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div className="w-64 max-w-64">Industry:</div>
                    <div className="w-64 max-w-64">{company.industry}</div>
                  </div>
                </div>
                <br />

                <div className="font-bold text-2xl mb-2">Company Documents</div>
                <div className="flex flex-row gap-1">
                  <a
                    href="https://api.dev.betterinternship.com/api/services/sample-signed"
                    className="underline"
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      scheme="primary"
                      className="w-full"
                    >
                      Business Permit
                      <Download />
                    </Button>
                  </a>
                  <a
                    href="https://api.dev.betterinternship.com/api/services/sample-signed"
                    className="underline"
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      scheme="primary"
                      className="w-full"
                    >
                      Company Incorporation
                      <Download />
                    </Button>
                  </a>
                  <a
                    href="https://api.dev.betterinternship.com/api/services/sample-signed"
                    className="underline"
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      scheme="primary"
                      className="w-full"
                    >
                      BIR Permit
                      <Download />
                    </Button>
                  </a>
                </div>
              </Card>
            )}
          </div>
          <div className="absolute translate-y-28 ml-80 h-[30vh] bottom-[20vh] border-t border-gray-400 w-full p-8 bg-white z-[1000]">
            <div className="tracking-tight mb-2">Request for Response:</div>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full max-w-xl border border-gray-400 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
                maxLength={1000}
              />
              <Button scheme="secondary" variant="outline" className="w-fit">
                Send
                <SendHorizonal />
              </Button>
            </div>
            <br />
            <div>Final Decision:</div>
            <div className="flex flex-row gap-2 mt-2">
              <Button scheme="supportive" size="lg">
                Approve
              </Button>
              <Button scheme="destructive" size="lg">
                Deny
              </Button>
            </div>
          </div>
        </div>
      </Tab>
      <Tab name="MOA Request">
        <div className="relative flex flex-row">
          <div className="w-80 border-r h-[85vh] overflow-auto max-h-[85vh]">
            <div className="flex flex-col items-start justify-start">
              {requests.map((request) => {
                return (
                  <Button
                    scheme="default"
                    variant="outline"
                    className="overflow-hidden w-full text-left justify-start h-20"
                    onClick={() => setCompany(request)}
                  >
                    <div className="flex flex-col text-left justify-left p-4">
                      <span className="text-lg tracking-tighter">
                        {request.name}
                      </span>
                      <span className="text-gray-500 italic">
                        {request.date}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="w-[100vw] max-h-[50vh] flex flex-col justify-left items-start p-16 gap-8 overflow-auto">
            {company && (
              <>
                <div>MOA Request History</div>
                <Timeline />
              </>
            )}
          </div>
          <div className="absolute translate-y-60 ml-80 h-[30vh] bottom-[20vh] border-t border-gray-400 w-full p-8 bg-white z-[1000]">
            <div className="tracking-tight mb-2">Request for Response:</div>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full max-w-xl border border-gray-400 rounded-[0.25em] p-3 px-5 text-sm min-h-24 resize-none focus:border-opacity-70 focus:ring-transparent"
                maxLength={1000}
              />
              <Button
                scheme="secondary"
                variant="outline"
                className="w-fit"
                onClick={async () => {
                  setSending(true);
                  APIClient.post<{}>(APIRoute("services").r("email").build(), {
                    to: "modavid.1964@gmail.com",
                    from: "hello@betterinternship.com",
                    fromName: "DLSU Legal via BetterInternship",
                    content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 2rem;">
  <table style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ccc; border-radius: 6px; padding: 2rem;">
    <tr>
      <td style="font-size: 24px; font-weight: bold; color: #f4b942; padding-bottom: 1rem;">
        📝 Additional Information Required
      </td>
    </tr>
    <tr>
      <td style="font-size: 14px; color: #333;">
        <p>Dear XYZ Industries Team,</p>
        <p>Thank you for submitting your MOA request to De La Salle University. After our initial review, we need additional information to proceed with your application.</p>
        <p><strong>Request Details:</strong><br>
        • Request ID: #MOA-2024-001235<br>
        • Company: XYZ Industries<br>
        • MOA Type: Negotiated Partnership Agreement<br>
        • Submission Date: January 20, 2025</p>

        <p><strong>Required Information:</strong><br>
        We need more details regarding Section 1.2 of your proposal concerning intellectual property rights. Please clarify the ownership terms for research outputs and provide additional details about the partnership duration.</p>

        <p>Please log in to your MOA Portal account to respond to our comments and upload any additional documentation.</p>

        <p style="text-align: center; margin-top: 2rem;">
          <a href=${
            process.env.NEXT_PUBLIC_DUMMY_URL /* // ! remove later */
          } target="_blank" style="display: inline-block; background-color: #4ba2c8; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: bold;">
            Click here to respond
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
                    subject: "MOA - Additional Information Required",
                    apiKey:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
                  })
                    .then(() => {
                      alert("Message sent");
                      setSending(false);
                    })
                    .catch(() => setSending(false));
                }}
              >
                {denying ? "Sending..." : "Send"}
                <SendHorizonal />
              </Button>
            </div>
            <br />
            <div>Final Decision:</div>
            <div className="flex flex-row gap-2 mt-2">
              <Button
                scheme="supportive"
                size="lg"
                onClick={async () => {
                  setApproving(true);
                  APIClient.post<{}>(APIRoute("services").r("email").build(), {
                    to: "modavid.1964@gmail.com",
                    from: "hello@betterinternship.com",
                    fromName: "DLSU Legal via BetterInternship",
                    content: `
                    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MOA Request Approved</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color: white;
      max-width: 600px;
      margin: 40px auto;
      border: 1px solid #d3d3d3;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      align-items: center;
      font-size: 20px;
      color: #38a169;
      margin-bottom: 24px;
    }
    .header-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .details {
      font-size: 15px;
      color: #333;
      line-height: 1.6;
    }
    .details ul {
      padding-left: 20px;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #4299e1;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .footer {
      font-size: 13px;
      color: #666;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div className="email-container">
    <div className="header">
      <span className="header-icon">✅</span>
      <strong>MOA Request Approved!</strong>
    </div>

    <div className="details">
      <p>Dear ABC Corporation Team,</p>
      <p>Congratulations! Your Memorandum of Agreement (MOA) request has been successfully approved by De La Salle University.</p>
      <p>Your MOA is now active and ready for implementation. Below are the details:</p>
      <ul>
        <li><strong>Request ID:</strong> #MOA-2024-001234</li>
        <li><strong>MOA Type:</strong> Standard Partnership Agreement</li>
        <li><strong>Approval Date:</strong> January 30, 2025</li>
        <li><strong>Effective Date:</strong> February 1, 2025</li>
        <li><strong>Expiration Date:</strong> February 1, 2028</li>
      </ul>
      <p>You can download your signed MOA document using the link below:</p>
      <a href="https://api.dev.betterinternship.com/api/services/sample-signed" target="_blank" className="button">📄 Download MOA</a>

      <div className="footer">
        <p>Best regards,</p>
        <p>De La Salle University<br>
        Partnership & Legal Affairs Office</p>
        <p>For questions, contact: <a href="mailto:partnerships@dlsu.edu.ph">partnerships@dlsu.edu.ph</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`,
                    subject: "MOA Accepted",
                    apiKey:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
                  })
                    .then(() => {
                      alert("Company approved");
                      setApproving(false);
                    })
                    .catch(() => setApproving(false));
                }}
              >
                {approving ? "Approving..." : "Approve"}
              </Button>
              <Button
                scheme="destructive"
                size="lg"
                onClick={async () => {
                  setDenying(true);
                  APIClient.post<{}>(APIRoute("services").r("email").build(), {
                    to: "modavid.1964@gmail.com",
                    from: "hello@betterinternship.com",
                    fromName: "DLSU Legal via BetterInternship",
                    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MOA Request Denied</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f8f8; margin: 0; padding: 2rem;">
  <table style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ccc; border-radius: 6px; padding: 2rem;">
    <tr>
      <td style="font-size: 24px; font-weight: bold; color: #d56a6a; padding-bottom: 1rem;">
        ❌ MOA Request Denied
      </td>
    </tr>
    <tr>
      <td style="font-size: 14px; color: #333;">
        <p>Dear GlobalTech Inc Team,</p>
        <p>We regret to inform you that your MOA request has been denied after careful review by our legal team.</p>

        <p><strong>Request Details:</strong><br>
        • Request ID: #MOA-2024-001236<br>
        • Company: GlobalTech Inc<br>
        • MOA Type: Custom Partnership Agreement<br>
        • Submission Date: January 18, 2025</p>

        <p><strong>Reason for Denial:</strong><br>
        The proposed terms do not align with university policies regarding data ownership and research collaboration frameworks. The intellectual property clauses present conflicts with our existing research guidelines.</p>

        <p><strong>Next Steps:</strong><br>
        If you believe this decision was made in error or would like to discuss alternative partnership arrangements, please contact our Partnership Office at <a href="mailto:partnerships@dlsu.edu.ph">partnerships@dlsu.edu.ph</a>.</p>

        <p>We appreciate your interest in partnering with De La Salle University and encourage you to consider resubmitting with revised terms that align with our partnership guidelines.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`,
                    subject: "MOA Request Denied",
                    apiKey:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
                  })
                    .then(() => {
                      alert("Company denied");
                      setDenying(false);
                    })
                    .catch(() => setDenying(false));
                }}
              >
                {denying ? "Denying..." : "Deny"}
              </Button>
            </div>
          </div>
        </div>
      </Tab>
    </TabGroup>
  );
}

const timelineData = [
  {
    side: "employer",
    date: "May 25, 2025",
    title: "Employer MOA Revision Request",
    content:
      "The MOA needs to be edited to align with our company's NDA policy to ensure consistency in confidentiality obligations and prevent conflicts.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "university",
    date: "May 27, 2025",
    title: "University Feedback",
    content:
      "The proposed edits are acceptable, but ensure that the NDA is mutual. See revised language in document attached.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "employer",
    date: "May 28, 2025",
    title: "Employer Response",
    content:
      "Confirmed. The NDA has been adjusted to reflect mutual protection as per your request.",
    file: {
      name: "revised_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "university",
    date: "May 29, 2025",
    title: "University Feedback",
    content:
      "Looks like there was a mistype on the Section 3 header. I fixed it. Please see attached.",
    file: {
      name: "corrected_section3.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
  {
    side: "employer",
    date: "May 30, 2025",
    title: "Employer Response",
    content:
      "We agree with the changes. Here is the final draft with our signatories filled in.",
    file: {
      name: "final_moa.pdf",
      url: "https://api.dev.betterinternship.com/api/services/sample-signed",
    },
  },
];

const Timeline = () => {
  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl relative">
        {/* Timeline Items */}
        <div className="relative">
          {timelineData.map((item, index) => (
            <div
              key={index}
              className={`relative flex justify-${
                item.side === "employer" ? "start" : "end"
              } items-center w-full mb-2`}
            >
              <div
                className={`w-1/2 px-4 ${
                  item.side === "employer"
                    ? "text-left self-start"
                    : "text-right self-end"
                }`}
              >
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">{item.date}</div>
                  <div className="font-semibold text-gray-800 mb-1">
                    {item.title}
                  </div>
                  <div className="text-gray-700 text-sm leading-snug mb-2">
                    {item.content}
                  </div>
                  {item.file && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm hover:underline cursor-pointer">
                      <Download className="w-4 h-4" />
                      <a href={item.file.url} download target="_blank">
                        {item.file.name}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {/* Dot on the center line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full z-10"></div>
            </div>
          ))}

          {/* Center Line spanning only between first and last dots */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 z-0"
            style={{
              top: `calc(1.5rem + 0.5rem)`,
              bottom: `calc(3rem + 0.5rem)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
