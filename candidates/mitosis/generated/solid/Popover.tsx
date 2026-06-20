import { createSignal, createMemo } from "solid-js";

function Popover(props: any) {
  const [open, setOpen] = createSignal(false);

  return (
    <>
      <div>
        <button aria-expanded={open()} onClick={(event) => setOpen(!open())}>
          {props.label}
        </button>
        <div hidden={!open()}>{props.children}</div>
      </div>
    </>
  );
}

export default Popover;
