import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link"

interface ListingsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  //onCreateJob: () => void;
}

export function ListingsSearchBar({
  searchTerm,
  onSearchChange,
  onKeyPress,
  //onCreateJob,
}: ListingsSearchBarProps) {
  return (
    <div
      className="flex items-center gap-3 pl-1 pr-4 mb-4 flex-shrink-0 max-w-[1024px] mx-auto"
      data-tour="job-filters"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Search listings..."
          className="pl-12 pr-4 h-12 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder:text-gray-400 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <Link href="/listings/create">
        <Button
          size="icon"
          //onClick={onCreateJob}
          data-tour="add-job-btn"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
