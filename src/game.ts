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
        const head = this.snakeParts[0];
        const dx = this.velocity.x > 0 ? 2*this.partWidth + this.velocity.x : 0;
        const dy = this.velocity.y > 0 ? 2*this.partWidth + this.velocity.y : 0;
        const newHead: Point = {
            x: head.x + dx,
            y: head.y + dy
        };
        this.snakeParts.unshift(newHead);
        this.snakeParts.pop();
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