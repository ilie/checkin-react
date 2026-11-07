import { WifiOff } from "lucide-react";
import { useOnline } from "../../pwa/useOnline";

// A state rather than a warning, so phones show it in grey, apart from Home's orange warnings. In the page flow,
// so it pushes the content down instead of covering it: below the header on desktop, and below the status bar on
// phones (App pads for it). The <output>, a status region, stays mounted so screen readers announce the change.
function OfflineBanner() {
  const isOnline = useOnline();

  return (
    <output className="block">
      {!isOnline && (
        <span className="flex items-center justify-center gap-2 border-b border-warn/20 bg-warnbg px-4 py-2 text-sm text-warn max-md:mx-4 max-md:mt-2 max-md:justify-start max-md:rounded-xl max-md:border-0 max-md:bg-fill max-md:py-2.5 max-md:text-footnote max-md:text-label">
          <WifiOff className="size-4 shrink-0" aria-hidden="true" />
          You're offline. Clock-ins are saved and sent when you're back online.
        </span>
      )}
    </output>
  );
}

export default OfflineBanner;
