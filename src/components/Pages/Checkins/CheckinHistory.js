import classes from "./CheckinHistory.module.css";

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
    <div className={classes.history}>
      <h2>Change history</h2>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <table className={classes.table}>
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>What</th>
              <th>Values</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr key={change.id}>
                <td>{change.created_at}</td>
                <td>{change.changed_by ?? change.changed_via}</td>
                <td>{actionLabels[change.action] ?? change.action}</td>
                <td>{describeValues(change.old_values, change.new_values)}</td>
                <td>{change.reason ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={classes.footer}>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default CheckinHistory;
