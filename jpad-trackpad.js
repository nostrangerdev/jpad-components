const html = String.raw;

/**
 * A directional input element, it can be used standalone or with a controller.
 *
 * The trackpad element is designed to normalize the vector output for immediate usage without trasformations.
 *
 * It supports inputs from touchscreen, mouse and keyboard.
 *
 * @tag jpad-trackpad
 * 
 * @summary A directional input element.
 *
 * @attribute {string} name - reflected attribute of property 'name'
 *
 * @attribute {boolean} normalize - reflected attribute of property 'normalize'
 *
 * @attribute {boolean} active - reflected attribute of property 'active'
 *
 * @attribute {string} upkeys - A comma-separated list of the 'KeyboardEvent.code' to listen for
 * @attribute {string} upkey - Alias of 'upkeys'
 *
 * @attribute {string} downkeys - A comma-separated list of the 'KeyboardEvent.code' to listen for
 * @attribute {string} downkey - Alias of 'downkeys'
 *
 * @attribute {string} leftkeys - A comma-separated list of the 'KeyboardEvent.code' to listen for
 * @attribute {string} leftkey - Alias of 'leftkeys'
 *
 * @attribute {string} rightkeys - A comma-separated list of the 'KeyboardEvent.code' to listen for
 * @attribute {string} rightkey - Alias of 'rightkeys'
 *
 * @cssproperty [--JpadTrackpad-padding=.2em] - The trackpad outer padding
 * @cssproperty [--JpadTrackpad-size=6em] - The trackpad size
 * @cssproperty [--JpadTrackpad-border=.2em solid rgba(150, 150, 150, .6)] - The trackpad border
 * @cssproperty [--JpadTrackpad-borderRadius=50%] - The trackpad border radius
 * @cssproperty [--JpadTrackpad-background=transparent] - The trackpad background
 *
 * @cssproperty [--JpadTrackpad-indicator-size=50%] - The trackpad indicator size
 * @cssproperty [--JpadTrackpad-indicator-borderRadius=50%] - The trackpad indicator border radius
 * @cssproperty [--JpadTrackpad-indicator-background=rgba(150, 150, 150, .6)] - The trackpad indicator background
 * @cssproperty [--JpadTrackpad-indicator-transitionDuration=.05s] - The trackpad indicator transition duration when moving
 *
 * @cssproperty [--JpadTrackpad-active-border=.2em solid rgba(150, 150, 150, .6)] - The active trackpad active state border
 * @cssproperty [--JpadTrackpad-active-background=transparent] - The trackpad active state background
 *
 * @cssproperty [--JpadTrackpad-active-indicator-background=rgba(150, 150, 150, .8)] - The trackpad indicator active state background
 *
 * @csspart trackpad - Style the trackpad
 * @csspart indicator - Style the indicator
 *
 * @fires trackpadpress - Fired when the trackpad is pressed, includes axis
 * @fires trackpadmove - Fired when the trackpad is dragged or moved, includes axis
 * @fires trackpadrelease - Fired when the trackpad is released, includes axis
 *
 * @fires buttonpress - Fired when the trackpad is pressed
 * @fires buttontrigger - Fired when the trackpad is pressed or released, includes pressed state
 * @fires buttonrelease - Fired when the trackpad is released
 */
export class JpadTrackpad extends HTMLElement {
    #trackingTouchIdentifier;

    #listenedDirectionKeys;
    #pressedKeys;

    #trackpadEl;
    #indicatorEl;

    static get observedAttributes() {
        return [
            'name',
            'normalize',
            'upkey', 'upkeys',
            'downkey', 'downkeys',
            'leftkey', 'leftkeys',
            'rightkey', 'rightkeys',
        ];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#trackingTouchIdentifier = null;

        this.#listenedDirectionKeys = {
            up: [],
            down: [],
            left: [],
            right: [],
        };
        this.#pressedKeys = {};
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = html`
            <style>
                :host {
                    --JpadTrackpad-padding: .2em;
                    --JpadTrackpad-size: 6em;
                    --JpadTrackpad-border: .2em solid rgba(150, 150, 150, .6);
                    --JpadTrackpad-borderRadius: 50%;
                    --JpadTrackpad-background: transparent;

                    --JpadTrackpad-indicator-size: 50%;
                    --JpadTrackpad-indicator-borderRadius: 50%;
                    --JpadTrackpad-indicator-background: rgba(150, 150, 150, .6);
                    --JpadTrackpad-indicator-transitionDuration: .05s;

                    --JpadTrackpad-active-border: .2em solid rgba(150, 150, 150, .6);
                    --JpadTrackpad-active-background: transparent;
                    --JpadTrackpad-active-indicator-background: rgba(150, 150, 150, .8);

                    display: block;
                    padding: var(--JpadTrackpad-padding);
                    border-radius: var(--JpadTrackpad-borderRadius);
                }

                .Trackpad {
                    display: grid;
                    place-items: center;
                    width: var(--JpadTrackpad-size);
                    height: var(--JpadTrackpad-size);
                    border-radius: var(--JpadTrackpad-borderRadius);
                    border: var(--JpadTrackpad-border);
                    background: var(--JpadTrackpad-background);
                }

                .Indicator {
                    display: block;
                    width: var(--JpadTrackpad-indicator-size);
                    height: var(--JpadTrackpad-indicator-size);
                    border-radius: var(--JpadTrackpad-indicator-borderRadius);
                    background: var(--JpadTrackpad-indicator-background);
                    transition: transform var(--JpadTrackpad-indicator-transitionDuration);
                }

                :host([active]) .Trackpad {
                    border: var(--JpadTrackpad-active-border);
                    background: var(--JpadTrackpad-active-background);
                }

                :host([active]) .Indicator {
                    background: var(--JpadTrackpad-active-indicator-background);
                }

                :host([hide-indicator]) .Indicator {
                    opacity: 0;
                }
            </style>

            <div class="Trackpad" part="trackpad">
                <div class="Indicator" part="indicator"></div>
            </div>
        `;

