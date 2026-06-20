function DatePicker(props: any) {
  return (
    <>
      <label>
        {props.label}
        <input
          type="date"
          value={props.value}
          onInput={(event) => props.onChange(event.target.value)}
        />
      </label>
    </>
  );
}

export default DatePicker;
