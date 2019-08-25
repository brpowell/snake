import { Keys } from "./types";

/**
 * Manages input events
 */
class InputManager {
    private keys: boolean[] = [];

    constructor() {
        window.addEventListener('keydown', e => this.keys[e.keyCode] = true);
        window.addEventListener('keyup', e => this.keys[e.keyCode] = false);
    }

    /**
     * Check whether a key is pressed or not
     * @param key
     * @returns true if a key is being pressed
     */
    public keyPressed(key: Keys | number): boolean {
        return this.keys[key];
    }
}

export const Input = new InputManager();