        this.#trackpadEl = this.shadowRoot.querySelector('.Trackpad');
        this.#indicatorEl = this.shadowRoot.querySelector('.Indicator');

        this.addEventListener('touchstart', this.#handleTouchStart);
        this.addEventListener('touchmove', this.#handleTouchMove);
        this.addEventListener('touchend', this.#handleTouchEnd);
        this.addEventListener('touchcancel', this.#handleTouchEnd);

        this.addEventListener('mousedown', this.#handleMouseStart, { passive: true });

        window.addEventListener('keydown', this.#handleKeyPress);
        window.addEventListener('keyup', this.#handleKeyPress);
    }

    disconnectedCallback() {
        window.removeEventListener('mousemove', this.#handleMouseMove);
        window.removeEventListener('mouseup', this.#handleMouseEnd);

        window.removeEventListener('keydown', this.#handleKeyPress);
        window.removeEventListener('keyup', this.#handleKeyPress);
    }

    #handleTouchStart = e => {
        e.preventDefault();

        this.active = true;

        for (const touch of e.changedTouches) {
            this.#trackingTouchIdentifier = touch.identifier;

            this.#updateTouchStartPosition(touch);

            return;
        }
    };

    #handleTouchMove = e => {
        e.preventDefault();

        for (const touch of e.changedTouches) {
            if (touch.identifier === this.#trackingTouchIdentifier) {
                this.#updateTouchMovePosition(touch);

                return;
            }
        }
    };

    #handleTouchEnd = e => {
        e.preventDefault();

        this.active = false;

        this.#trackingTouchIdentifier = null;

        this.#updateTouchEndPosition();
    };

    #handleMouseStart = e => {
        this.active = true;

        this.#updateTouchStartPosition(e);

        window.addEventListener('mousemove', this.#handleMouseMove, { passive: true });
        window.addEventListener('mouseup', this.#handleMouseEnd, { passive: true, once: true });
    };

    #handleMouseMove = e => {
        if (!this._trackpadRect || !this.active) return;

        this.#updateTouchMovePosition(e);
    };

    #handleMouseEnd = () => {
        this.active = false;

        this.#updateTouchEndPosition();

        window.removeEventListener('mousemove', this.#handleMouseMove, { passive: true });
    };

    #handleKeyPress = e => {
        const pressed = !!e.type[5];

        if (e.repeat) return;

        if (!this.#listenedDirectionKeys.up.includes(e.code) &&
            !this.#listenedDirectionKeys.down.includes(e.code) &&
            !this.#listenedDirectionKeys.left.includes(e.code) &&
            !this.#listenedDirectionKeys.right.includes(e.code)) return;

        this.#pressedKeys[e.code] = pressed;

        const upPressed = this.#listenedDirectionKeys.up.some(code => this.#pressedKeys[code]);
        const downPressed = this.#listenedDirectionKeys.down.some(code => this.#pressedKeys[code]);
        const leftPressed = this.#listenedDirectionKeys.left.some(code => this.#pressedKeys[code]);
        const rightPressed = this.#listenedDirectionKeys.right.some(code => this.#pressedKeys[code]);

        const trackpadPressed = (
            upPressed ||
            downPressed ||
            leftPressed ||
            rightPressed
        );

        const position = {
            x: rightPressed - leftPressed,
            y: downPressed - upPressed,
        };
        const normPosition = this.#normalizeLength(position);

        if (this.active !== trackpadPressed && trackpadPressed)
            this.#sendTrackpadPress(normPosition);

        this.#sendTrackpadMove(normPosition);

        if (this.active !== trackpadPressed && !trackpadPressed)
            this.#sendTrackpadRelease(normPosition);

        this._trackpadRect = this.#trackpadEl.getBoundingClientRect();
        this._trackpadRadius = this._trackpadRect.width * 0.5;

        this.#updateIndicator({
            x: normPosition.x * this._trackpadRadius,
            y: normPosition.y * this._trackpadRadius,
        });

        this.active = trackpadPressed;
    };

    /**
     * The name of the trackpad's action
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
     * This property is enabled when the trackpad is pressed
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
     * When enabled the axis is normalized, that means the distance from the center is constant to 1
     * @reflect
     * @type {boolean}
     */
    get normalize() {
        return this.hasAttribute('normalize');
    }

    set normalize(value) {
        this.toggleAttribute('normalize', value);
    }

    /**
     * @internal
     */
    #updateTouchStartPosition(pointer) {
        this._trackpadRect = this.#trackpadEl.getBoundingClientRect();
        this._trackpadRadius = this._trackpadRect.width * 0.5;

        const position = this.#getTouchPosition(pointer, this._trackpadRect);
        const normPosition = this.#normalizePosition(position, this._trackpadRadius);

        this.#sendTrackpadPress(normPosition);
        this.#sendTrackpadMove(normPosition);

        this.#updateIndicator(position);
    }

    /**
     * @internal
     */
    #updateTouchMovePosition(pointer) {
        const position = this.#getTouchPosition(pointer, this._trackpadRect);
        const normPosition = this.#normalizePosition(position, this._trackpadRadius);

        this.#sendTrackpadMove(normPosition);

        this.#updateIndicator(position);
    }

    /**
     * @internal
     */
    #updateTouchEndPosition() {
        const position = { x: 0, y: 0 };

        this.#sendTrackpadMove(position);
        this.#sendTrackpadRelease(position);

        this.#updateIndicator(position);
    }

    /**
     * @internal
     */
    #getTouchPosition(touch, rect) {
        const x = touch.clientX - rect.x - this._trackpadRadius;
        const y = touch.clientY - rect.y - this._trackpadRadius;
        const clampedPosition = this.#clampPosition({ x, y }, this._trackpadRadius);
        return clampedPosition;
    }

    /**
     * @internal
     */
    #getPositionLength({ x, y }) {
        return Math.hypot(x, y);
    }

