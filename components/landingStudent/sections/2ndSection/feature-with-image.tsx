import { ChevronDown, ChevronRight } from "lucide-react";
import { SoftwareSection } from "./use-cardstack";
import { useAppContext } from "@/lib/ctx-app";

export function Feature() {
  const { isMobile } = useAppContext();
  return (
    <div className="w-full py-20 pb-30 border-t border-gray-700 overflow-hidden overflow-x-hidden bg-neutral-950 text-white dark:bg-neutral-950 dark:text-white">
      <div className="flex flex-col lg:flex-row lg:items-center gap-20">
        <div className="flex gap-4 pl-0 lg:pl-20 flex-col flex-1">
          <div className="flex gap-2 mx-8 flex-col z-30">
            <h2 className="text-5xl sm:text-6xl tracking-tighter text-opacity-90 lg:max-w-2xl font-regular text-left text-gray-900 dark:text-white">
              Apply fast, <br />
              Get hired faster.
            </h2>
            <div className="flex flex-row items-center gap-8 mt-4">
              <p className="text-xs sm:text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left dark:text-gray-400">
                Instantly apply to jobs with a single click—
                <br />
                no forms, no hassle.{" "}
                <b className="text-white text-opacity-100">Try it here</b>
              </p>

              {isMobile ? (
                <ChevronDown className="opacity-30 w-12 h-12 animate-bounce" />
              ) : (
                <ChevronRight className="opacity-30 w-16 h-16 animate-[sidebounce_1s_ease-in-out_infinite]" />
              )}
            </div>
          </div>
        </div>
        <div className="relative group items-center justify-center w-full flex-1">
          <div className="relative z-10">
            <SoftwareSection />
          </div>
        </div>
      </div>
    </div>
  );
}
