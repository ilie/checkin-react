// Today's status with its dot: "Clocked in since 09:05 · 55m so far today". `today` comes from todayStatus().
// The phone's Today card and the desktop's clock card both show it, at their own sizes.
function StatusLine({ today }) {
  return (
    <div className="flex items-start gap-3 px-1 max-md:items-center max-md:px-4 max-md:py-3">
      <span
        aria-hidden="true"
        className={`mt-1 size-2.5 shrink-0 rounded-full max-md:mt-0 max-md:size-3 ${today.isOpen ? "bg-ok ring-4 ring-ok/20" : "bg-label3"}`}
      ></span>
      <div>
        <p className="text-mac-title3 font-semibold max-md:text-body">{today.title}</p>
        {today.detail && <p className="mt-0.5 text-label2 max-md:mt-0 max-md:text-subhead">{today.detail}</p>}
      </div>
    </div>
  );
}

export default StatusLine;
