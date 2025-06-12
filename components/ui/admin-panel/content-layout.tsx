import { Navbar } from '@/components/ui/admin-panel/navbar';

interface ContentLayoutProps {
  title: string;
  hideTitle?: boolean;
  children: React.ReactNode;
}

export function ContentLayout({ title, children, hideTitle = false }: ContentLayoutProps) {
  return (
    <div>
        {!hideTitle && <Navbar title={title} />}
      <div className="h-full min-h-[90vh] bg-background px-4 pb-8 pt-8 sm:px-8">{children}</div>
    </div>
  );
}
