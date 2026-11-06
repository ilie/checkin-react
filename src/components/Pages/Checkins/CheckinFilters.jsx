import { Download, FilterX, History } from "lucide-react";
import Button from "../../UI/Button";
import { smallInputClasses } from "../../UI/Field";

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
    <section aria-label="Filters" className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {isAdmin && (
          <label className={labelClasses}>
            Employee
            <select name="user" value={filters.user} onChange={changeHandler} className={smallInputClasses}>
              <option value="">All employees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={labelClasses}>
          From
          <input
            type="date"
            name="from"
            value={filters.from}
            max={filters.to || undefined}
            onChange={changeHandler}
            className={smallInputClasses}
          />
        </label>
        <label className={labelClasses}>
          To
          <input
            type="date"
            name="to"
            value={filters.to}
            min={filters.from || undefined}
            onChange={changeHandler}
            className={smallInputClasses}
          />
        </label>
        <label className={labelClasses}>
          Status
          <select name="status" value={filters.status} onChange={changeHandler} className={smallInputClasses}>
            <option value="">All</option>
            <option value="open">Open (no checkout)</option>
            <option value="complete">Complete</option>
            <option value="invalid">Invalid (checkout before checkin)</option>
          </select>
        </label>
        <label className={labelClasses}>
          Source
          <select name="source" value={filters.source} onChange={changeHandler} className={smallInputClasses}>
            <option value="">All</option>
            <option value="clock">Clocked live</option>
            <option value="manual">Added by hand</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4">
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              name="edited"
              checked={filters.edited}
              onChange={changeHandler}
              className={checkboxClasses}
            />
            Edited only
          </label>
          {isAdmin && (
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="showDeleted"
                checked={filters.showDeleted}
                onChange={changeHandler}
                className={checkboxClasses}
              />
              Show deleted
            </label>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onChange(emptyFilters)}>
            <FilterX className="size-4" aria-hidden="true" /> Clear filters
          </Button>
          <Button onClick={onHistory} disabled={!canShowHistory}>
            <History className="size-4" aria-hidden="true" /> History
          </Button>
          <Button onClick={() => onExport("checkins")}>
            <Download className="size-4" aria-hidden="true" /> Export check-ins
          </Button>
          <Button onClick={() => onExport("changes")}>
            <Download className="size-4" aria-hidden="true" /> Export change log
          </Button>
        </div>
      </div>
    </section>
  );
}

const labelClasses = "flex flex-col gap-1 text-sm font-semibold text-gray-700";
const checkboxLabelClasses = "flex cursor-pointer items-center gap-2 text-sm text-gray-700";
const checkboxClasses = "size-4 accent-brand";

export default CheckinFilters;
