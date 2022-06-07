import TimePicker from "react-time-picker";

const TimePickerField = ({ name, value, onChange, className }) => {
  return (
    <TimePicker
      placeholderText="DD/MM/YYYY"
      className={className}
      disableClock={true}
      format="HH:mm:ss"
      hourPlaceholder="09"
      minutePlaceholder="41"
      secondPlaceholder="02"
      value={value}
      selected={value || null}
      onChange={(val) => {
        onChange(name, val);
      }}
    />
  );
};

export default TimePickerField;