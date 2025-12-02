import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services";
import { FormMetadata } from "@betterinternship/core/forms";

export default function FormGenerateCard({
  formName,
  onGenerate,
  onViewTemplate,
}: {
  formName: string;
  onGenerate: () => void;
  onViewTemplate?: () => void | Promise<void>;
}) {
  // Fetch form
  const form = useQuery({
    queryKey: ["forms", formName],
    queryFn: () => UserService.getForm(formName),
    enabled: !!formName,
    staleTime: 60_000,
  });

  // Get interface to form
  const formMetdata = form.data?.formMetadata
    ? new FormMetadata(form.data.formMetadata)
    : null;

  return (
    <>
      <Card className="sm:flex sm:justify-between items-center">
        <div>{formMetdata?.getLabel() ?? ""}</div>
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <Button
            onClick={() => void onViewTemplate?.()}
            variant="outline"
            className="w-full sm:w-auto sm:shrink-0"
          >
            View template
          </Button>
          <Button onClick={onGenerate} className="w-full sm:w-auto sm:shrink-0">
            Generate
          </Button>
        </div>
      </Card>
    </>
  );
}
