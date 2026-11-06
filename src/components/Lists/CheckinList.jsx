import { useState } from "react";
import { ChevronRight } from "lucide-react";
import CheckinSheet from "./CheckinSheet";
import { checkinResult, checkinTimes } from "./checkinResult";
import Tag from "../UI/Tag";
import { useCheckinPages } from "../../hooks/checkins";
import { useNow } from "../../hooks/useNow";
import { addDays, formatDuration, groupByWeek, isoDate, shortDate, totalSeconds, weekLabel } from "../../helpers/time";

function CheckinRow({ checkin, showEmployee, now, onSelect }) {
  const result = checkinResult(checkin, now);
  const date = shortDate(checkin.checkin_date);
  const times = checkinTimes(checkin, now);

  function handleClick() {
    onSelect(checkin.id);
  }

  return (
    <li className="ml-4 border-b border-sep/60 last:border-0">
      <button
        type="button"
        className={`flex min-h-14 w-full cursor-pointer items-center gap-3 py-2 pr-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${checkin.deleted_at ? "text-label2 line-through" : ""}`}
        onClick={handleClick}
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            {showEmployee ? checkin.user_name : date}
            {checkin.source === "manual" && <Tag>Manual</Tag>}
            {checkin.corrections_count > 0 && <Tag>Edited</Tag>}
            {checkin.deleted_at && <Tag>Deleted</Tag>}
          </span>
          <span className="block text-subhead text-label2">
            {showEmployee ? `${date} · ${times}` : times}
          </span>
        </span>
        <span className={result.className && `font-semibold ${result.className}`}>{result.text}</span>
        <ChevronRight className="size-5 shrink-0 text-label3" aria-hidden="true" />
      </button>
    </li>
  );
}

// "16h 55m of 25h", counting what was really worked: deleted check-ins don't count.
function WeekTotal({ checkins, hoursOnContract, now }) {
  const total = formatDuration(totalSeconds(checkins.filter((checkin) => !checkin.deleted_at), now));

  return (
    <span className="normal-case">
      <b className="font-semibold text-label">{total}</b>
      {hoursOnContract != null && ` of ${hoursOnContract}h`}
    </span>
  );
}

// The phone's check-ins: edge-to-edge rows under week headers, 50 at a time. A week's total shows when one person's
// rows are listed (`showTotals`), and the week is whole: inside the From and To dates, and fully loaded.
function CheckinList({ filterQuery, from, to, showEmployee, showTotals, hoursOnContract }) {
  const [selectedId, setSelectedId] = useState(null);
  const now = useNow();
  const pages = useCheckinPages(filterQuery);
  const checkins = pages.data?.pages.flatMap((page) => page.rows) ?? [];
  const weeks = groupByWeek(checkins);
  const today = isoDate(now);
  const selected = checkins.find((checkin) => checkin.id === selectedId);

  function handleClose() {
    setSelectedId(null);
  }

  function handleShowMore() {
    pages.fetchNextPage();
  }

  if (pages.isPending) return <p className="px-4 py-3 text-label2">Loading…</p>;
  if (checkins.length === 0) return <p className="px-4 py-3 text-label2">No check-ins.</p>;

  return (
    <div className="pb-4">
      {weeks.map((week, index) => {
        // Its last rows may be on the next page, or the date filter may leave some of its days out.
        const isCutOff =
          (pages.hasNextPage && index === weeks.length - 1) ||
          (from && week.start < from) ||
          (to && addDays(week.start, 6) > to);

        return (
          <section key={week.start} aria-labelledby={`week-${week.start}`} className="pt-5 first:pt-1">
            <h2
              id={`week-${week.start}`}
              className="flex items-baseline justify-between gap-3 px-4 pb-1.5 text-footnote text-label2 uppercase"
            >
              <span>{weekLabel(week.start, today)}</span>
              {showTotals && !isCutOff && <WeekTotal checkins={week.checkins} hoursOnContract={hoursOnContract} now={now} />}
            </h2>
            <ul className="bg-cell">
              {week.checkins.map((checkin) => (
                <CheckinRow
                  key={checkin.id}
                  checkin={checkin}
                  showEmployee={showEmployee}
                  now={now}
                  onSelect={setSelectedId}
                />
              ))}
            </ul>
          </section>
        );
      })}
      {pages.hasNextPage && (
        <button
          type="button"
          className="mx-4 mt-4 min-h-11 w-[calc(100%-2rem)] cursor-pointer rounded-xl bg-cell font-semibold text-accent disabled:text-label2"
          disabled={pages.isFetchingNextPage}
          onClick={handleShowMore}
        >
          {pages.isFetchingNextPage ? "Loading…" : "Show more"}
        </button>
      )}
      {selected && <CheckinSheet checkin={selected} showEmployee={showEmployee} onClose={handleClose} />}
    </div>
  );
}

export default CheckinList;
