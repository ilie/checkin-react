import { useState } from "react";
import { ChevronsUpDown, Download, Share, SlidersHorizontal } from "lucide-react";
import Modal from "../../UI/Modal/Modal";
import { Group, GroupLabel, Switch, buttonRowClasses, rowClasses } from "../../UI/Grouped";
import { emptyFilters } from "./CheckinFilters";

const pillClasses =
  "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-fill px-3.5 text-subhead font-semibold text-accent focus-visible:outline-2 focus-visible:outline-accent";
const valueClasses = "rounded-md bg-fill px-2 py-1 text-label";

// A date range counts once, as in the mockups.
function activeFilterCount(filters) {
  return [filters.from || filters.to, filters.user, filters.status, filters.source, filters.edited, filters.showDeleted].filter(
    Boolean,
  ).length;
}

function SelectRow({ label, name, value, onChange, children }) {
  return (
    <label className={rowClasses}>
      {label}
      <span className="relative flex items-center gap-1 text-label2">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="max-w-48 cursor-pointer appearance-none truncate bg-transparent text-right focus-visible:outline-2 focus-visible:outline-accent"
        >
          {children}
        </select>
        <ChevronsUpDown className="size-4 shrink-0 text-label3" aria-hidden="true" />
      </span>
    </label>
  );
}

// Changes stay in a draft until Done, as in iOS; Cancel, the backdrop and a drag leave the filters as they were.
function FiltersSheet({ filters, onChange, users, isAdmin, onClose }) {
  const [draft, setDraft] = useState(filters);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setDraft({ ...draft, [name]: type === "checkbox" ? checked : value });
  }

  function handleReset() {
    setDraft(emptyFilters);
  }

  function handleDone() {
    onChange(draft);
    onClose();
  }

  return (
    <Modal sheet label="Filters" cancelLabel="Cancel" onClose={onClose} onDone={handleDone}>
      <GroupLabel>When</GroupLabel>
      <Group>
        <label className={rowClasses}>
          From
          <input type="date" name="from" value={draft.from} max={draft.to || undefined} onChange={handleChange} className={valueClasses} />
        </label>
        <label className={rowClasses}>
          To
          <input type="date" name="to" value={draft.to} min={draft.from || undefined} onChange={handleChange} className={valueClasses} />
        </label>
      </Group>
      <GroupLabel>Which</GroupLabel>
      <Group>
        {isAdmin && (
          <SelectRow label="Employee" name="user" value={draft.user} onChange={handleChange}>
            <option value="">All</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </SelectRow>
        )}
        <SelectRow label="Status" name="status" value={draft.status} onChange={handleChange}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="complete">Complete</option>
          <option value="invalid">Invalid</option>
        </SelectRow>
        <SelectRow label="Source" name="source" value={draft.source} onChange={handleChange}>
          <option value="">All</option>
          <option value="clock">Clocked live</option>
          <option value="manual">Added by hand</option>
        </SelectRow>
        <label htmlFor="filter-edited" className={rowClasses}>
          Edited only
          <Switch id="filter-edited" name="edited" checked={draft.edited} onChange={handleChange} />
        </label>
        {isAdmin && (
          <label htmlFor="filter-showDeleted" className={rowClasses}>
            Show deleted
            <Switch id="filter-showDeleted" name="showDeleted" checked={draft.showDeleted} onChange={handleChange} />
          </label>
        )}
      </Group>
      <Group className="mt-5">
        <button type="button" className={`${buttonRowClasses} justify-center text-bad`} onClick={handleReset}>
          Reset filters
        </button>
      </Group>
    </Modal>
  );
}

function ExportSheet({ onExport, onClose }) {
  function handleCheckins() {
    onExport("checkins");
  }

  function handleChanges() {
    onExport("changes");
  }

  return (
    <Modal sheet label="Export" onClose={onClose} onDone={onClose}>
      <p className="mx-8 mt-1 mb-1.5 text-footnote text-label2">CSV files with the check-ins you've filtered.</p>
      <Group>
        <button type="button" className={`${buttonRowClasses} justify-start`} onClick={handleCheckins}>
          <Download className="size-5 text-accent" aria-hidden="true" />
          <span className="flex-1">Export check-ins</span>
        </button>
        <button type="button" className={`${buttonRowClasses} justify-start`} onClick={handleChanges}>
          <Download className="size-5 text-accent" aria-hidden="true" />
          <span className="flex-1">Export change log</span>
        </button>
      </Group>
    </Modal>
  );
}

// The phone's Filters and Export buttons under the large title, each opening its sheet.
function CheckinToolbar({ filters, onChange, users, isAdmin, onExport }) {
  // "filters", "export" or null.
  const [openSheet, setOpenSheet] = useState(null);
  const count = activeFilterCount(filters);

  function handleFiltersOpen() {
    setOpenSheet("filters");
  }

  function handleExportOpen() {
    setOpenSheet("export");
  }

  function handleClose() {
    setOpenSheet(null);
  }

  return (
    <div className="flex gap-2 px-4 pb-3">
      <button type="button" className={pillClasses} aria-haspopup="dialog" onClick={handleFiltersOpen}>
        <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
        Filters
        {count > 0 && (
          <span className="rounded-full bg-accent px-1.5 text-xs text-on-accent">
            {count}
            <span className="sr-only"> on</span>
          </span>
        )}
      </button>
      <button type="button" className={pillClasses} aria-haspopup="dialog" onClick={handleExportOpen}>
        <Share className="size-[18px]" aria-hidden="true" />
        Export
      </button>
      {openSheet === "filters" && (
        <FiltersSheet filters={filters} onChange={onChange} users={users} isAdmin={isAdmin} onClose={handleClose} />
      )}
      {openSheet === "export" && <ExportSheet onExport={onExport} onClose={handleClose} />}
    </div>
  );
}

export default CheckinToolbar;