    /**
     * @internal
     */
    #clampPosition(pos, radius) {
        const len = this.#getPositionLength(pos);
        const force = Math.min(len, radius) / len;
        return {
            x: force * pos.x,
            y: force * pos.y,
        };
    }

    /**
     * @internal
     */
    #normalizePosition(pos, radius) {
        if (this.normalize) {
            return this.#normalizeLength(pos);
        }
        return {
            x: this.#normalizeAxis(pos.x, radius),
            y: this.#normalizeAxis(pos.y, radius),
        };
    }

    /**
     * @internal
     */
    #normalizeLength(pos) {
        const len = this.#getPositionLength(pos);
        return {
            x: pos.x / len || 0,
            y: pos.y / len || 0,
        };
    }

    /**
     * @internal
     */
    #normalizeAxis(axis, radius) {
        const min = -radius;
        const max = radius;
        return 2 * ((axis - min) / (max - min)) - 1;
    }

    /**
     * @internal
     */
    #updateIndicator({ x, y }) {
        this.#indicatorEl.style.transform = `translate(${x}px, ${y}px)`;
    }

    /**
     * @internal
     */
    #sendTrackpadPress(axis) {
        this.dispatchEvent(
            new CustomEvent(
                'trackpadpress',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                        axis,
                    },
                }
            )
        );
    }

    /**
     * @internal
     */
    #sendTrackpadMove(axis) {
        this.dispatchEvent(
            new CustomEvent(
                'trackpadmove',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                        axis,
                    },
                }
            )
        );
    }

    /**
     * @internal
     */
    #sendTrackpadRelease(axis) {
        this.dispatchEvent(
            new CustomEvent(
                'trackpadrelease',
                {
                    composed: true,
                    bubbles: true,
                    detail: {
                        name: this.name,
                        axis,
                    },
                }
            )
        );
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

    /**
     * @internal
     */
    #parseKeysValue(value) {
        return value.split(',').map(i => i.trim());
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'upkey':
            case 'upkeys':
                this.#listenedDirectionKeys.up = this.#parseKeysValue(newValue);
                return;

            case 'downkey':
            case 'downkeys':
                this.#listenedDirectionKeys.down = this.#parseKeysValue(newValue);
                return;

            case 'leftkey':
            case 'leftkeys':
                this.#listenedDirectionKeys.left = this.#parseKeysValue(newValue);
                return;

            case 'rightkey':
            case 'rightkeys':
                this.#listenedDirectionKeys.right = this.#parseKeysValue(newValue);
                return;
        }
    }
}

customElements.define('jpad-trackpad', JpadTrackpad);
