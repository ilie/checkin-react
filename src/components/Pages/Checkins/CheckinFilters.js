import classes from "./CheckinFilters.module.css";

export const emptyFilters = {
  user: "",
  from: "",
  to: "",
  status: "",
  source: "",
  edited: false,
  showDeleted: false,
};

// Builds the API's filter[...] query string. Admin-only filters are only sent for admins.
export function filtersToQuery(filters, isAdmin) {
  const params = new URLSearchParams();
  const add = (name, value) => value && params.append(`filter[${name}]`, value);

  if (isAdmin) {
    add("user", filters.user);
    add("trashed", filters.showDeleted ? "with" : "");
  }
  add("from", filters.from);
  add("to", filters.to);
  add("status", filters.status);
  add("source", filters.source);
  add("edited", filters.edited ? "1" : "");

  return params.toString();
}

function CheckinFilters({ filters, onChange, users, isAdmin, onExport, onHistory, canShowHistory }) {
  function changeHandler(event) {
    const { name, type, checked, value } = event.target;
    onChange({ ...filters, [name]: type === "checkbox" ? checked : value });
  }

  return (
    <div className={classes.filters}>
      <div className={classes.fields}>
        {isAdmin && (
          <label>
            Employee
            <select name="user" value={filters.user} onChange={changeHandler}>
              <option value="">All employees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          From
          <input type="date" name="from" value={filters.from} max={filters.to || undefined} onChange={changeHandler} />
        </label>
        <label>
          To
          <input type="date" name="to" value={filters.to} min={filters.from || undefined} onChange={changeHandler} />
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={changeHandler}>
            <option value="">All</option>
            <option value="open">Open (no checkout)</option>
            <option value="complete">Complete</option>
            <option value="invalid">Invalid (checkout before checkin)</option>
          </select>
        </label>
        <label>
          Source
          <select name="source" value={filters.source} onChange={changeHandler}>
            <option value="">All</option>
            <option value="clock">Clocked live</option>
            <option value="manual">Added by hand</option>
          </select>
        </label>
        <label className={classes.checkbox}>
          <input type="checkbox" name="edited" checked={filters.edited} onChange={changeHandler} />
          Edited only
        </label>
        {isAdmin && (
          <label className={classes.checkbox}>
            <input type="checkbox" name="showDeleted" checked={filters.showDeleted} onChange={changeHandler} />
            Show deleted
          </label>
        )}
      </div>
      <div className={classes.actions}>
        <button type="button" onClick={() => onChange(emptyFilters)}>
          Clear filters
        </button>
        <button type="button" onClick={onHistory} disabled={!canShowHistory}>
          History
        </button>
        <button type="button" onClick={() => onExport("checkins")}>
          Export check-ins
        </button>
        <button type="button" onClick={() => onExport("changes")}>
          Export change log
        </button>
      </div>
    </div>
  );
}

export default CheckinFilters;
