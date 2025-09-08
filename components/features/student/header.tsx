"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings,
  BookA,
  Heart,
  LogOut,
  HelpCircle,
  MessageCircleMore,
  Search,
  CheckIcon,
  ChevronRight,
  XIcon,
} from "lucide-react";
import { useAppContext } from "@/lib/ctx-app";
import { DropdownOption, GroupableNavDropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/shared/header";
import { useRoute } from "@/hooks/use-route";
import { MyUserPfp } from "@/components/shared/pfp";
import { getFullName, getMissingProfileFields } from "@/lib/utils/user-utils";
import { useProfile } from "@/lib/api/student.api";
import CompleteAccBanner from "@/components/features/student/CompleteAccBanner";
import { useAuthContext } from "@/lib/ctx-auth";
import Link from "next/link";
import { useConversations } from "@/hooks/use-conversation";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { useDetectClickOutside } from "react-detect-click-outside";

interface IJobFilter {
  position: string[];
  jobMode: string[];
  jobMoa: string[];
  jobWorkload: string[];
  jobAllowance: string[];
}
const JobFilterContext = createContext<IJobFilter>({} as IJobFilter);
const useJobFilter = () => useContext(JobFilterContext);

// ! move elsewhere
const JobPositionSelect = () => {
  const jobFilter = useJobFilter();

  // Sets the position in the filter context
  const positionSetter = (position: string, toggle: boolean) => {
    if (toggle) jobFilter?.position?.push(position);
    else
      jobFilter.position =
        jobFilter.position?.filter((p) => p !== position) ?? [];
  };

  const positionChecker = (position: string) => {
    console.log("checking: " + position);
    return jobFilter.position?.find((p) => p === position) ? true : false;
  };

  return (
    <div className="flex flex-col gap-2">
      <SubcategorySelect
        name="Computer Science"
        value={"Computer Science"}
        checked={positionChecker("Computer Science")}
        setter={positionSetter}
        suboptions={[
          {
            name: "Data Science/AI",
            value: "Data Science/AI",
            setter: positionSetter,
            checked: positionChecker("Data Science/AI"),
          },
          {
            name: "Cybersecurity",
            value: "Cybersecurity",
            setter: positionSetter,
            checked: positionChecker("Cybersecurity"),
          },
          {
            name: "Full Stack",
            value: "Full Stack",
            setter: positionSetter,
            checked: positionChecker("Full Stack"),
          },
          {
            name: "Backend",
            value: "Backend",
            setter: positionSetter,
            checked: positionChecker("Backend"),
          },
          {
            name: "Frontend",
            value: "Frontend",
            setter: positionSetter,
            checked: positionChecker("Frontend"),
          },
        ]}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Business"
        value="Business"
        setter={positionSetter}
        checked={positionChecker("Business")}
        suboptions={[
          {
            name: "Accounting/Finance",
            value: "Accounting/Finance",
            setter: positionSetter,
            checked: positionChecker("Accounting/Finance"),
          },
          {
            name: "HR/Administrative",
            value: "HR/Administrative",
            setter: positionSetter,
            checked: positionChecker("HR/Administrative"),
          },
          {
            name: "Marketing/Sales",
            value: "Marketing/Sales",
            setter: positionSetter,
            checked: positionChecker("Marketing/Sales"),
          },
          {
            name: "Business Development",
            value: "Business Development",
            setter: positionSetter,
            checked: positionChecker("Business Development"),
          },
          {
            name: "Operations",
            value: "Operations",
            setter: positionSetter,
            checked: positionChecker("Operations"),
          },
        ]}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Engineering"
        value="Engineering"
        setter={positionSetter}
        checked={positionChecker("Engineering")}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Others"
        value="Others"
        setter={positionSetter}
        checked={positionChecker("Others")}
        suboptions={[
          {
            name: "Legal",
            value: "Legal",
            setter: positionSetter,
            checked: positionChecker("Legal"),
          },
          {
            name: "Research",
            value: "Research",
            setter: positionSetter,
            checked: positionChecker("Research"),
          },
          {
            name: "Graphic Design",
            value: "Graphic Design",
            setter: positionSetter,
            checked: positionChecker("Graphic Design"),
          },
        ]}
      ></SubcategorySelect>
    </div>
  );
};

// ! move this elsewhere
const JobDetailSelect = () => {
  const jobFilter = useJobFilter();

  const jobModeChecker = (jobMode: string) =>
    jobFilter.jobMode?.find((j) => j === jobMode) ? true : false;
  const jobModeSetter = (jobMode: string, toggle: boolean) => {
    if (toggle) jobFilter.jobMode.push(jobMode);
    else
      jobFilter.jobMode = jobFilter.jobMode?.filter((j) => j !== jobMode) ?? [];
  };

  const jobWorkloadChecker = (jobWorkload: string) =>
    jobFilter.jobWorkload?.find((j) => j === jobWorkload) ? true : false;
  const jobWorkloadSetter = (jobWorkload: string, toggle: boolean) => {
    if (toggle) jobFilter.jobWorkload.push(jobWorkload);
    else
      jobFilter.jobWorkload =
        jobFilter.jobWorkload?.filter((j) => j !== jobWorkload) ?? [];
  };

  const jobAllowanceChecker = (jobAllowance: string) =>
    jobFilter.jobAllowance?.find((j) => j === jobAllowance) ? true : false;
  const jobAllowanceSetter = (jobAllowance: string, toggle: boolean) => {
    if (toggle) jobFilter.jobAllowance.push(jobAllowance);
    else
      jobFilter.jobAllowance =
        jobFilter.jobAllowance?.filter((j) => j !== jobAllowance) ?? [];
  };

  const jobMOAChecker = (jobMoa: string) =>
    jobFilter.jobMoa?.find((j) => j === jobMoa) ? true : false;
  const jobMOASetter = (jobMoa: string, toggle: boolean) => {
    if (toggle) jobFilter.jobMoa.push(jobMoa);
    else jobFilter.jobMoa = jobFilter.jobMoa?.filter((j) => j !== jobMoa) ?? [];
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="font-bold tracking-tight">Internship Workload</div>
      <div className="flex flex-row justify-start items-center gap-3">
        <SubcategorySelect
          name="Full-time"
          value="Full-time"
          setter={jobModeSetter}
          checked={jobModeChecker("Full-time")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Part-time"
          value="Part-time"
          setter={jobModeSetter}
          checked={jobModeChecker("Part-time")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Project-based"
          value="Project-based"
          setter={jobModeSetter}
          checked={jobModeChecker("Project-based")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Flexible"
          value="Flexible"
          setter={jobModeSetter}
          checked={jobModeChecker("Flexible")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship Mode</div>
      <div className="flex flex-row justify-start gap-3">
        <SubcategorySelect
          name="Face-to-face"
          value="Face-to-face"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("Face-to-face")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Hybrid"
          value="Hybrid"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("Hybrid")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Remote"
          value="Remote"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("Remote")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship Allowance</div>
      <div className="flex flex-row justify-start gap-3">
        <SubcategorySelect
          name="Paid"
          value="Paid"
          setter={jobAllowanceSetter}
          checked={jobAllowanceChecker("Paid")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Non-paid"
          value="Non-paid"
          setter={jobAllowanceSetter}
          checked={jobAllowanceChecker("Non-paid")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship MOA</div>
      <div className="flex flex-row justify-start gap-3">
        <SubcategorySelect
          name="Has MOA"
          value="Has MOA"
          setter={jobMOASetter}
          checked={jobMOAChecker("Has MOA")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="No MOA"
          value="No MOA"
          setter={jobMOASetter}
          checked={jobMOAChecker("No MOA")}
        ></SubcategorySelect>
      </div>
    </div>
  );
};

interface ISuboption {
  name: string;
  value: string;
  checked?: boolean;
  setter?: (f: string, on: boolean) => void;
  suboptions?: ISuboption[];
}

// ! multiselect option
const SubcategorySelect = ({
  name,
  value,
  checked,
  suboptions,
  setter,
}: ISuboption) => {
  const [isSelected, setIsSelected] = useState(checked);
  const jobFilter = useJobFilter();

  useEffect(() => {
    console.log(jobFilter);
    if (isSelected) jobFilter?.position?.push(value);
    else
      jobFilter.position =
        jobFilter?.position?.filter((v) => v !== value) ??
        jobFilter.position ??
        [];
  }, [isSelected]);

  return (
    <>
      <div className="flex flex-row gap-1 items-center w-fit">
        <Checkbox
          checked={isSelected}
          className={cn(
            "flex flex-row items-center justify-center w-5 h-5 hover:cursor-pointer ",
            isSelected
              ? "border-blue-500 border-opacity-85 bg-blue-200"
              : "border-gray-300 bg-gray-200"
          )}
          onCheckedChange={(isSelected: boolean) => (
            setIsSelected(isSelected), setter?.(value, isSelected)
          )}
        >
          {isSelected ? (
            <CheckIcon className="text-blue-500 pointer-events-none" />
          ) : (
            <XIcon className="text-gray-400 pointer-events-none" />
          )}
        </Checkbox>
        {name}
        {suboptions?.length ? (
          isSelected ? (
            <ChevronDown className="pointer-events-none text-gray-300 h-5 w-5" />
          ) : (
            <ChevronRight className="pointer-events-none text-gray-300 h-5 w-5" />
          )
        ) : (
          <></>
        )}
      </div>
      <div className="">
        {isSelected &&
          suboptions?.map((suboption) => {
            return (
              <div className="flex flex-row">
                <div className="w-6 ml-2 h-10 border-l border-l-gray-400"></div>
                <SubcategorySelect {...suboption}></SubcategorySelect>
              </div>
            );
          })}
      </div>
    </>
  );
};

/**
 * The header present on every page
 *
 * @component
 */
export const Header = () => {
  const { isMobile } = useAppContext();
  const { routeExcluded } = useRoute();
  const headerRoutes = ["/login", "/register", "/otp"];
  const router = useRouter();
  const profile = useProfile();
  const pathname = usePathname();
  const outsideClickRef = useDetectClickOutside({
    onTriggered: (e) => {
      setIsJobDetailFiltering(false);
      setIsJobPositionFiltering(false);
    },
  });

  const [jobFilters, setFilters] = useState({
    position: [],
    jobMode: [],
    jobWorkload: [],
    jobAllowance: [],
    jobMoa: [],
  } as IJobFilter);
  const [hasMissing, setHasMissing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState({} as IJobFilter);
  const [isJobPositionFiltering, setIsJobPositionFiltering] = useState(false);
  const [isJobDetailFiltering, setIsJobDetailFiltering] = useState(false);

  useEffect(() => {
    if (profile.data) {
      const { missing } = getMissingProfileFields(profile.data);
      setHasMissing(Array.isArray(missing) && missing.length > 0);
    }
    // Only run on mount/profile fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.data]);

  return (
    <>
      <JobFilterContext.Provider value={jobFilters}>
        <div className="flex flex-col">
          <div
            className={cn(
              "flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[90]",
              isMobile ? "px-6 py-4" : "py-4 px-8"
            )}
            style={{
              overflow: "visible",
              position: "relative",
              zIndex: 100,
            }}
          >
            <div className="flex items-center gap-4">
              <HeaderTitle />
            </div>
            <div className="flex flex-row max-w-2xl w-full gap-4 items-center">
              <div className="relative max-w-2xl w-full border border-gray-300 rounded-[0.33em] hover:pointer-cursor ">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Internship Listings"
                  className="w-full h-12 pl-12 pr-4 w-4xl bg-transparent border-0 outline-none focus:ring-0 text-gray-900 hover:bg-gray-100 focus:bg-gray-100 duration-150 placeholder:text-gray-500"
                />
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  scheme="primary"
                  variant="outline"
                  size="md"
                  onClick={() => (
                    setIsJobPositionFiltering(true),
                    setIsJobDetailFiltering(false)
                  )}
                >
                  Internship Position
                  <ChevronDown />
                </Button>
                <Button
                  scheme="primary"
                  variant="outline"
                  size="md"
                  onClick={() => (
                    setIsJobDetailFiltering(true),
                    setIsJobPositionFiltering(false)
                  )}
                >
                  Internship Details
                  <ChevronDown />
                </Button>
              </div>
            </div>
            {routeExcluded(headerRoutes) ? (
              <div className="flex items-center gap-6">
                {!isMobile && pathname === "/search" && hasMissing && (
                  <button
                    className="text-base ml-4 text-blue-700 font-medium hover:underline focus:outline-none"
                    onClick={() => router.push("/profile?edit=true")}
                  >
                    Finish your profile to start applying!
                  </button>
                )}
                <ProfileButton />
              </div>
            ) : (
              <div className="w-1 h-10 bg-transparent"></div>
            )}
          </div>
          {isMobile && pathname === "/search" && <CompleteAccBanner />}
          {(isJobPositionFiltering || isJobDetailFiltering) && (
            <div className="relative overflow-visible h-0">
              <div className="absolute flex flex-col items-center justify-start w-full h-[100vh] z-[100] bg-black/10 backdrop-blur-sm p-5">
                <div
                  className="max-w-2xl w-full h-fit bg-white rounded-[0.33em] px-5 py-4"
                  ref={outsideClickRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isJobPositionFiltering && <JobPositionSelect />}
                  {isJobDetailFiltering && <JobDetailSelect />}
                </div>
              </div>
            </div>
          )}
        </div>
      </JobFilterContext.Provider>
    </>
  );
};

/**
 * A dropdown menu for the other parts of the site
 *
 * @component
 */
export const ProfileButton = () => {
  const profile = useProfile();
  const conversations = useConversations();
  const { isAuthenticated, logout } = useAuthContext();
  const router = useRouter();

  const handle_logout = () => {
    logout().then(() => {
      router.push("/");
    });
  };

  return isAuthenticated() ? (
    <div className="relative flex flex-row items-center gap-2">
      <Link href="/conversations">
        <Button variant="outline" className="relative">
          <span className="text-xs">Chats</span>{" "}
          <MessageCircleMore className="w-6 h-6" />
          {conversations?.unreads?.length ? (
            <div className="absolute w-3 h-3 top-[-0.33em] right-[-0.4em] rounded-full bg-warning opacity-70"></div>
          ) : (
            <></>
          )}
        </Button>
      </Link>
      <GroupableNavDropdown
        display={
          <>
            <div className="overflow-hidden rounded-full flex flex-row items-center justify-center">
              <MyUserPfp size="7" />
            </div>
            {getFullName(profile.data)}
          </>
        }
        content={
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 text-ellipsis overflow-hidden">
              {profile.data?.email}
            </p>
          </div>
        }
        className="z-[200]"
      >
        <DropdownOption href="/profile">
          <Settings className="w-4 h-4 inline-block m-1 mr-2" />
          Profile Settings
        </DropdownOption>
        <DropdownOption href="/applications">
          <BookA className="w-4 h-4 inline-block m-1 mr-2" />
          Applications
        </DropdownOption>
        <DropdownOption href="/saved">
          <Heart className="w-4 h-4 inline-block m-1 mr-2" />
          Saved Jobs
        </DropdownOption>
        <DropdownOption href="/help">
          <HelpCircle className="w-4 h-4 inline-block m-1 mr-2" />
          Help Center
        </DropdownOption>
        <DropdownOption href="/login" on_click={handle_logout}>
          <LogOut className="text-red-500 w-4 h-4 inline-block m-1 mr-2" />
          <span className="text-red-500">Sign Out</span>
        </DropdownOption>
      </GroupableNavDropdown>
    </div>
  ) : (
    <Button
      type="button"
      variant="outline"
      size="md"
      className="h-10 border-gray-300 hover:bg-gray-50 "
      onClick={() => router.push("/login")}
    >
      Sign in
    </Button>
  );
};

export default Header;
