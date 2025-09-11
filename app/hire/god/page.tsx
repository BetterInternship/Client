"use client";

import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { TabGroup, Tab } from "@/components/ui/tabs";
import {
  useEmployers,
  useUsers,
  useStudentImpersonation,
} from "@/lib/api/god.api";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAuthContext } from "../authctx";
import { Badge, BoolBadge } from "@/components/ui/badge";
import { formatDate, isValidEmail } from "@/lib/utils";
import { getFullName } from "@/lib/utils/user-utils";
import { BooleanCheckIcon } from "@/components/ui/icons";
import { EmployerApplication, PublicUser } from "@/lib/db/db.types";
import { useDbRefs } from "@/lib/db/use-refs";
import { useModal } from "@/hooks/use-modal";
import { ApplicantModalContent } from "@/components/shared/applicant-modal";
import { UserService } from "@/lib/api/services";
import { useFile } from "@/hooks/use-file";
import { FileText, UserPlus } from "lucide-react";
import { PDFPreview } from "@/components/shared/pdf-preview";
import { FormCheckbox, FormInput } from "@/components/EditForm";
import { APIClient, APIRoute } from "@/lib/api/api-client";
import { FetchResponse } from "@/lib/api/use-fetch";

const STUDENT_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";
const STUDENT_HOME = process.env.NEXT_PUBLIC_STUDENT_HOME || "/search";
const EMPLOYER_ORIGIN =
  process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");


