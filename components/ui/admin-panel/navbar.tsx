import { ModeToggle } from '@/components/school/mode-toggle';
import { SheetMenu } from '@/components/ui/admin-panel/sheet-menu';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-950 bg-background py-2 backdrop-blur supports-[backdrop-filter]:bg-background dark:shadow-secondary">
      <div className="mx-4 flex h-14 items-center sm:mx-8 justify-between">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="inter font-extrabold">{title}</h1>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
