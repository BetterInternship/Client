export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border border-gray-200 rounded-[0.33em] p-4">
      {children}
    </div>
  );
};
