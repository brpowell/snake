import { Colors, Point, Color, Keys } from "../engine/types";
import { GameComponent, Input } from "../engine";
import { FoodSpawner, Food } from "./food";
import { MainScene } from '..';

export class Snake extends GameComponent {
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
            MainScene.framerate += 2;
        }

        if (this.lost) {
            if (this.snakeParts.length > 0) {
                this.snakeParts.splice(0, 1);
            } else {
                MainScene.framerate = 0;
            }
        } else {
            this.getInput();
            this.move();
            if (this.didEat()) {
                const foodSpawner = MainScene.getComponent('foodSpawner') as FoodSpawner;
                foodSpawner.foodSpawned = false;
                this.score += 1;
                if (this.score % 3 === 0 && this.score > 0) {
                    MainScene.framerate += 0.2;
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
        if (newHead.x > MainScene.width) {
            newHead.x = 0;
        } else if (newHead.x < 0) {
            newHead.x = MainScene.width - (MainScene.width % this.partWidth);
        } else if (newHead.y > MainScene.height) {
            newHead.y = 0;
        } else if (newHead.y < 0) {
            newHead.y = MainScene.height - (MainScene.height % this.partWidth);
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
        const { x: foodX, y: foodY } = (MainScene.getComponent('food') as Food).location;
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