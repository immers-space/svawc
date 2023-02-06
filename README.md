![logo - cartoon seagul with a wide open beak and the letters S V A W C](./readme_files/svawc%20logo.png)

# SVAWC

**Sv**elte **A**-Frame **W**eb **C**omponents

SVAWC brings modern reactive development and HTML templating to A-Frame component development without compromising on speed, usability, or bundle size. 

## How it works

1. Write reactive template code using Svelte
1. Svelte compiles that down to efficient `createElement`, `setAttibute`, et c. calls (no VDOM or unecessary entity recreation)
2. SVAWC packages it into Web Components for distribution
3. Link the packaged script and then use the Web Component in the A-Frame scene, works with bundled apps or vanilla JS & HTML

## What it looks like

Svelte reactive template source:

```Svelte
<!-- APerson.svelte -->
<script>
  export let skin = 'burlywood'
  export let shirt = 'seagreen'
  export let pants = 'slateblue'
  $: skinMaterial = { color: skin, roughness: 0.9 }
  $: shirtMaterial = { color: shirt }
  $: pantsMaterial = { color: pants }
  const limbs = [-1, 1]
</script>

<a-entity
  class="head" 
  position={{ x: 0, y: 1.6, z: 0 }}
  geometry={{ primitive: 'sphere', radius: 0.2 }}
  material={skinMaterial}
/>
<a-entity
  class="body"
  position={{ x: 0, y: 1.05, z: 0 }}
  geometry={{primitive: 'cylinder', radius: 0.25, height: 0.7 }}
  material={shirtMaterial}
>
  {#each limbs as side (side)}
    <a-entity
      class="arm"
      position={{ x: side *  0.3, y: 0.05, z: 0 }}
      rotation={{ x: 0, y: 0, z: side * 30 }}
      geometry={{ primitive: 'cylinder', radius: 0.1, height: 0.7 }}
      material={shirtMaterial}
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
  />
{/each}
```

SVAWC Wrapper:

```js
import { registerWebComponent } from 'svawc'
import APerson from "./APerson.svelte"
registerWebComponent({ component: APerson, tagname: "a-person", attributes: ["skin", "shirt", "pants"] })
```


Usage in A-Frame Scene:

```html
<head>
	<script src="https://aframe.io/releases/1.4.1/aframe.js"></script>
  <!-- TODO: working CDN link -->
	<script src='/build/bundle.js'></script>
</head>

<body>

	<a-scene>
		<a-person position="0 0 -3"></a-person>
		<a-person position="1 0 -3" skin="peachpuff" shirt="grey" pants="darkgrey"></a-person>
		<a-person position="-1 0 -3" skin="sienna" shirt="pink" pants="white"></a-person>
	</a-scene>
</body>
```

TODO: [Try it out]()

## Why it's useful

I love A-Frame, but the recurring pain points for me in large apps are handling complex reactive state
and making nested entity structures re-usable.

Solutions for the reactive state generally involve meta-components
like `event-set` or the creation of one-off 'components' that just handle business logic.
These tend to spread your logic around and make a large codebase harder to maintain.

For re-usable structures, you're either stuck with HTML templates, which are awkward to use, bloat your index.html,
and again serve to keep your structure far from your logic, or you've got to write tons of tedious
`createElement` and `ssetAttribute` calls.





## API documentation

| Option     | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| component  | Your svelte component                                              |
| tagname    | The webcomponent tag-name, must contain a dash                     |
| baseClass  | Optional, inherit from another WebComponent instead of HTMLElement |
| href       | link to your stylesheet - optional, but required with shadow dom   |
| attributes | array -  attributes you like your tag to forward to your component |
| shadow     | boolean - should this component use shadow dom                     |


Logo adapted from photo by Leonard J Matthews. CC-BY-NC-SA
