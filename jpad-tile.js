const html = String.raw;

/**
 * Provides a simple layout to display children elements in a two level grid that can be tilted.
 *
 * Useful for building common types of layouts.
 *
 * @tag jpad-tile
 * 
 * @summary Hold children elements in a configurable layout.
 *
 * @attribute {boolean} diagonal - Whether to tilt the element diagonally (Like a PlayStation controller)
 *
 * @attribute {boolean} slanted - Whether to tilt the element lightly (like a Sega Mega Drive controller)
 *
 * @attribute {boolean} reverse - Whether to invert the tilt direction
 *
 * @slot - Primary row of elements
 * @slot secondary - Secondary row of elements
 *
 * @cssproperty [--JpadTile-row-flexDirection=row] - Controls the row direction
 * @cssproperty [--JpadTile-row-gap=0] - Controls the row gap
 *
 * @cssproperty [--JpadTile-diagonal-padding=1em 0] - Controls the diagonal padding
 * @cssproperty [--JpadTile-diagonal-rotationAngle=45deg] - Controls the diagonal rotation angle
 *
 * @cssproperty [--JpadTile-slanted-padding=.5em 0] - Controls the slanted padding
 * @cssproperty [--JpadTile-slanted-rotationAngle=5deg] - Controls the slanted rotation angle
 *
 * @csspart tile - Style the wrapping container
 * @csspart primary - Style the primary row
 * @csspart secondary - Style the secondary row
 */
export class JpadTile extends HTMLElement {
    static get observedAttributes() {
        return ['diagonal', 'slanted', 'reverse'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = html`
            <style>
                :host {
                    --JpadTile-row-flexDirection: row;
                    --JpadTile-row-gap: 0;

                    --JpadTile-diagonal-padding: 1em 0;
                    --JpadTile-diagonal-rotationAngle: 45deg;

                    --JpadTile-slanted-padding: .5em 0;
                    --JpadTile-slanted-rotationAngle: 5deg;

                    display: inline-block;
                }

                .Tile {
                    display: block;
                }

                .Row {
                    display: flex;
                    flex-direction: var(--JpadTile-row-flexDirection);
                    gap: var(--JpadTile-row-gap);
                }

                :host([diagonal]) .Tile {
                    transform: rotate(calc(-1 * var(--JpadTile-diagonal-rotationAngle)));
                    padding: var(--JpadTile-diagonal-padding);
                }

                :host([diagonal]) ::slotted(*) {
                    transform: rotate(var(--JpadTile-diagonal-rotationAngle));
                }

                :host([diagonal][reverse]) .Tile {
                    transform: rotate(var(--JpadTile-diagonal-rotationAngle));
                }

                :host([diagonal][reverse]) ::slotted(*) {
                    transform: rotate(calc(-1 * var(--JpadTile-diagonal-rotationAngle)));
                }

                :host([slanted]) .Tile {
                    padding: var(--JpadTile-slanted-padding);
                }

                :host([slanted]) .Row {
                    transform: rotate(calc(-1 * var(--JpadTile-slanted-rotationAngle)));
                }

                :host([slanted]) ::slotted(*) {
                    transform: rotate(var(--JpadTile-slanted-rotationAngle));
                }

                :host([slanted][reverse]) .Row {
                    transform: rotate(var(--JpadTile-slanted-rotationAngle));
                }

                :host([slanted][reverse]) ::slotted(*) {
                    transform: rotate(calc(-1 * var(--JpadTile-slanted-rotationAngle)));
                }
            </style>

            <div class="Tile" part="tile">
                <div class="Row" part="secondary">
                    <slot name="secondary"></slot>
                </div>
                <div class="Row" part="primary">
                    <slot></slot>
                </div>
            </div>
        `;

        this.addEventListener('touchstart', this.#preventEvent);
        this.addEventListener('touchmove', this.#preventEvent);
        this.addEventListener('touchend', this.#preventEvent);
        this.addEventListener('touchcancel', this.#preventEvent);
    }

    #preventEvent = e => {
        e.preventDefault();
    };
}

customElements.define('jpad-tile', JpadTile);
