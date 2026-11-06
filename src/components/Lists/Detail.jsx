import { rowClasses } from "../UI/Grouped";

// A label and its value in a phone sheet's grouped list. Use it inside a <dl>.
function Detail({ label, children }) {
  return (
    <div className={rowClasses}>
      <dt>{label}</dt>
      <dd className="text-right text-label2">{children}</dd>
    </div>
  );
}

export default Detail;
