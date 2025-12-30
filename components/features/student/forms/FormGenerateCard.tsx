import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, SquareArrowOutUpRight } from "lucide-react";

export default function FormTemplateCard({
  formLabel,
  onGenerate,
}: {
  formLabel: string;
  onGenerate: () => void;
}) {
  return (
    <div className="border-b bg-white hover:bg-gray-100 duration-150 transition-all">
      <Card className="flex flex-row justify-end items-center p-0 rounded-none border-none bg-transparent">
        <div className="flex gap-0 w-full overflow-hidden">
          <div className="px-3 py-2 text-gray-700 text-sm text-ellipsis text-nowrap line-clamp-1">
            {formLabel}
          </div>
        </div>

        <div className="flex gap-0 w-fit border border-gray-300 overflow-hidden">
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
    </div>
  );
}
