import { Input, GameComponent, Scene } from './engine';
import { Point, Keys, Colors, Color } from './engine/types'
import './styles/index.css';

let FRAMERATE = 10;

class Snake extends GameComponent {
    private snakeParts: Point[];
    private velocity: Point;
    private color: Color = {
        fill: Colors.YELLOW_GREEN,
        stroke: Colors.BLACK
    };
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
                PlayArea.setFramerate(0);
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
            const score = document.getElementById('score');
            if (score) {
                score.innerHTML = `Score: ${String(this.score)}`;
            }
        }
    }

    private move() {
        const newHead: Point = {
            x: this.snakeParts[0].x + this.velocity.x,
            y: this.snakeParts[0].y + this.velocity.y
        };
        if (newHead.x > PlayArea.width) {
            newHead.x = 0;
        } else if (newHead.x < 0) {
            newHead.x = PlayArea.width - (PlayArea.width % this.partWidth);
        } else if (newHead.y > PlayArea.height) {
            newHead.y = 0;
        } else if (newHead.y < 0) {
            newHead.y = PlayArea.height - (PlayArea.height % this.partWidth);
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
            canvasCtx.fillStyle = index === 0 && !this.lost ? Colors.PINK : this.color.fill;
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
            while (isOnSnake) {
                const foodX = this.randomCoordinate(0, PlayArea.width - pw, pw);
                const foodY = this.randomCoordinate(0, PlayArea.height - pw, pw);
                isOnSnake = snake.getParts().some(
                    part => part.x === foodX && part.y === foodY
                );
                if (!isOnSnake) {
                    PlayArea.addComponent(new Food(foodX, foodY));
                    this.foodSpawned = true;
                }
            }
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

let PlayArea: Scene;
export function startGame() {
    if (PlayArea) {
        PlayArea.destroy();
    }
    PlayArea = new Scene(400, 400);
    PlayArea.stroke = Colors.BLACK;

    const snake = new Snake(5, 15);
    PlayArea.addComponent(snake);

    const foodSpawner = new FoodSpawner();
    foodSpawner.update();
    PlayArea.addComponent(foodSpawner);

    PlayArea.start(FRAMERATE);
}

startGame();