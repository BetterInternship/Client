import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FormGenerateCard({
  formTitle,
  onGenerate,
  onViewTemplate,
}: {
  formTitle: string;
  onGenerate: () => void;
  onViewTemplate?: () => void | Promise<void>;
}) {
  return (
    <>
      <Card className="sm:flex sm:justify-between items-center">
        <div>{formTitle}</div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={onViewTemplate}
            variant="outline"
            className="w-full sm:w-auto"
          >
            View template
          </Button>
          <Button onClick={onGenerate} className="w-full sm:w-auto">
            Generate
          </Button>
        </div>
      </Card>
    </>
  );
}
