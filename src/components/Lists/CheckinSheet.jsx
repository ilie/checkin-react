import Modal from "../UI/Modal/Modal";
import { Group, GroupLabel, rowClasses } from "../UI/Grouped";
import { useCheckinHistory } from "../../hooks/checkins";
import { shortDate, shortTime } from "../../helpers/time";
import { checkinResult } from "./checkinResult";
import Detail from "./Detail";
import { useNow } from "../../hooks/useNow";

const sources = { clock: "Clocked live", manual: "Added by hand" };
const actions = { created: "Created", updated: "Changed", deleted: "Deleted", restored: "Restored" };
const fields = { user_id: "Employee", checkin_date: "Date", checkin_time: "In", checkout_time: "Out", source: "Source" };

// Times lose their seconds and sources read as on screen; anything else shows as the API sends it.
function displayValue(field, value) {
  if (value == null) return "—";
  if (field === "source") return sources[value] ?? value;
  if (field.endsWith("_time")) return shortTime(value);

  return value;
}

// "Out 17:00 → 14:30" for a change. Creations and deletions say what happened, not every value.
function describeChange(change) {
  if (change.action !== "updated") return null;

  return Object.keys(change.new_values ?? {})
    .map((field) => {
      const label = fields[field] ?? field;

      return `${label} ${displayValue(field, change.old_values?.[field])} → ${displayValue(field, change.new_values[field])}`;
    })
    .join(", ");
}

// "2026-10-27 18:12:00" becomes "27 Oct 2026, 18:12".
function changedAt(dateTime) {
  const [date, time] = dateTime.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formattedDate}, ${shortTime(time)}`;
}

// A check-in's times, source and change history. It replaces the History button on phones.
function CheckinSheet({ checkin, showEmployee, onClose }) {
  const history = useCheckinHistory(checkin.id, true);
  const now = useNow();
  const result = checkinResult(checkin, now);
  // The API lists changes oldest first; the newest matters most here.
  const changes = history.data ? [...history.data].reverse() : [];

  return (
    <Modal sheet label={shortDate(checkin.checkin_date)} onClose={onClose} onDone={onClose}>
      <Group className="mt-2">
        <dl>
          {showEmployee && <Detail label="Employee">{checkin.user_name}</Detail>}
          <Detail label="In">{shortTime(checkin.checkin_time)}</Detail>
          <Detail label="Out">{checkin.checkout_time ? shortTime(checkin.checkout_time) : "—"}</Detail>
          <Detail label="Worked">
            <span className={`font-semibold ${result.className || "text-label"}`}>{result.text}</span>
          </Detail>
          <Detail label="Source">{sources[checkin.source] ?? checkin.source}</Detail>
          {checkin.deleted_at && <Detail label="Deleted">{changedAt(checkin.deleted_at)}</Detail>}
        </dl>
      </Group>
      <GroupLabel>History</GroupLabel>
      <Group>
        {history.isPending ? (
          <p className={rowClasses}>Loading…</p>
        ) : (
          <ol>
            {changes.map((change) => (
              <li key={change.id} className="ml-4 border-b border-sep/60 py-3 pr-4 last:border-0">
                <p className="font-semibold">
                  {actions[change.action] ?? change.action} by {change.changed_by ?? change.changed_via}
                </p>
                <p className="text-subhead text-label2">
                  {[changedAt(change.created_at), describeChange(change)].filter(Boolean).join(" · ")}
                </p>
                {change.reason && <p className="mt-1 text-subhead">“{change.reason}”</p>}
              </li>
            ))}
          </ol>
        )}
      </Group>
    </Modal>
  );
}

export default CheckinSheet;
