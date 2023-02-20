Slots are an important feature for customization and composability.
You can specify locations in your SVAWC's entity tree where 
the users of your component can provide their own entities.
For example, a humanoid character SVAWC might have a slot placed inside their
hand entity so that different items can be easily inserted where they'll
be parented to the hand and move along with it.

### Defining SVAWC Slots

On the SVAWC development side, slots work exactly as they do in
Svelte components ([see guide](https://svelte.dev/tutorial/slots)).
All you do is place `<slot></slot>` a element in your component's HTML template to
mark the place where content can be inserted.
You can also place default content inside the slot tags that will be used
only when custom content is not provided by the SVAWC user.

This `a-cage` SVAWC creates a wireframe box around whatever content
is placed in its slot:

```svelte
<!-- ACage.Svelte -->
<a-entity geometry="primitive: box" material="color: red; wireframe: true">
  <slot></slot>
</a-entity>
```

### Using SVAWC Slots

On the SVAWC usage side, there is one difference from how slots are used
in Svelte or HTML WebComponents.
You still add entities as children of the SVAWC to populate the slots,
but you must wrap it in a `<template></template>` tag.
This is to prevent the A-Frame entities from initializing until after
they are moved to their slotted locations.

This scene places a sphere within the `a-cage` SVAWC

```html
<a-cage>
  <template>
    <a-sphere radius="0.5"></a-sphere>
  </template>
</a-cage>
```

### Multiple slots

Just as in Svelte or WebComponents, you can have multiple slots
that are differentiate with the `name` attribute, and you can
have one default slot that doesn't have a name. Using
these slots also works just like standard slots, using
the `slot` attribute on the to specify the name.

This `a-camera-rig` SVAWC has named slots to attach
entities to the camera and each tracked controller
as well as a default slot to place content relative to the entire rig

```svelte
<!-- ACameraRig.svelte -->
<a-entity camera>
  <slot name="hud"></slot>
</a-entity>
<a-entity hand-controls="hand: left">
  <slot name="leftHand"></slot>
</a-entity>
<a-entity hand-controls="hand: right">
  <slot name="leftHand"></slot>
</a-entity>
<slot></slot>
```

```html
<a-camera-rig>
  <template slot="hud">
    <a-image src="#hud-overlay" position="0 0 -0.1"></a-image>
  </template>
  <template slot="leftHand">
    <a-gltf-model src="#shield-model"></a-gltf-model>
  </template>
  <template slot="rightHand">
    <a-gltf-model src="#sword-model"></a-gltf-model>
  </template>
  <template>
    <a-image src="#playspace-center-marker" position="0 0.05 0" rotation="-90 0 0"></a-image>
  </template>
</a-camera-rig>
```
