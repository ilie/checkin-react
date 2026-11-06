// iOS Settings-style grouped lists for the phone sheets: a footnote label, a rounded group, and rows inset 16px
// whose hairline stops at the last one.

export const rowClasses =
  "ml-4 flex min-h-11 items-center justify-between gap-3 border-b border-sep/60 py-2.5 pr-4 last:border-0";

// A whole row that's a button, such as Sign out.
export const buttonRowClasses = `${rowClasses} w-[calc(100%-1rem)] cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`;

export function GroupLabel({ id, children }) {
  return (
    <p id={id} className="mx-8 mt-5 mb-1.5 text-footnote text-label2 uppercase">
      {children}
    </p>
  );
}

export function Group({ className = "", children }) {
  return <div className={`mx-4 overflow-hidden rounded-xl bg-cell ${className}`}>{children}</div>;
}

// An iOS switch: a checkbox with the switch role, so it's announced as on or off. Give its row label htmlFor.
export function Switch(props) {
  return (
    <input
      type="checkbox"
      role="switch"
      aria-checked={props.checked}
      className="relative h-[31px] w-[51px] shrink-0 cursor-pointer appearance-none rounded-full bg-fill transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-[27px] before:rounded-full before:bg-white before:shadow before:transition-transform checked:bg-ok checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:before:transition-none"
      {...props}
    />
  );
}
