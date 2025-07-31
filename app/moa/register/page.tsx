"use client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/EditForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "../components/card";
import { Upload } from "lucide-react";

// ! unimplemented
export const Page = () => {
  const [s, setS] = useState({
    name: "",
    ba: "",
    cp: "",
    phone: "",
    cpEmail: "",
    cpPhone: "",
    permit: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setter = (field: string) => (value: string) =>
    setS({ ...s, [field]: value });

  return (
    <div className="w-[100vw] min-h-screen flex flex-col justify-left items-start p-24 py-32 gap-8">
      <div className="font-bold text-5xl tracking-tighter text-gray-700 text-left min-w-[600px]">
        Welcome to the DLSU MOA portal!
      </div>
      <div className="text-gray-700 text-xl">
        Start or manage your Memorandum of Agreement with De La Salle University
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Company Name"
          value={s.name}
          setter={setter("name")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
        <FormInput
          label="Company Address"
          value={s.ba}
          setter={setter("ba")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
        <FormInput
          label="Company Phone"
          value={s.phone}
          setter={setter("phone")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
        <FormInput
          label="Contact Person"
          value={s.cp}
          setter={setter("cp")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
        <FormInput
          label="Contact Person Email"
          value={s.cpEmail}
          setter={setter("cpEmail")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
        <FormInput
          label="Contact Person Phone"
          value={s.cpPhone}
          setter={setter("cpPhone")}
          className="border-gray-400 placeholder-gray-200 w-96"
          placeholder="---"
          required={false}
        />
      </div>
      <div className="flex flex-row gap-2">
        <Button className="w-fit h-fit p-0" variant="outline">
          <Card className="w-64">
            <div className="flex flex-col items-start justify-start gap-2">
              <Upload className="!w-8 !h-8" />
              Company Registration
            </div>
          </Card>
        </Button>
        <Button className="w-fit h-fit p-0" variant="outline">
          <Card className="w-64">
            <div className="flex flex-col items-start justify-start gap-2">
              <Upload className="!w-8 !h-8" />
              BIR Registration
            </div>
          </Card>
        </Button>
        <Button className="w-fit h-fit p-0" variant="outline">
          <Card className="w-64">
            <div className="flex flex-col items-start justify-start gap-2">
              <Upload className="!w-8 !h-8" />
              Business Permit{" "}
            </div>
          </Card>
        </Button>
      </div>
      <Button
        size="lg"
        type="button"
        scheme="supportive"
        disabled={loading}
        onClick={() => {
          setLoading(true);
          router.push("/dashboard");
        }}
      >
        {loading ? "Checking..." : "Continue"}
      </Button>
    </div>
  );
};

export default Page;
