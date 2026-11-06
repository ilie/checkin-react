const control =
  "rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-brand/30 aria-invalid:border-red-600";

export const inputClasses = `w-full px-3 py-2 text-base ${control}`;
// Without a width, for controls that sit inline.
export const smallControlClasses = `px-2.5 py-1.5 text-sm ${control}`;
export const smallInputClasses = `w-full ${smallControlClasses}`;

// `grouped` fields become iOS rows on phones: the label on the left, a borderless 17px input on the right and the
// error below them. The label turns accent while its input has focus, since the input has no outline there.
const grouped = {
  wrapper:
    "group/field max-md:ml-4 max-md:min-h-11 max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-0 max-md:border-b max-md:border-sep/60 max-md:py-1.5 max-md:pr-4 max-md:last:border-0",
  label:
    "max-md:w-24 max-md:shrink-0 max-md:text-body max-md:font-medium max-md:text-label max-md:group-focus-within/field:text-accent",
  input:
    "max-md:w-auto max-md:min-w-0 max-md:flex-1 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:px-0 max-md:py-1 max-md:text-body max-md:text-label max-md:placeholder:text-label2 max-md:focus-visible:outline-none",
  error: "max-md:basis-full max-md:pb-1 max-md:text-footnote max-md:text-bad",
};

// A labelled form control with its error. `children` renders the control from the props it should take,
// so the error is announced with the field: (props) => <input {...props} />.
function Field({ id, label, required = false, grouped: isGrouped = false, error, children }) {
  const errorId = `${id}-error`;
  const extra = (part) => (isGrouped ? ` ${grouped[part]}` : "");

  return (
    <div className={`flex flex-col gap-1.5${extra("wrapper")}`}>
      <label htmlFor={id} className={`text-sm font-semibold text-gray-700${extra("label")}`}>
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({
        id,
        className: `${inputClasses}${extra("input")}`,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className={`text-sm text-red-700${extra("error")}`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Field;
