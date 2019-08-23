let FRAMERATE = 10;

type Color = {
    fill: string;
    stroke: string;
}

type Point = {
    x: number;
    y: number;
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

let Input: InputManager;
let PlayArea: Scene;

function startGame() {
    if (PlayArea) {
        PlayArea.stop();
        PlayArea.canvas.remove();
    }
    Input = new InputManager();
    PlayArea = new Scene(400, 400);
    PlayArea.setColor({ fill: 'white', stroke: 'black' });

    const snake = new Snake(5, 15);
    PlayArea.addComponent(snake);

    const foodSpawner = new FoodSpawner();
    foodSpawner.update();
    PlayArea.addComponent(foodSpawner);

    PlayArea.start(FRAMERATE);
}

class GameComponent {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    // GameComponents don't have to be smart or visible
    public update() {}
    public draw(canvasCtx: CanvasRenderingContext2D) {}
}

class Snake extends GameComponent {
    private snakeParts: Point[];
    private velocity: Point;
    private color: Color = { fill: 'yellowgreen', stroke: 'black' };
    public readonly partWidth: number;
    private score: number = 0;
    private lost: boolean = false;

    constructor(startingParts: number, partWidth: number) {
        super('snake');
        this.partWidth = partWidth;
        this.snakeParts = [];
        this.velocity = { x: partWidth, y: 0 };
        for (let i = 0; i < startingParts; i++) {
            this.snakeParts.push({ x: 150 - (i * partWidth), y: 150 });
        }
    }

    public getParts(): Point[] {
        return this.snakeParts;
    }

    public getScore(): number {
        return this.score;
    }

    public update() {
        if (this.didCrash()) {
            this.lost = true;
            this.velocity = { x: 0, y: 0 };
            PlayArea.start(FRAMERATE + 2);
        }

        if (this.lost) {
            if (this.snakeParts.length > 0) {
                this.snakeParts.splice(0, 1);
            } else {
                PlayArea.stop();
                // document.body.appendChild()
            }
        } else {
            this.getInput();
            this.move();
            if (this.didEat()) {
                const foodSpawner = PlayArea.getComponent('foodSpawner') as FoodSpawner;
                foodSpawner.foodSpawned = false;
                this.score += 1;
                if (this.score % 3 === 0 && this.score > 0) {
                    FRAMERATE += 0.2;
                    PlayArea.start(FRAMERATE);
                }
            } else {
                this.snakeParts.pop();
            }
            document.getElementById('score').innerHTML = `Score: ${String(this.score)}`;
        }
    }

    private move() {
        const newHead: Point = {
            x: this.snakeParts[0].x + this.velocity.x,
            y: this.snakeParts[0].y + this.velocity.y
        };
        const { width: canvasWidth, height: canvasHeight } = PlayArea.canvas;
        if (newHead.x > canvasWidth) {
            newHead.x = 0;
        } else if (newHead.x < 0) {
            newHead.x = canvasWidth - (canvasWidth % this.partWidth);
        } else if (newHead.y > canvasHeight) {
            newHead.y = 0;
        } else if (newHead.y < 0) {
            newHead.y = canvasHeight - (canvasHeight % this.partWidth);
        }
        this.snakeParts.unshift(newHead);
    }

    private didCrash(): boolean {
        const head = this.snakeParts[0];
        return this.snakeParts.slice(1).some(
            part => head.x === part.x && head.y === part.y
        );
    }

    private didEat(): boolean {
        const { x: foodX, y: foodY } = (PlayArea.getComponent('food') as Food).location;
        return this.snakeParts[0].x === foodX && this.snakeParts[0].y === foodY;
    }

    private getInput(): void {
        const { x: dx, y: dy } = this.velocity;
        const movingX = dx !== 0;
        const movingY = dy !== 0;
        if (Input.keyPressed(Keys.UP) && !movingY) {
            this.velocity = { x: 0, y: -this.partWidth };
        } else if (Input.keyPressed(Keys.DOWN) && !movingY) {
            this.velocity = { x: 0, y: this.partWidth };
        } else if (Input.keyPressed(Keys.LEFT) && !movingX) {
            this.velocity = { x: -this.partWidth, y: 0 };
        } else if (Input.keyPressed(Keys.RIGHT) && !movingX) {
            this.velocity = { x: this.partWidth, y: 0 };
        }
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        canvasCtx.strokeStyle = this.color.stroke;
        this.snakeParts.forEach(({ x, y }, index) => {
            canvasCtx.fillStyle = index === 0 && !this.lost ? 'red' : this.color.fill;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, this.partWidth / 2, 0, 2*Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        });
    }
}

class FoodSpawner extends GameComponent {
    public foodSpawned: boolean = false;

    constructor() {
        super('foodSpawner');
    }

    public update() {
        if (!this.foodSpawned) {
            const snake = PlayArea.getComponent('snake') as Snake;
            const { partWidth: pw } = snake;
            let isOnSnake = true;
            let foodX;
            let foodY;
            while (isOnSnake) {
                foodX = this.randomCoordinate(0, PlayArea.canvas.width - pw, pw);
                foodY = this.randomCoordinate(0, PlayArea.canvas.height - pw, pw);
                isOnSnake = snake.getParts().some(
                    part => part.x === foodX && part.y === foodY
                );
            }
            PlayArea.addComponent(new Food(foodX, foodY));
            this.foodSpawned = true;
        }
    }

    private randomCoordinate(min: number, max: number, snakePartWidth: number): number {
        return Math.round((Math.random() * (max - min) + min) / snakePartWidth) * snakePartWidth;
    }
}

class Food extends GameComponent {
    public location: Point;
    
    constructor(x: number, y: number) {
        super('food');
        this.location = { x, y };
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        const { partWidth } = (PlayArea.getComponent('snake') as Snake);
        const { x, y } = this.location;
        canvasCtx.fillStyle = 'yellow';
        canvasCtx.strokeStyle = 'black';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, (partWidth / 2) - 2, 0, 2*Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
}

class Scene {
    public readonly canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private color: Color;
    private components: { [key: string]: GameComponent } = {};
    private interval: number;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        document.body.insertBefore(this.canvas, document.getElementById('retry'));
    }

    public setColor(color: Color) {
        this.color = color;
    }

    public addComponent(component: GameComponent): void {
        this.components[component.id] = component;
    }

    public getComponent(id: string): GameComponent {
        const component = this.components[id];
        if (!component) {
            throw new Error(`GameComponent with id ${id} does not exist`);
        }
        return component;
    }

    public start(frameRate: number) {
        this.stop();
        this.interval = setInterval(() => { this.frameStep() }, 1000 / frameRate);
    }

    public stop() {
        clearInterval(this.interval);
    }
    
    private frameStep() {
        this._clear();
        Object.keys(this.components).forEach(k => {
            this.components[k].update();
            this.components[k].draw(this.context);
        });
    }

    private _clear = () => {
        const { width, height } = this.canvas;
        this.context.fillStyle = this.color.fill;
        this.context.strokeStyle = this.color.stroke;
        this.context.fillRect(0, 0, width, height);
        this.context.strokeRect(0, 0, width, height);
    }
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