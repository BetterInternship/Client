import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ComingSoonCard({ title }: { title: string }) {
  return (
    <Card className="sm:flex sm:justify-between items-center">
      <div>
        <div className="">{title}</div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
        <Button variant="outline" className="w-full sm:w-auto" disabled>
          View template
        </Button>
        <Button className="w-full sm:w-auto" disabled aria-disabled="true">
          Coming soon
        </Button>
      </div>
    </Card>
  );
}
