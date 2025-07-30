"use client";

import { useRouter } from "next/navigation";
import { Card } from "../components/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tab, TabGroup } from "@/components/ui/tabs";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
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
    },
    {
      id: "Y6aENQxhBNE5s5JjKwqZw",
      name: "Nimbus Dynamics",
      contactPerson: "Carlos Santos",
      email: "carlos.santos@nimbusdynamics.ph",
      tin: "824-153-697-000",
    },
    {
      id: "bdtVgOAxXDPRKc1vSPWJU",
      name: "Zenith Labs",
      contactPerson: "Lara Mendoza",
      email: "lara.mendoza@zenithlabs.ph",
      tin: "201-745-963-000",
    },
    {
      id: "4CDYbdGk2Rcv6i0jUwPfM",
      name: "Silverline Innovations",
      contactPerson: "Miguel Fernandez",
      email: "miguel.fernandez@silverline.ph",
      tin: "398-120-587-000",
    },
    {
      id: "zHFpqkEC68oHlFuGs9joY",
      name: "BrightForge Technologies",
      contactPerson: "Andrea Cruz",
      email: "andrea.cruz@brightforge.ph",
      tin: "526-884-172-000",
    },
    {
      id: "TTdBAodB2ukr1Ih3a5rJx",
      name: "BluePeak Ventures",
      contactPerson: "Nathaniel Tan",
      email: "nathaniel.tan@bluepeak.ph",
      tin: "130-759-218-000",
    },
    {
      id: "JQOG5vbrBvUpEvUcc6Im5",
      name: "Evercrest Solutions",
      contactPerson: "Monica dela Cruz",
      email: "monica.delacruz@evercrest.ph",
      tin: "915-632-471-000",
    },
    {
      id: "PZbbVhffokMD5bIPCVhHb",
      name: "Quantix Group",
      contactPerson: "Joshua Villanueva",
      email: "joshua.villanueva@quantix.ph",
      tin: "304-847-926-000",
    },
    {
      id: "J9cQAGMuPMrHbZReLZXyo",
      name: "Cloudharbor Inc.",
      contactPerson: "Samantha Ong",
      email: "samantha.ong@cloudharbor.ph",
      tin: "768-904-352-000",
    },
    {
      id: "YwwiKj8pb5dsOCClBNktg",
      name: "Vertex Edge",
      contactPerson: "Daniel Soriano",
      email: "daniel.soriano@vertexedge.ph",
      tin: "143-620-790-000",
    },
    {
      id: "NMG94cR3wYdVvkhP6I6z1",
      name: "Oakridge Analytics",
      contactPerson: "Julia Ramos",
      email: "julia.ramos@oakridgeanalytics.ph",
      tin: "272-508-194-000",
    },
    {
      id: "i1HMFgMrFJ6D4cRRkWep1",
      name: "Stratus One",
      contactPerson: "Christian Lim",
      email: "christian.lim@stratusone.ph",
      tin: "369-281-604-000",
    },
    {
      id: "u9Au4xGjj8K34aYfUI8wu",
      name: "NeoFusion Enterprises",
      contactPerson: "Patricia Navarro",
      email: "patricia.navarro@neofusion.ph",
      tin: "657-742-318-000",
    },
  ];

  return (
    <TabGroup>
      <Tab name="Dashboard">
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
                      <Badge type="accent" className="text-ellipsis">
                        {request.id}
                      </Badge>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-16 gap-8">
            {company && (
              <Card>
                <div className="font-bold text-2xl mb-4">Request Details</div>
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
                    <div className="w-64 max-w-64">TIN Number:</div>
                    <div className="w-64 max-w-64">{company.tin}</div>
                  </div>
                </div>
                <br />

                <div className="font-bold text-2xl mb-2">Request Documents</div>
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
                      MOA
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
                      Business Permit
                    </Button>
                  </a>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Tab>
      <Tab name="Companies">
        <div className="w-[100vw] h-[100vh]"></div>{" "}
      </Tab>
      <Tab name="Company Verification">
        <div className="w-[100vw] h-[100vh]"></div>{" "}
      </Tab>
      <Tab name="MOA Request">
        <div className="w-[100vw] h-[100vh]"></div>{" "}
      </Tab>
    </TabGroup>
  );
}
