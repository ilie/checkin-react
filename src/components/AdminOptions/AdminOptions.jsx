// The admin's toolbar. Editing needs the desktop layout, so phones don't get it.
function AdminOptions({ children }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-200 max-md:hidden">
      {children}
    </div>
  );
}

export default AdminOptions;
