import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, SquareArrowOutUpRight } from "lucide-react";

export default function FormGenerateCard({
  formLabel,
  onGenerate,
}: {
  formLabel: string;
  onGenerate: () => void;
}) {
  return (
    <>
      <Card className="flex flex-col justify-end items-center aspect-square p-0">
        <div className="flex gap-0 w-full border-b border-gray-300 overflow-hidden">
          <div className="px-3 py-2 text-gray-600 text-sm text-ellipsis text-nowrap line-clamp-1">
            {formLabel} hello hello helloa sdasd dasdasdasd
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <File className="w-16 h-16 text-gray-400" />
        </div>

        <div className="flex gap-0 w-full border-t border-gray-300 overflow-hidden">
          <Button
            onClick={onGenerate}
            variant="outline"
            scheme="primary"
            className="w-full flex flex-row justify-between rounded-none bg-primary/10 border-none"
          >
            Open
            <SquareArrowOutUpRight />
          </Button>
        </div>
      </Card>
    </>
  );
}
