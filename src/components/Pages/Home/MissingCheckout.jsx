import { TriangleAlert } from "lucide-react";
import { shortDate, shortTime } from "../../../helpers/time";

// An earlier day left open. Workers can't fix it themselves, so it says who can.
function MissingCheckout({ checkin }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-warnbg px-4 py-3 text-warn">
      <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-subhead">
        <b>Missing check-out</b> on {shortDate(checkin.checkin_date)} (in at {shortTime(checkin.checkin_time)}). Ask an
        admin to fix it.
      </p>
    </div>
  );
}

export default MissingCheckout;
