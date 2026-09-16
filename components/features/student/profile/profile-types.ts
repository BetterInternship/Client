import type { ResumeDTO } from "@/lib/api/services";

export type ProfileSectionKey =
  | "resume"
  | "internship"
  | "personal"
  | "connected-accounts";

export type ProfileResumeManager = {
  resumes: ResumeDTO[];
  defaultResume: string | null;
  loading: boolean;
  maxAllowed: number;
  isRenaming: boolean;
  isSettingDefault: boolean;
  actions: {
    view: (resumeId: string) => void | Promise<void>;
    add: () => void;
    setDefault: (resumeId: string) => Promise<boolean>;
    rename: (resumeId: string, label: string) => Promise<boolean>;
    delete: (resume: ResumeDTO) => void | Promise<void>;
  };
};
