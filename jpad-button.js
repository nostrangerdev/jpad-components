const html = String.raw;

/**
 * A button input element, it can be used standalone or with a controller.
 *
 * You can also use it with a jpad-tile to contruct more complex layouts easily.
 *
 * It supports inputs from touchscreen, mouse and keyboard.
 *
 * @tag jpad-button
 * 
 * @summary A button input element.
 *
 * @attribute {string} name - reflected attribute of property 'name'
 *
 * @attribute {boolean} active - reflected attribute of property 'active'
 *
 * @attribute {boolean} passby - reflected attribute of property 'passby'
 *
 * @attribute {string} keys - A comma-separated list of the 'KeyboardEvent.code' to listen for
 * @attribute {string} key - Alias of 'keys'
 *
 * @attribute {boolean} trigger - Display the button with a wider variant for alternative types like L or R trigger buttons
 *
 * @slot - Slot for displaying a button label
 *
 * @cssproperty [--JpadButton-padding=.2em] - The button outer padding
 * @cssproperty [--JpadButton-borderRadius=50%] - The button border radius
 * @cssproperty [--JpadButton-minSize=2em] - The button minimum size
 * @cssproperty [--JpadButton-background=rgba(150, 150, 150, .6)] - The button default state background
 *
 * @cssproperty [--JpadButton-active-background=rgba(150, 150, 150, .8)] - The button active state background
 *
 * @cssproperty [--JpadButton-trigger-padding=.2em 1.5em] - The button trigger variant padding
 * @cssproperty [--JpadButton-trigger-borderRadius=.5em] - The button trigger variant border radius
 *
 * @csspart button - Style the button
 *
 * @fires buttonpress - Fired when the button is pressed
 * @fires buttontrigger - Fired when the button is pressed or released, includes pressed state
 * @fires buttonrelease - Fired when the button is released
 */
export class JpadButton extends HTMLElement {
    #listeningKeys;
    #pressedKeys;

    #parentEl;

