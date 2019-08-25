/**
 * Color to use when rendering a shape
 */
export type Color = {
    fill: string;
    stroke: string;
}

/**
 * A point in 2D
 */
export type Point = {
    x: number;
    y: number;
}

/**
 * Color constants
 */
export enum Colors {
    BLACK = 'black',
    PINK = 'pink',
    RED = 'red',
    YELLOW = 'yellow',
    YELLOW_GREEN = 'yellowgreen'
}

/**
 * Keyboard constats
 */
export enum Keys {
    /** Up arrow key */
    UP = 38,

    /** Down arrow key */
    DOWN = 40,

    /** Left arrow key */
    LEFT = 37,

    /** Right arrow key */
    RIGHT = 39,

    W = 87,
    A = 65,
    S = 83,
    D = 68
}

