import { For, createSignal, createMemo } from "solid-js";

function Tabs(props: any) {
  const [active, setActive] = createSignal(0);

  return (
    <>
      <div>
        <div role="tablist">
          <For each={props.labels}>
            {(label, _index) => {
              const index = _index();
              return (
                <button
                  role="tab"
                  aria-selected={active() === index}
                  onClick={(event) => setActive(index)}
                >
                  {label}
                </button>
              );
            }}
          </For>
        </div>
        <div role="tabpanel">{props.labels[active()]}</div>
      </div>
    </>
  );
}

export default Tabs;
