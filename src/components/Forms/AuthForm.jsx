// The signed-out forms: a card on desktop; on phones a large title, the fields as a grouped list and a full-width button.

export const authButtonClasses =
  "py-3 text-base max-md:min-h-[50px] max-md:rounded-xl max-md:bg-accent max-md:text-body max-md:text-on-accent max-md:focus-visible:outline-accent";

// Phones get Apple's short title; desktop keeps the longer one. Only one is ever displayed, so it names the heading.
export function AuthTitle({ short, children }) {
  return (
    <h1 className="text-xl font-bold text-gray-800 max-md:text-largetitle max-md:text-label">
      <span className="md:hidden">{short}</span>
      <span className="max-md:hidden">{children}</span>
    </h1>
  );
}

// Give each Field `grouped`, so it turns into one of the rows.
export function AuthFields({ children }) {
  return (
    <div className="flex flex-col gap-5 max-md:gap-0 max-md:overflow-hidden max-md:rounded-xl max-md:bg-cell">
      {children}
    </div>
  );
}
