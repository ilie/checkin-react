import { useContext } from "react";
import Checkin from "../../Checkin/Checkin";
import MissingCheckout from "./MissingCheckout";
import TodayCard from "./TodayCard";
import AuthContext from "../../../store/auth-context";
import { emptyFilters, filtersToQuery } from "../Checkins/CheckinFilters";
import { useCheckinStatus, useCheckins } from "../../../hooks/checkins";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { useNow } from "../../../hooks/useNow";
import { addDays, greeting, isoDate, longDate, shortTime, weekStart } from "../../../helpers/time";

// Workers only ever get their own check-ins. Admins get everyone's, and only they may filter by user,
// so they need the id saved at login. Desktop shows none of this, so it asks for none of it.
function useOwnCheckins(filters, pageSize, sort) {
  const { isAdmin, user } = useContext(AuthContext);
  const isPhone = useIsPhone();
  const query = filtersToQuery({ ...emptyFilters, ...filters, user: user?.id ?? "" }, isAdmin);

  return useCheckins(query, 1, pageSize, sort, isPhone && (!isAdmin || Boolean(user)));
}

// On phones: a greeting, any missing check-out, a clock, the button and today's card.
// On desktop: the button on navy, as before.
function Home() {
  const { user } = useContext(AuthContext);
  const now = useNow();
  const today = isoDate(now);
  const status = useCheckinStatus();
  const missing = useOwnCheckins({ status: "open", to: addDays(today, -1) }, 1, "checkin_date");
  // A week holds a handful of check-ins; 100 is far more than one person can make.
  const week = useOwnCheckins({ from: weekStart(today), to: today }, 100, "-checkin_date");
  const firstName = user?.name.split(" ")[0];
  const oldestMissing = missing.data?.rows[0];

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pt-2 pb-3 md:items-center md:justify-center md:bg-brand md:p-10 md:text-white">
      <title>Home · Checkin</title>
      <header className="md:hidden">
        <h1 className="text-title1 font-bold">{firstName ? `${greeting(now)}, ${firstName}` : greeting(now)}</h1>
        <p className="text-subhead text-label2">{longDate(now)}</p>
      </header>
      {oldestMissing && (
        <div className="md:hidden">
          <MissingCheckout checkin={oldestMissing} />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[min(28px,3dvh)]">
        {/* The status bar already shows the time on short screens such as the iPhone SE. */}
        <p className="text-[min(64px,7.5dvh)] leading-none font-light tracking-tight tabular-nums md:hidden [@media(height<720px)]:hidden">
          <time dateTime={now.toISOString()}>{shortTime(now.toTimeString())}</time>
        </p>
        <Checkin />
      </div>
      {status.data && week.data && (
        <div className="md:hidden">
          <TodayCard status={status.data} week={week.data.rows} hoursOnContract={user?.hoursOnContract} now={now} />
        </div>
      )}
    </div>
  );
}

export default Home;
