import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "../helpers/api";
import useAxios from "../hooks/useAxios";
import {
  currentSubscription,
  pushMethod,
  rememberTurnedOff,
  subscribePush,
  subscriptionChanges,
  unsubscribePush,
} from "./push";

// The reminders switch, in the Me sheet on a phone and the header on desktop: what it can do (pushMethod)
// and whether this device is subscribed.
export function usePush() {
  const { Axios } = useAxios();
  const method = pushMethod();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (method !== "switch") return;
    let isCurrent = true;
    function read() {
      currentSubscription().then((subscription) => {
        if (isCurrent) setIsEnabled(subscription !== null);
      });
    }
    read();
    subscriptionChanges.addEventListener("change", read);

    return () => {
      isCurrent = false;
      subscriptionChanges.removeEventListener("change", read);
    };
  }, [method]);

  async function change(request) {
    setIsBusy(true);
    try {
      await request();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  function enable() {
    return change(async () => {
      rememberTurnedOff(false);
      if (await subscribePush(Axios)) setIsEnabled(true);
      else toast.error("Notifications are blocked for Checkin. Allow them in your phone or browser settings, then try again.");
    });
  }

  function disable() {
    return change(async () => {
      await unsubscribePush(Axios);
      rememberTurnedOff(true);
      setIsEnabled(false);
    });
  }

  return { method, isEnabled, isBusy, enable, disable };
}
