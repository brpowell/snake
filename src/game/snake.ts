import { Colors, Point, Color, Keys } from "../engine/types";
import { GameComponent, Input } from "../engine";
import { FoodSpawner, Food } from "./food";
import { MainScene } from '..';

/**
 * The star of the show and player character
 */
export class Snake extends GameComponent {
    private bodyParts: Point[];
    private velocity: Point;
    private score: number = 0;
    private crashed: boolean = false;
    private color: Color = {
        fill: Colors.YELLOW_GREEN,
        stroke: Colors.BLACK
    };
    public readonly partWidth: number;

    constructor(startingParts: number, partWidth: number) {
        super('snake');
        this.partWidth = partWidth;
        this.bodyParts = [];
        this.velocity = { x: partWidth, y: 0 };
        for (let i = 0; i < startingParts; i++) {
            this.bodyParts.push({ x: 150 - (i * partWidth), y: 150 });
        }

        // force refresh score in case retry button was hit
        this.updateScore(0);
    }

    /** Parts of the snake */
    get parts() { return this.bodyParts; }

    public update() {
        if (this.checkCrash()) {
            // stop the snake
            this.crashed = true;
            this.velocity = { x: 0, y: 0 };
            MainScene.framerate += 2;   // make crash anim faster
        }

        if (this.crashed) {
            // crash animation
            if (this.bodyParts.length > 0) {
                this.bodyParts.splice(0, 1);
            } else {
                MainScene.framerate = 0;
            }
        } else {
            this.getInput();
            this.move();
            if (this.didEat()) {
                const foodSpawner = MainScene.getComponent('foodSpawner') as FoodSpawner;
                foodSpawner.foodSpawned = false;
                this.updateScore();
            } else {
                this.bodyParts.pop();
            }
        }
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        canvasCtx.strokeStyle = this.color.stroke;
        this.bodyParts.forEach(({ x, y }, index) => {
            canvasCtx.fillStyle = index === 0 && !this.crashed ? Colors.PINK : this.color.fill;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, this.partWidth / 2, 0, 2*Math.PI);
            canvasCtx.fill();
            canvasCtx.stroke();
        });
    }

    /**
     * Move snake. If it passes a scene boundary, wrap around to
     * the other side
     */
    private move() {
        const newHead: Point = {
            x: this.bodyParts[0].x + this.velocity.x,
            y: this.bodyParts[0].y + this.velocity.y
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
        this.bodyParts.unshift(newHead);
    }

    /**
     * Update player score by given amount, otherwise by 1
     * @param amount to update score by
     */
    private updateScore(amount: number = 1): void {
        this.score += amount;
        const score = document.getElementById('score');
        if (score) {
            score.innerHTML = `Score: ${String(this.score)}`;
        }

        // increase speed of game after every 3 food pellets
        if (this.score % 3 === 0 && this.score > 0) {
            MainScene.framerate += 0.2;
        }
    }

    /**
     * Check if snake crashed into itself
     * @returns true if snake crashed
     */
    private checkCrash(): boolean {
        const head = this.bodyParts[0];
        return this.bodyParts.slice(1).some(
            part => head.x === part.x && head.y === part.y
        );
    }

    /**
     * Check if snake ate a food pellet
     * @returns true if snake ate food
     */
    private didEat(): boolean {
        const { x: foodX, y: foodY } = (MainScene.getComponent('food') as Food).position;
        return this.bodyParts[0].x === foodX && this.bodyParts[0].y === foodY;
    }

    /**
     * Read keyboard input and change snake velocity based on it
     */
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
}