const html = String.raw;

/**
 * Hold children layout and a minimal public API for its children elements.
 *
 * By using directly it you can build a standalone controller for any project,
 * without the need to manually manage each element by their events.
 *
 * @tag jpad-controller
 *
 * @summary Interact with children elements while providing a minimal public API
 * 
 * @attribute {"always"|"portrait"|"landscape"} expanded - Whether to expand the inner area. Good for handling wide screens.
 *
 * @slot - Default centered slot
 * @slot top-left - Show elements above the left slots
 * @slot top - Show elements above the default slot
 * @slot top-right - Show elements above the right slots
 * @slot left - Show elements to the left
 * @slot right - Show elements to the right
 * @slot bottom-left - Show elements below the left slots
 * @slot bottom - Show elements below the default slot
 * @slot bottom-right - Show elements below the right slots
 *
 * @cssproperty [--JpadController-padding=1em] - Controls the outer padding
 * @cssproperty [--JpadController-gap=.5em] - Controls the inner spacing
 * @cssproperty [--JpadController-background=transparent] - Controls the element background
 *
 * @csspart top - Style the Top quadrant
 * @csspart top-left - Style the Top-left quadrant
 * @csspart top-right - Style the Top-right quadrant
 * @csspart center - Style the Center quadrant
 * @csspart left - Style the Left quadrant
 * @csspart right - Style the Right quadrant
 * @csspart bottom - Style the Bottom quadrant
 * @csspart bottom-left - Style the Bottom-left quadrant
 * @csspart bottom-right - Style the Bottom-right quadrant
 */
export class JpadController extends HTMLElement {
    #trackpads;
    #buttons;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#trackpads = {};
        this.#buttons = {};
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = html`
            <style>
                :host {
                    --JpadController-padding: 1em;
                    --JpadController-gap: .5em;
                    --JpadController-background: transparent;

                    display: grid;
                    grid-template:
                        "left top    right" 1fr
                        "left center right" 1fr
                        "left bottom right" 1fr
                        / 1fr auto 1fr;
                    padding: var(--JpadController-padding);
                    grid-gap: var(--JpadController-gap);
                    background: var(--JpadController-background);
                }

                .Top {
                    grid-area: top;
                }

                .LeftArea {
                    grid-area: left;
                }

                .Center {
                    grid-area: center;
                }

                .RightArea {
                    grid-area: right;
                }

                .Bottom {
                    grid-area: bottom;
                }

                .Area {
                    display: grid;
                    grid-template:
                        "above " 1fr
                        "middle" auto
                        "below " 1fr
                        / 1fr;
                    grid-gap: var(--JpadController-gap);
                }

                .Surface {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                }

                @media (orientation: portrait) {
                    :host {
                        grid-template:
                            "top    top    top   " auto
                            "left   center right " 1fr
                            "bottom bottom bottom" auto
                            / 1fr auto 1fr;
                    }

                    :host([expanded="portrait"]),
                    :host([expanded="always"]) {
                        grid-template-columns: auto 1fr auto;
                    }
                }

                @media (orientation: landscape) {
                    :host([expanded="landscape"]),
                    :host([expanded="always"]) {
                        grid-template-columns: auto 1fr auto;
                    }
                }
            </style>

            <div class="Top Surface" part="top">
                <slot name="top"></slot>
            </div>

            <div class="LeftArea Area">
                <div class="Surface" part="top-left">
                    <slot name="top-left"></slot>
                </div>
                <div class="Surface" part="left">
                    <slot name="left"></slot>
                </div>
                <div class="Surface" part="bottom-left">
                    <slot name="bottom-left"></slot>
                </div>
            </div>

            <div class="Center Surface" part="center">
                <slot></slot>
            </div>

            <div class="RightArea Area">
                <div class="Surface" part="top-right">
                    <slot name="top-right"></slot>
                </div>
                <div class="Surface" part="right">
                    <slot name="right"></slot>
                </div>
                <div class="Surface" part="bottom-right">
                    <slot name="bottom-right"></slot>
                </div>
            </div>

            <div class="Bottom Surface" part="bottom">
                <slot name="bottom"></slot>
            </div>
        `;

        this.addEventListener('trackpadmove', this.#handleTrackpadMove);
        this.addEventListener('buttontrigger', this.#handleButtonTrigger);
    }

    #handleTrackpadMove = e => {
        this.#trackpads[e.detail.name] = e.detail.axis;
    };

    #handleButtonTrigger = e => {
        this.#buttons[e.detail.name] = {
            pressed: e.detail.pressed,
            justPressed: e.detail.pressed,
        };
    };

    /**
     * Get a trackpad axis by its defined name.
     *
     * @param {string} name - The axis name
     *
     * @returns {{ x: number, y: number }} - The vector of the axis
     */
    getAxis(name) {
        return this.#trackpads[name] || { x: 0, y: 0 };
    }

    /**
     * Get a button press state by its defined name.
     *
     * @param {string} name - The button or trackpad name
     *
     * @returns {boolean} - The state of the button or trackpad
     */
    isPressed(name) {
        const button = this.#buttons[name] || {};
        const pressed = button.pressed || false;
        return pressed;
    }

    /**
     * Get a button press state by its defined name.
     *
     * It return true only on the first call until is pressed again.
     *
     * @param {string} name - The button or trackpad name
     *
     * @returns {boolean} - The state of the button or trackpad
     */
    isJustPressed(name) {
        const button = this.#buttons[name] || {};
        const justPressed = button.justPressed || false;
        button.justPressed = false;
        return justPressed;
    }
}

customElements.define('jpad-controller', JpadController);
