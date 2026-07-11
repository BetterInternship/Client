import type { Resume } from "@/lib/db/db.types";

export type ProfileSectionKey = "resume" | "internship" | "personal";

export type ProfileResumeManager = {
  resumes: Resume[];
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
    delete: (resume: Resume) => void | Promise<void>;
  };
};
