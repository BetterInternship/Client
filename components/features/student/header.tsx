"use client";

import React, {
  createContext,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  FilterIcon,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
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
        value="1e3b7585-293b-430a-a5cb-c773e0639bb0"
        checked={positionChecker("1e3b7585-293b-430a-a5cb-c773e0639bb0")}
        setter={positionSetter}
        suboptions={[
          {
            name: "Data Science/AI",
            value: "dc3780b4-b9c0-4294-a035-faa4e2086611",
            setter: positionSetter,
            checked: positionChecker("dc3780b4-b9c0-4294-a035-faa4e2086611"),
          },
          {
            name: "Cybersecurity",
            value: "ca8ae32d-55a8-4ded-9cfe-1582d72cbaf1",
            setter: positionSetter,
            checked: positionChecker("ca8ae32d-55a8-4ded-9cfe-1582d72cbaf1"),
          },
          {
            name: "Full Stack",
            value: "381239bf-7c82-4f87-a1b8-39d952f8876b",
            setter: positionSetter,
            checked: positionChecker("381239bf-7c82-4f87-a1b8-39d952f8876b"),
          },
          {
            name: "Backend",
            value: "e5a73819-ee90-43fb-b71b-7ba12f0a4dbf",
            setter: positionSetter,
            checked: positionChecker("e5a73819-ee90-43fb-b71b-7ba12f0a4dbf"),
          },
          {
            name: "Frontend",
            value: "8b323584-9340-41e8-928e-f9345f1ad59e",
            setter: positionSetter,
            checked: positionChecker("8b323584-9340-41e8-928e-f9345f1ad59e"),
          },
          {
            name: "QA",
            value: "91b180be-3d23-4f0a-bd64-c82cef9d3ae5",
            setter: positionSetter,
            checked: positionChecker("91b180be-3d23-4f0a-bd64-c82cef9d3ae5"),
          },
        ]}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Business"
        value="0fb4328b-4163-458b-8ac7-8ab3861e1ad6"
        setter={positionSetter}
        checked={positionChecker("0fb4328b-4163-458b-8ac7-8ab3861e1ad6")}
        suboptions={[
          {
            name: "Accounting/Finance",
            value: "6506ab1d-f1a6-4c6f-a917-474a96e6d2bb",
            setter: positionSetter,
            checked: positionChecker("6506ab1d-f1a6-4c6f-a917-474a96e6d2bb"),
          },
          {
            name: "HR/Administrative",
            value: "976d7433-8297-4f8d-950d-3392682dadbb",
            setter: positionSetter,
            checked: positionChecker("976d7433-8297-4f8d-950d-3392682dadbb"),
          },
          {
            name: "Marketing/Sales",
            value: "1f6ab152-9754-4082-9fc2-4b276f5a9ef9",
            setter: positionSetter,
            checked: positionChecker("1f6ab152-9754-4082-9fc2-4b276f5a9ef9"),
          },
          {
            name: "Business Development",
            value: "25bce220-1927-48c0-8e81-6be4af64d9b9",
            setter: positionSetter,
            checked: positionChecker("25bce220-1927-48c0-8e81-6be4af64d9b9"),
          },
          {
            name: "Operations",
            value: "61727f3b-dc36-458c-a487-5c44b5cd83a5",
            setter: positionSetter,
            checked: positionChecker("61727f3b-dc36-458c-a487-5c44b5cd83a5"),
          },
        ]}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Engineering"
        value="ab93abaf-c117-4482-9594-8bfecec44f69"
        setter={positionSetter}
        checked={positionChecker("ab93abaf-c117-4482-9594-8bfecec44f69")}
      ></SubcategorySelect>
      <SubcategorySelect
        name="Others"
        value="0debeda8-f257-49a6-881f-11a6b8eb560b"
        setter={positionSetter}
        checked={positionChecker("0debeda8-f257-49a6-881f-11a6b8eb560b")}
        suboptions={[
          {
            name: "Legal",
            value: "79161041-5009-4e66-84d2-a88357301427",
            setter: positionSetter,
            checked: positionChecker("79161041-5009-4e66-84d2-a88357301427"),
          },
          {
            name: "Research",
            value: "31a39059-1050-4f22-8875-5b903b7db3bf",
            setter: positionSetter,
            checked: positionChecker("31a39059-1050-4f22-8875-5b903b7db3bf"),
          },
          {
            name: "Graphic Design",
            value: "f50b009d-5ed7-4ef1-851a-3fcf5d6572aa",
            setter: positionSetter,
            checked: positionChecker("f50b009d-5ed7-4ef1-851a-3fcf5d6572aa"),
          },
        ]}
      ></SubcategorySelect>
    </div>
  );
};

