import { For } from "solid-js";

function Select(props: any) {
  return (
    <>
      <label>
        {props.label}
        <select
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
        >
          <For each={props.options}>
            {(option, _index) => {
              const index = _index();
              return <option value={option}>{option}</option>;
            }}
          </For>
        </select>
      </label>
    </>
  );
}

export default Select;