export default function GodLandingPage() {
  const { loginAs: login_as } = useAuthContext();
  const employers = useEmployers();
  const { users } = useUsers();
  const [searchName, setSearchName] = useState<string | null>();
  const [selected, setSelected] = useState("");
  const { to_app_status_name } = useDbRefs();
  const router = useRouter();
  const [hideNoApps, setHideNoApps] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);

  const applications = useMemo(() => {
    const apps: EmployerApplication[] = [];
    // @ts-ignore
    employers.data.forEach((e) => e?.applications?.map((a) => apps.push(a)));
    return apps;
  }, [employers.data]);

  const refs = useDbRefs();

  const { url: resumeURL, sync: syncResumeURL } = useFile({
    fetcher: useCallback(
      async () => await UserService.getUserResumeURL(selectedUser?.id ?? ""),
      [selectedUser]
    ),
    route: selectedUser ? `/users/${selectedUser?.id}/resume` : "",
  });

  // Modals
  const {
    open: openApplicantModal,
    close: closeApplicantModal,
    Modal: ApplicantModal,
  } = useModal("applicant-modal");

  const {
    open: openResumeModal,
    close: closeResumeModal,
    Modal: ResumeModal,
  } = useModal("resume-modal");

  const {
    open: openRegisterModal,
    close: closeRegisterModal,
    Modal: RegisterModal,
  } = useModal("register-modal");

  // Employer proxy login
  const authorizeAs = async (employer_id: string) => {
    await login_as(employer_id);
    router.push("/dashboard");
  };

  const setSearchQuery = (id?: number | string | null) =>
    setSearchName(id?.toString());

  // Student impersonation
  const { impersonate, stop } = useStudentImpersonation();
  const [impUserId, setImpUserId] = useState<string | null>(null);

  const goToStudentHome = () => {
    const dest = new URL(STUDENT_HOME, STUDENT_ORIGIN).toString();
    window.location.assign(dest);
  };

  const viewAsStudent = async (studentId: string) => {
    try {
      setImpUserId(studentId);
      await impersonate.mutateAsync({ studentId });
      // Jump to student app (different origin)
      goToStudentHome();
    } catch (e) {
      console.error(e);
      alert("Failed to start student mode. Check network tab.");
    } finally {
      setImpUserId(null);
    }
  };

  const exitStudentMode = async () => {
    try {
      await stop.mutateAsync();
      // Bounce back to employer god page (ensure same origin)
      const dest = new URL("/god", EMPLOYER_ORIGIN).toString();
      window.location.assign(dest);
    } catch (e) {
      console.error(e);
      alert("Failed to stop student mode. Check network tab.");
    }
  };

  return (
    <div className="w-full h-[90vh] overflow-hidden">
      <TabGroup>
        <Tab name="verified employers">
          <div className="absolute flex flex-row items-center gap-4 w-full px-4 py-4 bg-gray-900 z-50">
            <Autocomplete
              setter={setSearchQuery}
              options={employers.data.map((e) => ({
                id: e.id ?? "",
                name: e.name ?? "",
              }))}
              className="w-96"
              placeholder="Search name..."
            />
            <Button
              className=""
              scheme="supportive"
              onClick={() => openRegisterModal()}
            >
              <UserPlus className="" />
            </Button>
            <div className="flex flex-row items-center gap-1">
              <FormCheckbox checked={hideNoApps} setter={setHideNoApps} />
              <div className="text-white">Hide rows without applications</div>
            </div>
          </div>
          <div className="absolute top-16 w-[100%] h-[85%] flex flex-col overflow-scroll p-4">
            {employers.data
              // @ts-ignore
              .filter((e) => !hideNoApps || e?.applications?.length)
              .filter(
                (e) =>
                  e.name
                    ?.toLowerCase()
                    .includes(searchName?.toLowerCase() ?? "") ||
                  e.id === searchName
              )
              .filter((e) => e.is_verified)
              .toSorted((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0)
              .map((e) => (
                <div
                  key={e.id}
                  className="flex flex-row items-center p-2 space-x-2 hover:bg-gray-200 hover:cursor-pointer transition-all"
                >
                  <Button
                    scheme="primary"
                    size="xs"
                    onClick={() => authorizeAs(e.id ?? "")}
                  >
                    View
                  </Button>
                  <div className="text-gray-700 w-full">{e.name}</div>
                  <Badge
                    // @ts-ignore
                    type={!e?.last_session ? "destructive" : "default"}
                  >
                    <span className="font-bold italic opacity-50 mr-1">
                      last login at:
                    </span>{" "}
                    {
                      // @ts-ignore
                      !e?.last_session
                        ? "Never"
                        : new Date(
                            // @ts-ignore
                            e?.last_session?.timestamp
                          ).toLocaleDateString() +
                          ", " +
                          new Date(
                            // @ts-ignore
                            e?.last_session?.timestamp
                          ).toLocaleTimeString()
                    }
                  </Badge>
                  <Badge
                    // @ts-ignore
                    type={!e?.applications?.length ? "destructive" : "default"}
                  >
                    {
                      // @ts-ignore
                      e?.applications?.length ?? 0
                    }{" "}
                    applications
                  </Badge>
                  <Badge type={e.is_verified ? "supportive" : "destructive"}>
                    <BooleanCheckIcon checked={e.is_verified} />
                    {e.is_verified ? "verified" : "unverified"}
                  </Badge>
                </div>
              ))}
          </div>
        </Tab>

        <Tab name="unverified employers">
          <div className="absolute flex flex-row iterms-center gap-4 w-full px-4 py-4 bg-gray-900 z-50">
            <Autocomplete
              setter={setSearchQuery}
              options={employers.data.map((e) => ({
                id: e.id ?? "",
                name: e.name ?? "",
              }))}
              className="w-96"
              placeholder="Search name..."
            />
            <div className="flex flex-row items-center gap-1">
              <FormCheckbox checked={hideNoApps} setter={setHideNoApps} />
              <div className="text-white">Hide rows without applications</div>
            </div>
          </div>
          <div className="absolute top-16 w-[100%] h-[85%] flex flex-col overflow-scroll p-4">
            {employers.data
              // @ts-ignore
              .filter((e) => !hideNoApps || e?.applications?.length)
              .filter(
                (e) =>
                  e.name
                    ?.toLowerCase()
                    .includes(searchName?.toLowerCase() ?? "") ||
                  e.id === searchName
              )
              .filter((e) => !e.is_verified)
              .toSorted((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0)
              .map((e) => (
                <div
                  key={e.id}
                  className="flex flex-row items-center p-2 space-x-2 hover:bg-gray-200 hover:cursor-pointer transition-all"
                >
                  <Button
                    scheme="primary"
                    size="xs"
                    onClick={() => authorizeAs(e.id ?? "")}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    scheme="supportive"
                    disabled={employers.isVerifying && e.id === selected}
                    onClick={() => {
                      setSelected(e.id ?? "");
                      employers.verify(e.id ?? "");
                    }}
                  >
                    {employers.isVerifying && e.id === selected
                      ? "Verifying..."
                      : "Verify"}
                  </Button>
                  <div className="text-gray-700 w-full">{e.name}</div>
                  <Badge
                    // @ts-ignore
                    type={!e?.last_session ? "destructive" : "default"}
                  >
                    <span className="font-bold italic opacity-50 mr-1">
                      last login at:
                    </span>{" "}
                    {
                      // @ts-ignore
                      !e?.last_session
                        ? "Never"
                        : new Date(
                            // @ts-ignore
                            e?.last_session?.timestamp
                          ).toLocaleDateString() +
                          ", " +
                          new Date(
                            // @ts-ignore
                            e?.last_session?.timestamp
                          ).toLocaleTimeString()
                    }
                  </Badge>
                  <Badge
                    // @ts-ignore
                    type={!e?.applications?.length ? "destructive" : "default"}
                  >
                    {
                      // @ts-ignore
                      e?.applications?.length ?? 0
                    }{" "}
                    applications
                  </Badge>
                  <BoolBadge
                    state={e.is_verified}
                    onValue="verified"
                    offValue="not verified"
                  />
                </div>
              ))}
          </div>
        </Tab>

        <Tab name="students">
          <div className="absolute flex flex-row items-center gap-4 w-full px-4 py-4 bg-gray-900 z-50">
            <Autocomplete
              setter={setSearchQuery}
              options={users.map((u) => ({
                id: u.id,
                name: getFullName(u) ?? "",
              }))}
              className="w-96"
              placeholder="Search name..."
            />
            <div className="flex flex-row items-center gap-1">
              <FormCheckbox checked={hideNoApps} setter={setHideNoApps} />
              <div className="text-white">Hide rows without applications</div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={exitStudentMode}
              disabled={stop.isPending}
            >
              {stop.isPending ? "Exiting..." : "Exit student mode"}
            </Button>
          </div>
          <div className="absolute top-16 w-[100%] h-[85%] flex flex-col overflow-scroll p-4">
            {users
              .filter(
                (u) =>
                  !hideNoApps ||
                  applications.filter((a) => a.user_id === u.id).length ||
                  u.id === searchName
              )
              .filter((u) =>
                `${getFullName(u)} ${u.email} ${refs.to_college_name(
                  u.college
                )} ${refs.to_degree_full_name(u.degree)}`
                  ?.toLowerCase()
                  .includes(searchName?.toLowerCase() ?? "")
              )
              .toSorted(
                (a, b) =>
                  new Date(b.created_at ?? "").getTime() -
                  new Date(a.created_at ?? "").getTime()
              )
              .map((u) => {
                const userApplications = applications.filter(
                  (a) => a.user_id === u.id
                );
                const isRowPending =
                  impersonate.isPending && impUserId === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex flex-row items-center p-2 space-x-2 hover:bg-gray-200 hover:cursor-pointer transition-all"
                    onClick={() => (setSelectedUser(u), openApplicantModal())}
                  >
                    <div className="flex flex-row text-gray-700 w-full gap-1 items-center">
                      <Button
                        scheme="primary"
                        size="xs"
                        disabled={isRowPending}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          viewAsStudent(u.id);
                        }}
                      >
                        {isRowPending ? "Starting..." : "View"}
                      </Button>
                      <span className="ml-2">{getFullName(u)}</span>
                      <Badge strength="medium">{u.email}</Badge>
                      <Badge strength="medium">
                        {refs.to_college_name(u.college)}
                      </Badge>
                      <Badge strength="medium">
                        {refs.to_degree_full_name(u.degree)}
                      </Badge>
                    </div>

                    <Badge
                      // @ts-ignore
                      type={!u?.last_session ? "destructive" : "default"}
                    >
                      <span className="font-bold italic opacity-50 mr-1">
                        last login at:
                      </span>{" "}
                      {
                        // @ts-ignore
                        !u?.last_session
                          ? "Never"
                          : new Date(
                              // @ts-ignore
                              u?.last_session?.timestamp
                            ).toLocaleDateString() +
                            ", " +
                            new Date(
                              // @ts-ignore
                              u?.last_session?.timestamp
                            ).toLocaleTimeString()
                      }
                    </Badge>

                    <BoolBadge
                      state={u.is_verified}
                      onValue="verified"
                      offValue="not verified"
                    />

                    <Badge
                      // @ts-ignore
                      type={
                        !userApplications.length ? "destructive" : "default"
                      }
                    >
                      {
                        // @ts-ignore
                        userApplications.length ?? 0
                      }{" "}
                      applications
                    </Badge>

                    <Badge strength="medium">
                      <span className="font-bold italic opacity-50 mr-1">
                        created at:
                      </span>{" "}
                      {formatDate(u.created_at ?? "")}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </Tab>

        <Tab name="applications">
          <div className="absolute w-full px-4 py-4 bg-gray-900 z-50">
            <Autocomplete
              setter={setSearchQuery}
              options={applications.map((a) => ({
                id: a.id ?? "",
                name: `${a.job?.employers?.name} ${getFullName(a.users)} ${
                  a.jobs?.employers?.name
                }`,
              }))}
              className="w-96"
              placeholder="Search name..."
            />
          </div>
          <div className="absolute top-16 w-[100%] h-[85%] flex flex-col overflow-scroll p-4">
            {applications
              .filter(
                (a) =>
                  `${a.job?.employers?.name} ${getFullName(a.users)} ${
                    a.jobs?.employers?.name
                  }`
                    ?.toLowerCase()
                    .includes(searchName?.toLowerCase() ?? "") ||
                  a.id === searchName
              )
              .toSorted(
                (a, b) =>
                  new Date(b.applied_at ?? "").getTime() -
                  new Date(a.applied_at ?? "").getTime()
              )
              .map((a) => (
                <div
                  key={a.id}
                  className="flex flex-row items-center p-2 space-x-2 hover:bg-gray-200 hover:cursor-pointer transition-all"
                >
                  <div className="text-gray-700 w-full flex flex-row space-x-2">
                    <div className="inline-block">{a.users?.email} </div>
                    <Badge strength="medium">{a?.jobs?.title}</Badge>
                    <Badge strength="medium">{a.jobs?.employers?.name}</Badge>
                  </div>
                  <Badge strength="medium">
                    {to_app_status_name(a.status)}
                  </Badge>
                  <Badge strength="medium">
                    {formatDate(a.applied_at ?? "")}
                  </Badge>
                </div>
              ))}
          </div>
        </Tab>
      </TabGroup>

      <ApplicantModal>
        <ApplicantModalContent
          is_employer={true}
          clickable={true}
          pfp_fetcher={async () =>
            UserService.getUserPfpURL(selectedUser?.id ?? "")
          }
          pfp_route={`/users/${selectedUser?.id}/pic`}
          applicant={selectedUser ?? undefined}
          open_calendar={async () => {
            closeApplicantModal();
            window?.open(selectedUser?.calendar_link ?? "", "_blank")?.focus();
          }}
          open_resume={async () => {
            closeApplicantModal();
            await syncResumeURL();
            openResumeModal();
          }}
          job={{}}
        />
      </ApplicantModal>

      <ResumeModal>
        {selectedUser?.resume ? (
          <div className="h-full flex flex-col">
            <h1 className="font-bold font-heading text-2xl px-6 py-4 text-gray-900">
              {getFullName(selectedUser)} - Resume
            </h1>
            <PDFPreview url={resumeURL} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 px-8">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
                No Resume Available
              </h1>
              <div className="max-w-md text-center border border-red-200 text-red-600 bg-red-50 rounded-[0.33em] p-4">
                This applicant has not uploaded a resume yet.
              </div>
            </div>
          </div>
        )}
      </ResumeModal>

      <RegisterModal>
        <RegisterModalContent />
      </RegisterModal>
    </div>
  );
}

const RegisterModalContent = () => {
  const [dba, setDba] = useState("");
  const [email, setEmail] = useState("");
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!isValidEmail(email)) return alert("Email is not valid.");
    if (!dba.length) return alert("DBA is required.");

    setRegistering(true);
    const response = await APIClient.post<FetchResponse>(
      APIRoute("employer").r("god", "register").build(),
      {
        name: dba,
        user_email: email,
      }
    );

    if (response?.success) {
      alert("Account was created successfully. Check email for password.");
      window.location.reload();
    } else {
      alert("Something went wrong. Please check browser logs and tell Mo lol.");
    }
    setRegistering(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 pt-0">
      <div className="text-left">
        <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
          Register a New Employer Account
        </h1>
        <div className="flex flex-col gap-2">
          <FormInput
            value={dba}
            label="Company Name"
            setter={(value) => setDba(value)}
          />
          <FormInput
            value={email}
            label="User Account Email"
            setter={(value) => setEmail(value)}
          />
          <Button
            variant="default"
            scheme="supportive"
            disabled={registering}
            onClick={handleRegister}
          >
            {!registering ? "Register" : "Registering..."}
          </Button>
        </div>
      </div>
    </div>
  );
};
