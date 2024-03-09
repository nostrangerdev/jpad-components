# \<jpad-components>

![NPM Version](https://img.shields.io/npm/v/jpad-components)
![GitHub License](https://img.shields.io/github/license/nostrangerdev/jpad-components)

A set of web-components to build declarative virtual gamepad layouts.

The aim of this project is to enable rapid prototyping and to provide a simple way of implementing touch / keyboard inputs without having to write custom UI code.

The jpad-components are designed to work with any framework and game engine, you can use the `jpad-controller` API directly in your game loop or listen to the controller, trackpad or button events as needed.

## Installation

jpad-components is available on [npm](https://www.npmjs.com/package/jpad-components):

```sh
npm i jpad-components
```

## Usage

Import the components separately or as a bundle:

```js
// import as a bundle
import 'jpad-components'; // Load all elements in one go

// or just the components you need
import 'jpad-components/jpad-controller.js'; // Layout controller and simple API
import 'jpad-components/jpad-tile.js'; // Create familiar button layouts
import 'jpad-components/jpad-button.js'; // Handle input as a button or trigger
import 'jpad-components/jpad-trackpad.js'; // Handle movement in any direction
```

```html
<!-- available on CDN too -->
<head>
  ...
  <script src="https://esm.run/jpad-components" type="module"></script>
</head>
```

The components API is [documented here](https://nostrangerdev.github.io/jpad-components#docs).

Here's a minimal example:

```html
<!-- Define the layout -->
<jpad-controller>
    <jpad-trackpad
      name="movement"
      upkeys="ArrowUp, KeyW"
      downkeys="ArrowDown, KeyS"
      leftkeys="ArrowLeft, KeyA"
      rightkeys="ArrowRight, KeyD"
      slot="left"
    ></jpad-trackpad>

    <jpad-tile slot="right">
      <jpad-button passby name="jump" keys="Z">Z</jpad-button>
      <jpad-button passby name="attack" keys="X">X</jpad-button>
    </jpad-button>
</jpad-controller>

<script>
  // Get the element
  const jpad = document.querySelector('jpad-controller');

  // Use it with the input api
  jpad.getAxis('movement');
  jpad.isPressed('attack');
  jpad.isJustPressed('attack');

  // You can also listen for the events
  jpad.addEventListener('buttontrigger', (e) => {
    console.log(e.detail.name, e.detail.pressed);
  });
  jpad.addEventListener('trackpadmove', (e) => {
    console.log(e.detail.name, e.detail.axis);
  });
</script>
```

## Some examples in the wild

Here's some demos that use `jpad-components` to handle their inputs:

- [Playable CSS 3D Drone](https://codepen.io/nostranger/pen/abxzVKy)

## License

This project is released under the [MIT license](https://github.com/nostrangerdev/jpad-components/blob/main/LICENSE).

## Contributions

Any contribution or feedback is warmly welcomed, this project has been tested on a limited set of devices and browsers and might display some bugs.

## If you need support or found a bug

If you need and help or have found a bug, feel free to [leave an issue](https://github.com/nostrangerdev/jpad-components/issues) or [DM me on Nostr](https://njump.me/nostranger@nostrcheck.me).

