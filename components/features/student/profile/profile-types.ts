import type { Resume } from "@/lib/db/db.types";

export type ProfileSectionKey = "resume" | "internship" | "personal";

export type ProfileResumeManager = {
  resumes: Resume[];
  loading: boolean;
  maxAllowed: number;
  isRenaming: boolean;
  actions: {
    view: (resumeId: string) => void | Promise<void>;
    add: () => void;
    rename: (resumeId: string, label: string) => Promise<boolean>;
    delete: (resume: Resume) => void | Promise<void>;
  };
};
