"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function MissingRequirementsModal({
  missing,
  onCancel,
}: {
  missing: string[];
  onCancel: () => void;
}) {
  const router = useRouter();
  return (
    <div className="w-full p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div>
          <h3 className="text-4xl font-semibold text-gray-900 mb-5">
            Missing requirements!
          </h3>
          <p className="mt-1 text text-muted-foreground">
            This listing requires details that are not yet on your profile.
          </p>
        </div>
      </div>

      <ul className="space-y-2 pl-1">
        {missing.map((item) => (
          <li key={item} className="flex items-center gap-2 text text-gray-700">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            {item}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-3 pt-2">
        <Button size="md" type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="md"
          onClick={() => {
            router.push("/profile?edit=true");
            onCancel();
          }}
        >
          Update my profile
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
