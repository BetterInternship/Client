export const Header = ({ showUser }: { showUser: boolean }) => {
  return (
    <div className="w-full flex items-center justify-between px-16 h-20 bg-teal-800">
      <span className="text-white/75 text-4xl tracking-tighter">
        University MOA Portal
      </span>
      {showUser && (
        <span className="text-white/75">ABC Corp • john@abc.com</span>
      )}
    </div>
  );
};
