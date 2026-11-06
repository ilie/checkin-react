import Button from "../../UI/Button";

const actionLabels = {
  created: "Created",
  updated: "Changed",
  deleted: "Deleted",
  restored: "Restored",
};

function describeValues(oldValues, newValues) {
  const fields = Object.keys({ ...oldValues, ...newValues });

  return fields
    .map((field) => {
      const before = oldValues?.[field] ?? "—";
      const after = newValues?.[field] ?? "—";

      return oldValues && newValues ? `${field}: ${before} → ${after}` : `${field}: ${oldValues ? before : after}`;
    })
    .join(", ");
}

function CheckinHistory({ changes, isLoading, onClose }) {
  return (
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <h2 className="bg-brand px-6 py-4 text-xl font-bold text-white">Change history</h2>
      <div className="overflow-auto px-6 py-4">
        {isLoading ? (
          <p>Loading…</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-600">
              <tr>
                <th className={cellClasses}>When</th>
                <th className={cellClasses}>Who</th>
                <th className={cellClasses}>What</th>
                <th className={cellClasses}>Values</th>
                <th className={cellClasses}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={change.id}>
                  <td className={`${cellClasses} whitespace-nowrap`}>{change.created_at}</td>
                  <td className={cellClasses}>{change.changed_by ?? change.changed_via}</td>
                  <td className={cellClasses}>{actionLabels[change.action] ?? change.action}</td>
                  <td className={cellClasses}>{describeValues(change.old_values, change.new_values)}</td>
                  <td className={cellClasses}>{change.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <footer className="flex justify-end border-t border-gray-200 px-6 py-4">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </footer>
    </div>
  );
}

const cellClasses = "border-b border-gray-100 px-2 py-1.5 align-top";

export default CheckinHistory;
