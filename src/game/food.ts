import { GameComponent } from '../engine';
import { Snake } from './snake';
import { Point } from '../engine/types';
import { MainScene } from '..';

/**
 * A meta component responsible for spawning snake food
 */
export class FoodSpawner extends GameComponent {
    public foodSpawned: boolean = false;

    constructor() {
        super('foodSpawner');
    }

    public update() {
        if (!this.foodSpawned) {
            MainScene.addComponent(
                new Food(this.generatePosition())
            );
            this.foodSpawned = true;
        }
    }

    /**
     * Randomly generate a position for food pellet
     */
    private generatePosition(): Point {
        let x = 0;
        let y = 0;
        let isOnSnake = true;
        const { parts, partWidth: pw } = MainScene.getComponent('snake') as Snake;
        while (isOnSnake) {
            x = this.randomCoordinate(0, MainScene.width - pw, pw);
            y = this.randomCoordinate(0, MainScene.height - pw, pw);
            isOnSnake = parts.some(
                (part: Point) => part.x === x && part.y === y
            );
            if (!isOnSnake) {
                break;
            }
        }
        return { x, y };
    }

    private randomCoordinate(min: number, max: number, snakePartWidth: number): number {
        return Math.round((Math.random() * (max - min) + min) / snakePartWidth) * snakePartWidth;
    }
}

/**
 * A food pellet for snake
 */
export class Food extends GameComponent {
    public position: Point;
    
    constructor(position: Point) {
        super('food');
        this.position = position;
    }

    public draw(canvasCtx: CanvasRenderingContext2D) {
        const { partWidth } = MainScene.getComponent('snake') as Snake;
        const { x, y } = this.position;
        canvasCtx.fillStyle = 'yellow';
        canvasCtx.strokeStyle = 'black';
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, (partWidth / 2) - 2, 0, 2*Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
}