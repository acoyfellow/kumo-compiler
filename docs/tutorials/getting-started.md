# Getting started

In this tutorial you will install Kumo for your framework and render your first
component. By the end you will have a `Button` (and a working `DropdownMenu`)
on screen. It takes about five minutes.

Pick the framework you are using and follow that track. The three tracks are
independent — each installs a different native npm package.

## What you need

- Node.js 18 or newer
- An existing Vue, Svelte, or Solid project (created with Vite, SvelteKit,
  SolidStart, or similar). If you don't have one, create a Vite app first:

  ```bash
  npm create vite@latest my-app
  cd my-app
  npm install
  ```

Each Kumo package is a **native** package for its framework. You import
components the same way you import any other component in that framework. There
is no Kumo runtime to register and no build plugin to add.

---

## Vue

### 1. Install

```bash
npm i @acoyfellow/kumo-vue
```

### 2. Import and use

```vue
<script setup>
import { Button, DropdownMenu } from '@acoyfellow/kumo-vue'
</script>

<template>
  <Button>Continue</Button>
  <DropdownMenu />
</template>
```

### 3. Run

```bash
npm run dev
```

Open the dev server URL. You should see a Kumo `Button`, and the
`DropdownMenu` opens when you click it.

---

## Svelte

### 1. Install

```bash
npm i @acoyfellow/kumo-svelte
```

### 2. Import and use

```svelte
<script>
  import { Button, DropdownMenu } from '@acoyfellow/kumo-svelte'
</script>

<Button>Continue</Button>
<DropdownMenu />
```

### 3. Run

```bash
npm run dev
```

Open the dev server URL. The `Button` renders and the `DropdownMenu` opens on
click.

---

## Solid

### 1. Install

```bash
npm i @acoyfellow/kumo-solid
```

### 2. Import and use

```jsx
import { render } from 'solid-js/web'
import { Button, DropdownMenu } from '@acoyfellow/kumo-solid'

function App() {
  return (
    <>
      <Button>Continue</Button>
      <DropdownMenu />
    </>
  )
}

render(() => <App />, document.getElementById('app'))
```

### 3. Run

```bash
npm run dev
```

Open the dev server URL. You should see the `Button` and an interactive
`DropdownMenu`.

---

## What just happened

You installed a single native package and imported components from it as named
exports. The components you rendered are **real** Vue / Svelte / Solid
components — they were compiled from one canonical definition ahead of time, so
the `Button` you used and the `Button` in the other two frameworks share the
same API.

## Next steps

- Browse every available component in the [reference](../reference/components.md).
- Learn how to [add a component to a page](../how-to/add-a-component.md).
- Understand [how the compiler works](../explanation/how-the-compiler-works.md).
