![logo - cartoon seagul with a wide open beak and the letters S V A W C](./readme_files/svawc%20logo.png)

# SVAWC

**Sv**elte **A**-Frame **W**eb **C**omponents

SVAWC brings modern reactive development and HTML templating to A-Frame component development without compromising on speed, usability, or bundle size. 

## How it works

1. Write reactive template code using Svelte
1. Svelte compiles that down to efficient `createElement`, `setAttibute`, et c. calls (no virtual DOM or unecessary entity recreation)
2. SVAWC packages it into Web Components for distribution
3. Link the packaged script and then use the Web Component in any A-Frame scene, works with bundled apps and vanilla JS & HTML

## What it looks like

**Svelte reactive template source:**

```Svelte
<!-- APerson.svelte -->
<script>
  // props, converted to dash case on WebComponent, e.g. shirt-color
  export let skinColor = 'burlywood'
  export let shirtColor = 'seagreen'
  export let pantsColor = 'slateblue'
  // computed variables
  $: skinMaterial = { color: skinColor, roughness: 0.9 }
  $: shirtMaterial = { color: shirtColor }
  $: pantsMaterial = { color: pantsColor }
  const limbs = [-1, 1]
</script>

<a-entity
  class="head" 
  position={{ x: 0, y: 1.6, z: 0 }}
  geometry={{ primitive: 'sphere', radius: 0.2 }}
  material={skinMaterial}
  shadow
/>
<a-entity
  class="body"
  position={{ x: 0, y: 1.05, z: 0 }}
  geometry={{primitive: 'cylinder', radius: 0.25, height: 0.7 }}
  material={shirtMaterial}
  shadow
>
  <!-- loops -->
  {#each limbs as side (side)}
    <a-entity
      class="arm"
      position={{ x: side *  0.3, y: 0.05, z: 0 }}
      rotation={{ x: 0, y: 0, z: side * 30 }}
      geometry={{ primitive: 'cylinder', radius: 0.1, height: 0.7 }}
      material={shirtMaterial}
      shadow
      />
  {/each}
</a-entity>
{#each limbs as side (side)}
  <a-entity
    class="leg"
    position={{ x: side * 0.1, y: 0.35, z: 0 }}
    rotation={{ x: 0, y: 0, z: side * 10 }}
    geometry={{ primitive: 'cylinder', radius: 0.15, height: 0.7 }}
    material={pantsMaterial}
    shadow
    />
{/each}
```

The above is just standard Svelte code.
[Check out their guide](https://svelte.dev/tutorial/basics) if you're not already familiar.

**SVAWC Wrapper:**

```js
import { registerWebComponent } from 'svawc'
import APerson from "./APerson.svelte"
registerWebComponent({Component: APerson, tagname: "a-person", props: ["skinColor", "shirtColor", "pantsColor"] })
```


Usage in A-Frame Scene:

```html
<head>
	<script src="https://aframe.io/releases/1.4.1/aframe.js"></script>
	<script src='https://cdn.jsdelivr.net/npm/svawc-template'></script>
</head>

<body>

	<a-scene>
		<a-person position="0 0 -3"></a-person>
		<a-person position="1 0 -3" skin-color="peachpuff" shirt-color="grey" pants-color="darkgrey"></a-person>
		<a-person position="-1 0 -3" skin-color="sienna" shirt-color="pink" pants-color="white"></a-person>
	</a-scene>
</body>
```

[Try it out](https://momentous-jelly-secure.glitch.me/)

## Why it's useful

I love A-Frame, but the recurring pain points for me in large apps are handling complex reactive state
and making nested entity structures re-usable.

Solutions for the reactive state generally involve meta-components
like `event-set` or the creation of one-off 'components' that just handle business logic.
These tend to spread your logic around and make a large codebase harder to maintain.
For re-usable structures, you're either stuck with HTML templates, which are awkward to use, bloat your index.html,
and again serve to keep your structure far from your logic, or you've got to write tons of tedious
`createElement` and `setAttribute` calls.

SVAWC lets you write the organized, concise code we're accustomed to from modern
reactive frameworks and integrate it seamlessly in any A-Frame project. SVAWC is
the A-Frame answer to React Three Fiber, which is a lovely and powerful framework,
but never feels quite right to me due the lack of ECS.

## API documentation

View the full API documentation at
[https://immers-space.github.io/svawc](https://immers-space.github.io/svawc)

## Get Started

The [svawc-template repo](https://github.com/immers-space/svawc-template/generate) has everything you need to start building and publishing SVAWCs.
[Click here to create a copy of it](https://github.com/immers-space/svawc-template/generate).

## Feature status

This library is fully functional, but some of the features still need some polish

<dl>
  <dt>🙂 Svelte props as HTML Attributes</dt>
  <dd>
    Svelte props become attributes on the custom element, converting camelCase to dash-case
    automatically. For now, the props must be explicitly listed in the `props` option, but
    I'd like to be able to infer them automatically in the future.
  </dd>
  <dt>😀 Light DOM</dt>
  <dd>
    All component output is rendered to the light DOM as children of the custom element.
    Shadow DOM is not available as the boundary breaks A-Frame's scene graph logic,
    and the benefits of Shadow DOM are primarily CSS encapsulation which isn't relevant here.
  </dd>
  <dt>😐 Slots</dt>
  <dd>
    Full slot functionality is available including default and named slots.
    There's an issue with A-Frame compatibility that generates console errors from slotted
    entities trying to initialize within a document fragment, but it doesn't seem to cause
    any issues. Will work on fixes to avoid those errors.
  </dd>
  <dt>😦 Dependency Injection</dt>
  <dd>
    Not available yet, but I'd like to have it work where dependencies on A-Frame components can be
    re-used from the consuming app if already installed or injected via CDN if not so that we don't
    have bundle extra code in our SVAWCs nor worry about duplicate component registration.
  </dd>
</dl>


Code adapted from [svelte-tag](https://github.com/crisward/svelte-tag) by Chris Ward.

Logo is CC-BY-NC-SA, adapted from a photo by Leonard J Matthews. 
