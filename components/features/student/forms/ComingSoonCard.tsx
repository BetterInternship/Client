import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComingSoonCard({ title }: { title: string }) {
  return (
    <Card className="sm:flex sm:justify-between items-center">
      <div>
        <div className="">{title}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
        <Button
          variant="outline"
          className="w-full sm:w-auto sm:shrink-0"
          disabled
        >
          View template
        </Button>
        <Button
          className="w-full sm:w-auto sm:shrink-0"
          disabled
          aria-disabled="true"
        >
          Coming soon
        </Button>
      </div>
    </Card>
  );
}
