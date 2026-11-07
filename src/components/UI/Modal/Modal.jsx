import { useEffect, useRef } from "react";
import { isPhone } from "../../../hooks/useIsPhone";

const centred = "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] rounded-2xl";

// On phones a sheet is pinned to the bottom edge and slides up, unless the user asked for less motion.
const sheetClasses =
  "outline-none open:flex open:flex-col max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] max-md:w-full max-md:max-w-none max-md:rounded-t-[14px] max-md:rounded-b-none bg-bg text-label max-md:motion-safe:transition-transform max-md:motion-safe:duration-300 max-md:motion-safe:ease-out max-md:starting:open:translate-y-full";

const barButtonClasses =
  "min-h-11 cursor-pointer rounded px-1 text-accent focus-visible:outline-2 focus-visible:outline-accent";

// A native <dialog>: the browser traps focus, closes on Escape and draws the backdrop.
// Render it only while it's open; unmounting closes it. Escape and a click on the backdrop call onClose.
//
// A `sheet` has a bar with its label as the title, a Cancel-style button on the left when `cancelLabel` is set
// (it calls onClose), and Done on the right when `onDone` is set. On phones it's a bottom sheet with a grabber,
// and dragging the grabber or the bar down far enough closes it.
function Modal({ onClose, label, wide = false, sheet = false, cancelLabel, onDone, children }) {
  const dialogRef = useRef(null);
  const dragRef = useRef(null);

  // showModal() is the only way to open a <dialog> as a modal. It focuses the first button, so a sheet then
  // focuses itself, as on iOS, instead of opening with a ring on Cancel. Tab still moves into it.
  useEffect(() => {
    dialogRef.current.showModal();
    if (sheet) dialogRef.current.focus();
  }, [sheet]);

  // React passes a nested dialog's cancel up through this one's onCancel too, which would close both.
  function handleCancel(event) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  // The bar's buttons keep their own taps; a drag starts anywhere else on the grabber or bar.
  function handleDragStart(event) {
    if (!isPhone() || event.target.closest("button")) return;
    dragRef.current = { startY: event.clientY, distance: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    dialogRef.current.style.transition = "none";
  }

  function handleDragMove(event) {
    if (!dragRef.current) return;
    dragRef.current.distance = Math.max(0, event.clientY - dragRef.current.startY);
    dialogRef.current.style.transform = `translateY(${dragRef.current.distance}px)`;
  }

  // Past a quarter of its height the sheet closes; short of that it springs back.
  function handleDragEnd() {
    if (!dragRef.current) return;
    const { distance } = dragRef.current;
    dragRef.current = null;
    dialogRef.current.style.transition = "";
    dialogRef.current.style.transform = "";
    if (distance > dialogRef.current.offsetHeight / 4) onClose();
  }

  return (
    // The dialog's own click handler only catches backdrop clicks; Escape is handled by onCancel.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-label={label}
      tabIndex={sheet ? -1 : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={`${centred} overflow-hidden p-0 shadow-2xl backdrop:bg-black/40 ${wide ? "max-w-4xl" : "max-w-xl"} ${sheet ? sheetClasses : ""}`}
    >
      {sheet && (
        <div
          className="shrink-0 touch-none select-none"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div aria-hidden="true" className="mx-auto mt-1.5 h-[5px] w-9 rounded-full bg-label3 md:hidden"></div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-1">
            {cancelLabel ? (
              <button type="button" className={`${barButtonClasses} justify-self-start`} onClick={onClose}>
                {cancelLabel}
              </button>
            ) : (
              <span></span>
            )}
            <h2 className="justify-self-center font-semibold">{label}</h2>
            {onDone && (
              <button type="button" className={`${barButtonClasses} justify-self-end font-bold`} onClick={onDone}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
      {sheet ? <div className="min-h-0 overflow-y-auto overscroll-contain pb-4 max-md:pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div> : children}
    </dialog>
  );
}

export default Modal;
