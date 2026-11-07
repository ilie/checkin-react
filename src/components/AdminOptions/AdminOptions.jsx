// The admin's toolbar. Editing needs the desktop layout, so phones don't get it.
function AdminOptions({ children }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[18px] bg-cell p-2 max-md:hidden">
      {children}
    </div>
  );
}

export default AdminOptions;
