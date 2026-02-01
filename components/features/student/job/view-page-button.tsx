import { Button } from "@/components/ui/button";
import { ArrowUpRightFromSquare } from "lucide-react";

export const ViewPageButton = ({id} : {id: string}) => {
  return (
    <a href={`/search/${id}`}>
      <Button 
        variant="link"
        name="View full page"
        scheme="default"
        size="sm"
        className="text-xs text-gray-500"
      >
        <ArrowUpRightFromSquare />
        View page
      </Button>
    </a>
  );
};
