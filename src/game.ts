// import { Color, Point, GameComponent } from './types';

const FRAMERATE = 10;

type Color = {
    fill: string;
    stroke: string;
}

type Point = {
    x: number;
    y: number;
}

interface GameComponent {
    update();
    draw(canvasCtx: CanvasRenderingContext2D);
}

declare interface Math {
    sign(x: number): number;
}

enum Keys {
    UP = 38,
    DOWN = 40,
    LEFT = 37,
    RIGHT = 39
}

class InputManager {
    private keys: boolean[] = [];

    constructor() {
        window.addEventListener('keydown', e => this.keys[e.keyCode] = true);
        window.addEventListener('keyup', e => this.keys[e.keyCode] = false);
    }

    public keyPressed(key: Keys | number) {
        return this.keys[key];
    }
}

const Input = new InputManager();

function startGame() {
    const scene = new Scene(400, 400);
    scene.setColor({ fill: 'white', stroke: 'black' });
    const snake = new Snake(5, 7);
    snake.setVelocity(1, 0);
    scene.addComponent(snake);
    scene.start();
}

class Snake implements GameComponent {
    private snakeParts: Point[];
    private partWidth: number;
    private velocity: Point;
    private color: Color = { fill: 'yellowgreen', stroke: 'black' };

    constructor(startingParts: number, partWidth: number) {
        this.partWidth = partWidth;
        this.snakeParts = [];
        this.velocity = { x: 0, y: 0 };
        for (let i = 0; i < startingParts; i++) {
            this.snakeParts.push({ x: 150 - (i * 2 * partWidth), y: 150 });
        }
    }

    public setColor(color: Color) {
        this.color = color;
    }

    public setVelocity(x: number, y: number) {
        this.velocity = { x, y }; 
    }

    public update() {
        this.getInput();
        const { x: dx, y: dy } = this.velocity;
        const head = this.snakeParts[0];
        const diameter = 2 * this.partWidth;
        const newHead: Point = {
            x: (dx !== 0 ? Math.sign(dx)*(diameter + dx) : 0) + head.x,
            y: (dy !== 0 ? Math.sign(dy)*(diameter + dy) : 0) + head.y
        };
        this.snakeParts.unshift(newHead);
        this.snakeParts.pop();
    }

    private getInput(): void {
        const { x: dx, y: dy } = this.velocity;
        const movingX = dx !== 0;
        const movingY = dy !== 0;
        if (Input.keyPressed(Keys.UP) && !movingY) {
            this.velocity = { x: 0, y: -1 };
        } else if (Input.keyPressed(Keys.DOWN) && !movingY) {
            this.velocity = { x: 0, y: 1 };
        } else if (Input.keyPressed(Keys.LEFT) && !movingX) {
            this.velocity = { x: -1, y: 0 };
        } else if (Input.keyPressed(Keys.RIGHT) && !movingX) {
            this.velocity = { x: 1, y: 0 };
        }
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        canvasCtx.strokeStyle = this.color.stroke;
        this.snakeParts.forEach(({ x, y }, index) => {
            canvasCtx.fillStyle = index === 0 ? 'red' : this.color.fill;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, this.partWidth, 0, 2*Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        });
    }
}

class Scene {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private color: Color;
    private components: GameComponent[] = [];
    private interval: number;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    }

    public setColor(color: Color) {
        this.color = color;
    }

    public addComponent(component: GameComponent) {
        this.components.push(component);
    }

    public start() {
        this.interval = setInterval(() => { this.frameStep() }, 1000 / FRAMERATE);
    }
    
    private frameStep() {
        this._clear();
        this.components.forEach(component => {
            component.update();
            component.draw(this.context);
        })
    }

    private _clear = () => {
        const { width, height } = this.canvas;
        this.context.fillStyle = this.color.fill;
        this.context.strokeStyle = this.color.stroke;
        this.context.fillRect(0, 0, width, height);
        this.context.strokeRect(0, 0, width, height);
    }
}
