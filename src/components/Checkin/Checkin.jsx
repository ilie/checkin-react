import { toast } from "sonner";
import { apiErrorMessage } from "../../helpers/api";
import { useCheckinStatus, useClock } from "../../hooks/checkins";
import useAxios from "../../hooks/useAxios";
import { useIsPhone } from "../../hooks/useIsPhone";
import { queueClock, useHasPendingClock } from "../../pwa/offlineClock";
import { turnOnRemindersByDefault } from "../../pwa/push";

function Checkin() {
  const status = useCheckinStatus();
  const clock = useClock();
  const hasPendingClock = useHasPendingClock();
  const { Axios } = useAxios();
  const isPhone = useIsPhone();

  // Offline, the tap is queued with its time. So is one whose request never got an answer,
  // since a phone can say it's online on a connection that carries nothing.
  function clockHandler(body) {
    if (!navigator.onLine) {
      queueClock(body);
      return;
    }
    clock.mutate(body, {
      // iOS has no Vibration API; calling it unguarded made every successful clock-in show an error.
      onSuccess: () => navigator.vibrate?.(200),
      onError: (error) => {
        if (error.response) toast.error(apiErrorMessage(error));
        else queueClock(body);
      },
    });
  }

  function checkinHandler() {
    // Reminders are on by default on phones (ADR 0004). Browsers only show the permission prompt from a tap,
    // so it's asked from this one. Desktop has no Me sheet to turn them off, so it gets none.
    if (isPhone && navigator.onLine) turnOnRemindersByDefault(Axios);
    clockHandler({ type: "checkin", checkin_id: null });
  }

  function checkoutHandler() {
    clockHandler({ type: "checkout", checkin_id: status.data.checkinId });
  }

  if (hasPendingClock) {
    return (
      <button
        type="button"
        disabled
        className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full border-3 border-dashed border-label2 text-[1.625rem] font-bold text-label2 md:border-white/60 md:text-[1.6rem] md:text-white/80`}
      >
        Pending
      </button>
    );
  }

  if (!status.data || clock.isPending) {
    return (
      <p className={`${sizeClasses} flex items-center justify-center text-2xl font-semibold`}>Loading ...</p>
    );
  }

  if (status.data.status !== "checkin" && status.data.status !== "checkout") return null;

  const isClockedIn = status.data.status === "checkin";

  return (
    <button
      type="button"
      onClick={isClockedIn ? checkoutHandler : checkinHandler}
      className={`${sizeClasses} relative flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[1.625rem] font-bold transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-97 md:border-3 md:border-white md:bg-brand md:text-[1.6rem] md:text-white md:focus-visible:outline-white ${isClockedIn ? "bg-accent text-on-accent" : "border-3 border-accent bg-cell text-accent"}`}
    >
      {/* A still halo on phones; on desktop, a white ring that pulses outwards. */}
      <span
        aria-hidden="true"
        className="absolute -inset-3 rounded-full border-2 border-accent/15 md:-inset-[3px] md:border-3 md:border-white md:opacity-0 md:motion-safe:animate-ring"
      ></span>
      {isClockedIn ? "Checkout" : "Checkin"}
    </button>
  );
}

// On phones it scales with the screen height, up to 220px; desktop keeps its 250px.
const sizeClasses = "size-[min(220px,27dvh)] md:size-[250px]";

export default Checkin;
