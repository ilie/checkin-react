import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerField = ({ name, value, onChange, className }) => {
  return (
    <DatePicker
    placeholderText="DD/MM/YYYY"
      className={className}
      dateFormat="dd/MM/yyyy"
      selected={(value && new Date(value)) || null}
      onChange={(val) => {
        onChange(name, val);
      }}
    />
  );
};

export default DatePickerField;