    static get observedAttributes() {
        return ['name', 'key', 'keys', 'passby'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#listeningKeys = [];
        this.#pressedKeys = {};
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = html`
            <style>
                :host {
                    --JpadButton-padding: .2em;
                    --JpadButton-borderRadius: 50%;
                    --JpadButton-minSize: 2em;
                    --JpadButton-background: rgba(150, 150, 150, .6);

                    --JpadButton-active-background: rgba(150, 150, 150, .8);

                    --JpadButton-trigger-padding: .2em 1.5em;
                    --JpadButton-trigger-borderRadius: .5em;

                    display: inline-block;
                    padding: var(--JpadButton-padding);
                    border-radius: var(--JpadButton-borderRadius);
                }

                .Button {
                    display: grid;
                    place-items: center;
                    text-align: center;
                    min-width: var(--JpadButton-minSize);
                    min-height: var(--JpadButton-minSize);
                    border-radius: var(--JpadButton-borderRadius);
                    line-height: 1;
                    background: var(--JpadButton-background);
                    user-select: none;
                }

                :host([active]) .Button {
                    background: var(--JpadButton-active-background);
                }

                :host([trigger]) {
                    border-radius: var(--JpadButton-trigger-borderRadius);
                }

                :host([trigger]) .Button {
                    border-radius: var(--JpadButton-trigger-borderRadius);
                    padding: var(--JpadButton-trigger-padding);
                }
            </style>

            <div class="Button" part="button">
                <slot></slot>
            </div>
        `;

        this.#parentEl = this.closest('jpad-tile') || this.parentNode;

        this.addEventListener('touchstart', this.#handleTouchStart);
        this.addEventListener('touchend', this.#handleTouchEnd);
        this.addEventListener('touchcancel', this.#handleTouchEnd);

        this.addEventListener('mousedown', this.#handleMouseStart);
        this.addEventListener('mouseup', this.#handleMouseEnd);
        this.addEventListener('mouseleave', this.#handleMouseEnd);

        this.#registerPassby();

        window.addEventListener('keydown', this.#handleKeyPress);
        window.addEventListener('keyup', this.#handleKeyPress);
    }

    disconnectedCallback() {
        this.#unregisterPassby();

        window.removeEventListener('keydown', this.#handleKeyPress);
        window.removeEventListener('keyup', this.#handleKeyPress);
    }

    #handleTouchStart = e => {
        e.preventDefault();

        this.active = true;
    };

    #handleTouchEnd = e => {
        e.preventDefault();

        this.active = false;
    };

    #handleMouseStart = () => {
        this.active = true;
    };

    #handleMouseEnd = () => {
        this.active = false;
    };

    #handleOuterTouchMove = e => {
        e.preventDefault();

        for (const touch of e.targetTouches) {
            const touchedElement = this.#getClosestTouchedElement(
                touch.clientX,
                touch.clientY
            );

            if (touchedElement && touchedElement === this) {
                this.active = true;
                return;
            }
        }

        this.active = false;
    };

    #handleOuterMouseDown = () => {
        this.addEventListener('mouseenter', this.#handleOuterMouseEnter, { passive: true });

        window.addEventListener('mouseup', this.#handleOuterMouseUp, { passive: true, once: true });
    };

    #handleOuterMouseEnter = () => {
        this.active = true;
    };

    #handleOuterMouseUp = () => {
        this.removeEventListener('mouseenter', this.#handleOuterMouseEnter);
    };

    #handleKeyPress = e => {
        const pressed = !!e.type[5];

        if (e.repeat) return;

        if (!this.#listeningKeys.includes(e.code)) return;

        this.#pressedKeys[e.code] = pressed;

        this.active = this.#listeningKeys.some(code => this.#pressedKeys[code]);
    };

    /**
     * @internal
     */
    #registerPassby() {
        if (this.passby && this.#parentEl) {
            this.#parentEl.addEventListener('touchstart', this.#handleOuterTouchMove);
            this.#parentEl.addEventListener('touchmove', this.#handleOuterTouchMove);
            this.#parentEl.addEventListener('touchend', this.#handleOuterTouchMove);
            this.#parentEl.addEventListener('touchcancel', this.#handleOuterTouchMove);

            this.#parentEl.addEventListener('mousedown', this.#handleOuterMouseDown);
        }
    }

    /**
     * @internal
     */
    #unregisterPassby() {
        if (this.#parentEl) {
            this.#parentEl.removeEventListener('touchstart', this.#handleOuterTouchMove);
            this.#parentEl.removeEventListener('touchmove', this.#handleOuterTouchMove);
            this.#parentEl.removeEventListener('touchend', this.#handleOuterTouchMove);
            this.#parentEl.removeEventListener('touchcancel', this.#handleOuterTouchMove);

            this.#parentEl.removeEventListener('mousedown', this.#handleOuterMouseDown);
        }
    }

    /**
     * The name of the button's action
     * @type {string}
     * @reflect
     */
    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        this.setAttribute('name', value);
    }

    /**
     * This property is enabled when the button is pressed
     * @type {boolean}
     * @reflect
     */
    get active() {
        return this.hasAttribute('active');
    }

    set active(value) {
        if (this.active === value) return;

        this.toggleAttribute('active', value);

        if (value) this.#sendButtonPress();
        else this.#sendButtonRelease();

        this.#sendButtonTrigger();
    }

    /**
     * When enabled the element detect touches from outside and by sliding over it, works best when used with a dedicated wrapping element like jpad-tile
     * @type {boolean}
     * @reflect
     */
    get passby() {
        return this.hasAttribute('passby');
    }

    set passby(value) {
        this.toggleAttribute('passby', value);
    }

    /**
     * @internal
     */
    #sendButtonPress() {
        this.dispatchEvent(
            new CustomEvent(
                'buttonpress',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                    },
                }
            )
        );
    }

    /**
     * @internal
     */
    #sendButtonTrigger() {
        this.dispatchEvent(
            new CustomEvent(
                'buttontrigger',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                        pressed: this.active,
                    },
                }
            )
        );
    }

    /**
     * @internal
     */
    #sendButtonRelease() {
        this.dispatchEvent(
            new CustomEvent(
                'buttonrelease',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                    },
                }
            )
        );
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'key':
            case 'keys':
                this.#listeningKeys = newValue.split(',').map(i => i.trim());
                return;

            case 'passby':
                if (this.passby) this.#registerPassby();
                else this.#unregisterPassby();
                return;
        }
    }

    /**
     * @internal
     */
    #getClosestTouchedElement(x, y) {
        const touchedElement = document.elementFromPoint(x, y);
        return touchedElement && touchedElement.closest('jpad-button');
    }
}

customElements.define('jpad-button', JpadButton);
