import { useContext } from "react";
import Checkin from "../../Checkin/Checkin";
import ClockCard from "./ClockCard";
import MissingCheckout from "./MissingCheckout";
import TodayCard from "./TodayCard";
import WeekCard from "./WeekCard";
import AuthContext from "../../../store/auth-context";
import { emptyFilters, filtersToQuery } from "../Checkins/CheckinFilters";
import { useCheckinStatus, useCheckins } from "../../../hooks/checkins";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { useNow } from "../../../hooks/useNow";
import { addDays, greeting, isoDate, longDate, shortTime, weekStart } from "../../../helpers/time";

// Workers only ever get their own check-ins. Admins get everyone's, and only they may filter by user,
// so they need the id saved at login.
function useOwnCheckins(filters, pageSize, sort) {
  const { isAdmin, user } = useContext(AuthContext);
  const query = filtersToQuery({ ...emptyFilters, ...filters, user: user?.id ?? "" }, isAdmin);

  return useCheckins(query, 1, pageSize, sort, !isAdmin || Boolean(user));
}

// A greeting and any missing check-out, then on phones a clock, the button and today's card in one column,
// and on desktop the Today and This week cards side by side (ADR 0006).
function Home() {
  const { user } = useContext(AuthContext);
  const isPhone = useIsPhone();
  const now = useNow();
  const today = isoDate(now);
  const status = useCheckinStatus();
  const missing = useOwnCheckins({ status: "open", to: addDays(today, -1) }, 1, "checkin_date");
  // A week holds a handful of check-ins; 100 is far more than one person can make.
  const week = useOwnCheckins({ from: weekStart(today), to: today }, 100, "-checkin_date");
  const firstName = user?.name.split(" ")[0];
  const oldestMissing = missing.data?.rows[0];

  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 pt-2 pb-3 md:max-w-[1040px] md:gap-5 md:px-8 md:pt-7 md:pb-8">
      <title>Home · Checkin</title>
      <header>
        <h1 className="text-title1 font-bold md:text-mac-large">
          {firstName ? `${greeting(now)}, ${firstName}` : greeting(now)}
        </h1>
        <p className="text-subhead text-label2 md:mt-0.5 md:text-mac-body">{longDate(now)}</p>
      </header>
      {oldestMissing && <MissingCheckout checkin={oldestMissing} />}
      {isPhone ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[min(28px,3dvh)]">
            {/* The status bar already shows the time on short screens such as the iPhone SE. */}
            <p className="text-[min(64px,7.5dvh)] leading-none font-light tracking-tight tabular-nums [@media(height<720px)]:hidden">
              <time dateTime={now.toISOString()}>{shortTime(now.toTimeString())}</time>
            </p>
            <Checkin />
          </div>
          {status.data && week.data && (
            <TodayCard status={status.data} week={week.data.rows} hoursOnContract={user?.hoursOnContract} now={now} />
          )}
        </>
      ) : (
        <div className="flex items-stretch gap-5">
          <ClockCard status={status.data} week={week.data?.rows} now={now} />
          {week.data && <WeekCard week={week.data.rows} hoursOnContract={user?.hoursOnContract} now={now} />}
        </div>
      )}
    </div>
  );
}

export default Home;