// ! move this elsewhere
const JobDetailSelect = () => {
  const jobFilter = useJobFilter();

  const jobWorkloadChecker = (jobWorkload: string) =>
    jobFilter.jobWorkload?.find((j) => j === jobWorkload) ? true : false;
  const jobWorkloadSetter = (jobWorkload: string, toggle: boolean) => {
    if (toggle) jobFilter.jobWorkload.push(jobWorkload);
    else
      jobFilter.jobWorkload =
        jobFilter.jobWorkload?.filter((j) => j !== jobWorkload) ?? [];
  };

  const jobModeChecker = (jodMode: string) =>
    jobFilter.jobMode?.find((j) => j === jodMode) ? true : false;
  const jobModeSetter = (jobMode: string, toggle: boolean) => {
    if (toggle) jobFilter.jobMode.push(jobMode);
    else
      jobFilter.jobMode = jobFilter.jobMode?.filter((j) => j !== jobMode) ?? [];
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
      <div className="flex flex-col justify-start items-start gap-1">
        <SubcategorySelect
          name="Part-time"
          value="1"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("1")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Full-time"
          value="2"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("2")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Project-based"
          value="3"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("3")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Flexible"
          value="4"
          setter={jobWorkloadSetter}
          checked={jobWorkloadChecker("4")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship Mode</div>
      <div className="flex flex-col justify-start gap-1">
        <SubcategorySelect
          name="Face-to-face"
          value="0"
          setter={jobModeSetter}
          checked={jobModeChecker("0")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Hybrid"
          value="1"
          setter={jobModeSetter}
          checked={jobModeChecker("1")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Remote"
          value="2"
          setter={jobModeSetter}
          checked={jobModeChecker("2")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship Allowance</div>
      <div className="flex flex-col justify-start gap-1">
        <SubcategorySelect
          name="Paid"
          value="0"
          setter={jobAllowanceSetter}
          checked={jobAllowanceChecker("0")}
        ></SubcategorySelect>
        <SubcategorySelect
          name="Non-paid"
          value="1"
          setter={jobAllowanceSetter}
          checked={jobAllowanceChecker("1")}
        ></SubcategorySelect>
      </div>
      <div className="font-bold tracking-tight mt-4">Internship MOA</div>
      <div className="flex flex-col justify-start gap-1">
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

interface ISuboptionActions {
  select: () => void;
  unselect: () => void;
}

// ! multiselect option
const SubcategorySelect = ({
  name,
  value,
  checked,
  suboptions,
  setter,
  ref,
}: ISuboption & { ref?: Ref<ISuboptionActions> }) => {
  const [isSelected, setIsSelected] = useState(checked);
  const refs = useRef<(ISuboptionActions | null)[]>([]);

  const select = () => {
    setTimeout(() => refs.current.map((r) => r?.select()));
    setIsSelected(true);
    setter?.(value, true);
  };

  const unselect = () => {
    refs.current.map((r) => r?.unselect());
    setIsSelected(false);
    setter?.(value, false);
  };

  const update = (isSelected: boolean) => {
    if (isSelected) select();
    else unselect();
  };

  useImperativeHandle(ref, () => ({ select, unselect }));

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
          onCheckedChange={update}
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
          suboptions?.map((suboption, i) => {
            return (
              <div className="flex flex-row">
                <div className="w-6 ml-2 h-10 border-l border-l-gray-400"></div>
                <SubcategorySelect
                  {...suboption}
                  key={i}
                  ref={(optionRef) => {
                    if (!refs.current) return;
                    if (optionRef) refs.current[i] = optionRef;
                    return () => {
                      refs.current[i] = null;
                    };
                  }}
                ></SubcategorySelect>
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
  const { isMobile } = useMobile();
  const { routeExcluded } = useRoute();
  const headerRoutes = ["/login", "/login/otp", "/register", "/otp"];
  const router = useRouter();
  const profile = useProfile();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const outsideClickRef = useDetectClickOutside({
    onTriggered: (e) => {
      setIsJobDetailFiltering(false);
      setIsJobPositionFiltering(false);
    },
  });

  const [jobFilters, setJobFilters] = useState({
    position: [],
    jobMode: [],
    jobWorkload: [],
    jobAllowance: [],
    jobMoa: [],
  } as IJobFilter);
  const [hasMissing, setHasMissing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJobPositionFiltering, setIsJobPositionFiltering] = useState(false);
  const [isJobDetailFiltering, setIsJobDetailFiltering] = useState(false);

  // Initialize search term from URL
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const position = searchParams.get("position")?.split(",") || [];
    const jobAllowance = searchParams.get("allowance")?.split(",") || [];
    const jobWorkload = searchParams.get("workload")?.split(",") || [];
    const jobMode = searchParams.get("mode")?.split(",") || [];
    const jobMoa = searchParams.get("moa")?.split(",") || [];

    setJobFilters({
      position,
      jobAllowance,
      jobWorkload,
      jobMode,
      jobMoa,
    });
    setSearchTerm(query);
  }, [searchParams]);

  const doSearch = () => {
    router.push(
      `/search/?query=${searchTerm}` +
        (jobFilters.position?.length
          ? `&position=${encodeURIComponent(jobFilters.position.join(","))}`
          : "") +
        (jobFilters.jobMode?.length
          ? `&mode=${encodeURIComponent(jobFilters.jobMode.join(","))}`
          : "") +
        (jobFilters.jobWorkload?.length
          ? `&workload=${encodeURIComponent(jobFilters.jobWorkload.join(","))}`
          : "") +
        (jobFilters.jobAllowance?.length
          ? `&allowance=${encodeURIComponent(
              jobFilters.jobAllowance.join(",")
            )}`
          : "") +
        (jobFilters.jobMoa?.length
          ? `&moa=${encodeURIComponent(jobFilters.jobMoa.join(","))}`
          : "")
    );
  };

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
            {!isMobile && routeExcluded(headerRoutes) && (
              <div className="flex flex-row max-w-2xl w-full gap-4 items-center">
                <div className="relative max-w-2xl h-10 w-full border border-gray-300 rounded-[0.33em] hover:pointer-cursor ">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doSearch();
                    }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Internship Listings"
                    className="w-full h-10 pl-12 pr-4 w-4xl bg-transparent border-0 outline-none focus:ring-0 text-gray-900 text-sm hover:bg-gray-100 focus:bg-gray-100 duration-150 placeholder:text-gray-500"
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
                    <FilterIcon />
                    Category
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
                    <FilterIcon />
                    Details
                    <ChevronDown />
                  </Button>
                </div>
              </div>
            )}
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
                  <br />
                  <div className="flex flex-row gap-2">
                    <Button size="md" onClick={() => doSearch()}>
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      scheme="secondary"
                      size="md"
                      onClick={() => (
                        setIsJobPositionFiltering(false),
                        setIsJobDetailFiltering(false)
                      )}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isMobile && routeExcluded(headerRoutes) && (
            <div className="flex flex-col max-w-2xl w-full gap-4 items-center">
              <div className="relative max-w-2xl w-full border border-gray-300 rounded-[0.33em] hover:pointer-cursor ">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
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
                  <FilterIcon />
                  Category
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
                  <FilterIcon />
                  Details
                  <ChevronDown />
                </Button>
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
