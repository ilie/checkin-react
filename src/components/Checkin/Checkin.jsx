import { toast } from "sonner";
import { apiErrorMessage } from "../../helpers/api";
import { useCheckinStatus, useClock } from "../../hooks/checkins";
import useAxios from "../../hooks/useAxios";
import { queueClock, useHasPendingClock } from "../../pwa/offlineClock";
import { turnOnRemindersByDefault } from "../../pwa/push";

function Checkin() {
  const status = useCheckinStatus();
  const clock = useClock();
  const hasPendingClock = useHasPendingClock();
  const { Axios } = useAxios();

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
    // Reminders are on by default (ADRs 0004 and 0005). Browsers only show the permission prompt from a tap,
    // so it's asked from this one.
    if (navigator.onLine) turnOnRemindersByDefault(Axios);
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
        className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full border-3 border-dashed border-label2 text-[1.625rem] font-bold text-label2 md:text-2xl`}
      >
        Pending
      </button>
    );
  }

  if (!status.data || clock.isPending) {
    return <p className={`${sizeClasses} flex items-center justify-center text-2xl font-semibold`}>Loading ...</p>;
  }

  if (status.data.status !== "checkin" && status.data.status !== "checkout") return null;

  const isClockedIn = status.data.status === "checkin";

  return (
    <button
      type="button"
      onClick={isClockedIn ? checkoutHandler : checkinHandler}
      className={`${sizeClasses} relative flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[1.625rem] font-bold transition-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-97 md:text-2xl ${isClockedIn ? "bg-accent text-on-accent" : "border-3 border-accent bg-cell text-accent"}`}
    >
      {/* A still halo, on phones and desktop alike. */}
      <span aria-hidden="true" className="absolute -inset-3 rounded-full border-2 border-accent/15"></span>
      {isClockedIn ? "Checkout" : "Checkin"}
    </button>
  );
}

// On phones it scales with the screen height, up to 220px; desktop's is 200px, in the Today card.
const sizeClasses = "size-[min(220px,27dvh)] md:size-[200px]";

export default Checkin;
